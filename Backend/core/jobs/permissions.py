# jobs/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsClientOrReadOnly(BasePermission):
    """Only CLIENTs can create/edit jobs. Anyone authenticated can read."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == "CLIENT"


class IsJobOwner(BasePermission):
    """Only the client who posted the job can edit/delete it."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.client == request.user


class IsFreelancerBidOwner(BasePermission):
    """Freelancers can only edit/delete their own bids."""
    def has_object_permission(self, request, view, obj):
        return obj.freelancer == request.user