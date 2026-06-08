from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import CustomUser
from drf_spectacular.utils import extend_schema
from django.core import signing
import base64
from io import BytesIO
import pyotp
import qrcode

from .serializers import RegisterSerializer, UserSerializer

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .utils import email_verification_token, send_verification_email

TWO_FA_TOKEN_SALT = "dealancer.auth.2fa"
TWO_FA_TOKEN_MAX_AGE = 300


def build_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        "user": UserSerializer(user).data,
        "tokens": {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    }


def verify_totp(user, otp_code):
    if not user.totp_secret or not otp_code:
        return False
    return pyotp.TOTP(user.totp_secret).verify(str(otp_code).strip(), valid_window=1)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        from django.conf import settings
        if settings.DEBUG:
            user.is_verified = True
            user.save()
            
        try:
            send_verification_email(user, request)
        except Exception:
            pass

        return Response(
            {"message": "Account created. Please verify your email." if not user.is_verified else "Account created and verified automatically (Debug Mode)."},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_verified:
            return Response(
               {"error": "Please verify your email before logging in."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.is_2fa_enabled:
            ephemeral_token = signing.dumps({"user_id": str(user.id)}, salt=TWO_FA_TOKEN_SALT)
            return Response(
                {"requires_2fa": True, "ephemeral_token": ephemeral_token},
                status=status.HTTP_200_OK
            )

        return Response(build_auth_response(user), status=status.HTTP_200_OK)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        # Decode the user pk
        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_pk)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check the token is valid for this user
        if not email_verification_token.check_token(user, token):
            # If the link is invalid but the user is ALREADY verified,
            # don't show an error. It likely means they clicked it twice
            # or the request was re-transmitted.
            if user.is_verified:
                return Response(
                    {"message": "Email is already verified. You can log in."},
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {"error": "Verification link is invalid or has already been used."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # All good — verify the user
        user.is_verified = True
        user.save()

        return Response(
            {"message": "Email verified successfully. You can now log in."},
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully."},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    """Returns the currently authenticated user's info"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class TwoFactorStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"is_2fa_enabled": request.user.is_2fa_enabled})


class TwoFactorSetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.is_2fa_enabled:
            return Response(
                {"detail": "Two-factor authentication is already enabled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        secret = pyotp.random_base32()
        request.user.totp_secret = secret
        request.user.is_2fa_enabled = False
        request.user.save(update_fields=["totp_secret", "is_2fa_enabled"])

        issuer = "Dealancer"
        account_name = request.user.email
        provisioning_uri = pyotp.TOTP(secret).provisioning_uri(
            name=account_name,
            issuer_name=issuer,
        )

        image = qrcode.make(provisioning_uri)
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        qr_code = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return Response({
            "secret": secret,
            "qr_code": qr_code,
        })


class TwoFactorVerifySetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp_code = request.data.get("otp_code")
        if not verify_totp(request.user, otp_code):
            return Response({"detail": "Invalid authentication code."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.is_2fa_enabled = True
        request.user.save(update_fields=["is_2fa_enabled"])
        return Response({"is_2fa_enabled": True})


class TwoFactorConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ephemeral_token = request.data.get("ephemeral_token")
        otp_code = request.data.get("otp_code")

        try:
            payload = signing.loads(ephemeral_token, salt=TWO_FA_TOKEN_SALT, max_age=TWO_FA_TOKEN_MAX_AGE)
            user = CustomUser.objects.get(id=payload.get("user_id"))
        except signing.SignatureExpired:
            return Response({"detail": "Session expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (signing.BadSignature, CustomUser.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "Invalid two-factor session."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_2fa_enabled:
            return Response({"detail": "Two-factor authentication is not enabled."}, status=status.HTTP_400_BAD_REQUEST)

        if not verify_totp(user, otp_code):
            return Response({"detail": "Invalid authentication code."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(build_auth_response(user), status=status.HTTP_200_OK)


class TwoFactorDisableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp_code = request.data.get("otp_code")
        if not request.user.is_2fa_enabled:
            return Response({"is_2fa_enabled": False})

        if not verify_totp(request.user, otp_code):
            return Response({"detail": "Invalid authentication code."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.totp_secret = None
        request.user.is_2fa_enabled = False
        request.user.save(update_fields=["totp_secret", "is_2fa_enabled"])
        return Response({"is_2fa_enabled": False})
    

from .models import FreelancerProfile, ClientProfile
from .serializers import FreelancerProfileSerializer, ClientProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import generics, status


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch"]  # block PUT
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # support photo upload

    def get_object(self):
        user = self.request.user
        if user.role == "FREELANCER":
            profile, created = FreelancerProfile.objects.prefetch_related("skills").get_or_create(user=user)
            return profile
        profile, created = ClientProfile.objects.get_or_create(user=user)
        return profile


    def get_serializer_class(self):
        user = self.request.user
        if user.role == "FREELANCER":
            return FreelancerProfileSerializer
        return ClientProfileSerializer

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)
