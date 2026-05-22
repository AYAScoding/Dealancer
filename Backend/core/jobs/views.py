# jobs/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Job, Bid, Category
from .serializers import JobListSerializer, JobDetailSerializer, BidSerializer, CategorySerializer
from .permissions import IsClientOrReadOnly, IsJobOwner, IsFreelancerBidOwner
from .filters import JobFilter
from users.permissions import IsProfileComplete


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileComplete]


class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProfileComplete, IsClientOrReadOnly, IsJobOwner]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ["title", "description"]         # ?search=
    ordering_fields = ["created_at", "budget_max"]   # ?ordering=

    def get_queryset(self):
        # Annotate bid_count once here — used by list serializer
        return Job.objects.select_related("client", "category") \
                          .prefetch_related("skills_required") \
                          .annotate(bid_count=Count("bids"))

    def get_serializer_class(self):
        # Use lightweight serializer for lists, full serializer for detail/write
        if self.action == "list":
            return JobListSerializer
        return JobDetailSerializer

    @action(detail=True, methods=["patch"], permission_classes=[IsJobOwner])
    def update_status(self, request, pk=None):
        """
        Dedicated endpoint for status transitions.
        Keeps status changes explicit and auditable — not just a PATCH to /jobs/{id}/.
        """
        job = self.get_object()
        new_status = request.data.get("status")
        allowed = [Job.Status.CANCELLED]  # Client can cancel. More transitions added in Phase 2.

        if new_status not in allowed:
            return Response({"detail": f"Invalid transition. Allowed: {allowed}"}, status=400)

        job.status = new_status
        job.save()
        return Response(JobDetailSerializer(job, context={"request": request}).data)


class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    http_method_names = ["get", "post", "patch", "delete"]  # No PUT — partial updates only

    def get_permissions(self):
        if self.action == "create":
            # Only freelancers can create bids
            return [permissions.IsAuthenticated(), IsProfileComplete()]
        return [permissions.IsAuthenticated(), IsFreelancerBidOwner(), IsProfileComplete()]


    def get_queryset(self):
        return Bid.objects.filter(freelancer=self.request.user) \
                          .select_related("job", "freelancer")

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "FREELANCER":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only freelancers can submit bids.")
        serializer.save()

    @action(detail=True, methods=["patch"])
    def withdraw(self, request, pk=None):
        """Freelancer withdraws their bid — sets status to WITHDRAWN instead of deleting."""
        bid = self.get_object()
        if bid.status != Bid.Status.PENDING:
            return Response({"detail": "Only pending bids can be withdrawn."}, status=400)
        bid.status = Bid.Status.WITHDRAWN
        bid.save()
        return Response(BidSerializer(bid).data)