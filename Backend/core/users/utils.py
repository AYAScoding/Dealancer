from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Token is invalidated once is_verified becomes True
        # because the hash value will change
        return f"{user.pk}{timestamp}{user.is_verified}"


email_verification_token = EmailVerificationTokenGenerator()



def send_verification_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    # Build the verification link
    verification_link = f"http://127.0.0.1:8000/api/auth/verify-email/{uid}/{token}/"

    send_mail(
        subject="Verify your Dealancer account",
        message=f"""
Hi {user.first_name},

Please verify your email by clicking the link below:

{verification_link}

This link will expire once used.

If you didn't create an account, ignore this email.

— The Dealancer Team
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )