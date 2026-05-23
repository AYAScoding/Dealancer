# jobs/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Job, Bid
from users.models import SkillCategory
from .serializers import JobListSerializer, JobDetailSerializer, BidSerializer, CategorySerializer
from .permissions import IsClientOrReadOnly, IsJobOwner, IsFreelancerBidOwner
from .filters import JobFilter
from users.permissions import IsProfileComplete


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillCategory.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProfileComplete, IsClientOrReadOnly, IsJobOwner]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ["title", "description"]         # ?search=
    ordering_fields = ["created_at", "budget_max"]   # ?ordering=

    def get_queryset(self):
        # Annotate bid_count once here — used by list serializer
        return Job.objects.select_related("client") \
                          .prefetch_related("categories", "skills_required") \
                          .annotate(bid_count=Count("bids"))

    def get_serializer_class(self):
        # Use lightweight serializer for lists, full serializer for detail/write
        if self.action == "list" or self.action == "my_jobs":
            return JobListSerializer
        return JobDetailSerializer

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_jobs(self, request):
        """Return jobs posted by the authenticated client."""
        queryset = Job.objects.filter(client=request.user).select_related("client")\
            .prefetch_related("categories", "skills_required")\
            .annotate(bid_count=Count("bids"))
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = JobListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = JobListSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[IsJobOwner])
    def update_status(self, request, pk=None):
        """
        Dedicated endpoint for status transitions.
        Keeps status changes explicit and auditable — not just a PATCH to /jobs/{id}/.
        """
        job = self.get_object()
        new_status = request.data.get("status")
        
        allowed = []
        if job.status == Job.Status.OPEN:
            allowed = [Job.Status.CANCELLED]
        elif job.status == Job.Status.IN_PROGRESS:
            allowed = [Job.Status.COMPLETED, Job.Status.CANCELLED]

        if new_status not in allowed:
            return Response({"detail": f"Invalid transition from {job.status}. Allowed: {allowed}"}, status=status.HTTP_400_BAD_REQUEST)

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
        if self.action == "accept":
            return [permissions.IsAuthenticated(), IsProfileComplete()]
        return [permissions.IsAuthenticated(), IsFreelancerBidOwner(), IsProfileComplete()]


    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "CLIENT":
            return Bid.objects.filter(job__client=user).select_related("job", "freelancer")
        return Bid.objects.filter(freelancer=user).select_related("job", "freelancer")

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
            return Response({"detail": "Only pending bids can be withdrawn."}, status=status.HTTP_400_BAD_REQUEST)
        bid.status = Bid.Status.WITHDRAWN
        bid.save()
        return Response(BidSerializer(bid).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def accept(self, request, pk=None):
        """
        Client accepts a bid. Job becomes IN_PROGRESS, Bid becomes ACCEPTED.
        Other bids are REJECTED.
        """
        bid = self.get_object()
        job = bid.job

        if job.client != request.user:
            return Response({"detail": "Only the job owner can accept a bid."}, status=status.HTTP_403_FORBIDDEN)

        if job.status != Job.Status.OPEN:
            return Response({"detail": "You can only hire for an open job."}, status=status.HTTP_400_BAD_REQUEST)

        if bid.status != Bid.Status.PENDING:
            return Response({"detail": "Only pending bids can be accepted."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update job status
        job.status = Job.Status.IN_PROGRESS
        job.save()

        # 2. Update accepted bid
        bid.status = Bid.Status.ACCEPTED
        bid.save()

        # 3. Reject other bids
        Bid.objects.filter(job=job, status=Bid.Status.PENDING).exclude(id=bid.id).update(status=Bid.Status.REJECTED)

        # 4. Trigger asynchronous emails via Celery
        from .tasks import send_hiring_emails
        send_hiring_emails.delay(job.id, bid.id)

        return Response(BidSerializer(bid).data)
