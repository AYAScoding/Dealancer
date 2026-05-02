from rest_framework.permissions import BasePermission


class IsVerified(BasePermission):
    """User has confirmed their email"""
    message = "Please verify your email before proceeding."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified


class IsProfileComplete(BasePermission):
    """User has finished filling their profile"""
    message = "Please complete your profile before proceeding."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_profile_complete


class IsClient(BasePermission):
    """User is registered as a Client"""
    message = "Only clients can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "CLIENT"
        )


class IsFreelancer(BasePermission):
    """User is registered as a Freelancer"""
    message = "Only freelancers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "FREELANCER"
        )