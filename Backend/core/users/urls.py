from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, MeView, VerifyEmailView, ProfileView,
    TwoFactorStatusView, TwoFactorSetupView, TwoFactorVerifySetupView,
    TwoFactorConfirmView, TwoFactorDisableView,
)
from .password_reset import PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("verify-email/<str:uid>/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("me/profile/", ProfileView.as_view(), name="profile"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("2fa/status/", TwoFactorStatusView.as_view(), name="2fa-status"),
    path("2fa/setup/", TwoFactorSetupView.as_view(), name="2fa-setup"),
    path("2fa/verify-setup/", TwoFactorVerifySetupView.as_view(), name="2fa-verify-setup"),
    path("2fa/confirm/", TwoFactorConfirmView.as_view(), name="2fa-confirm"),
    path("2fa/disable/", TwoFactorDisableView.as_view(), name="2fa-disable"),


]
