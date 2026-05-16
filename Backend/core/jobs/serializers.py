# jobs/serializers.py
from rest_framework import serializers
from .models import Job, Bid, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class BidSerializer(serializers.ModelSerializer):
    freelancer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Bid
        fields = [
            "id", "job", "freelancer", "cover_letter",
            "proposed_amount", "estimated_days", "status", "created_at",
        ]
        read_only_fields = ["freelancer", "status", "created_at"]

    def validate(self, data):
        request = self.context["request"]
        job = data["job"]

        # Rule: Can only bid on OPEN jobs
        if job.status != Job.Status.OPEN:
            raise serializers.ValidationError("You can only bid on open jobs.")

        # Rule: Client cannot bid on their own job
        if job.client == request.user:
            raise serializers.ValidationError("You cannot bid on your own job.")

        # Rule: One bid per freelancer (belt + suspenders over DB constraint)
        if Bid.objects.filter(job=job, freelancer=request.user).exists():
            raise serializers.ValidationError("You have already submitted a bid for this job.")

        return data

    def create(self, validated_data):
        validated_data["freelancer"] = self.context["request"].user
        return super().create(validated_data)


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — avoids N+1 on bids."""
    category = CategorySerializer(read_only=True)
    bid_count = serializers.IntegerField(read_only=True)  # annotated in viewset

    class Meta:
        model = Job
        fields = [
            "id", "title", "category", "budget_type",
            "budget_min", "budget_max", "status", "deadline",
            "created_at", "bid_count",
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """Full serializer for retrieve — includes bids (clients see all, freelancers see own)."""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False
    )
    bids = serializers.SerializerMethodField()
    client = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "client", "category", "category_id",
            "skills_required", "budget_type", "budget_min", "budget_max",
            "deadline", "status", "bids", "created_at", "updated_at",
        ]
        read_only_fields = ["client", "status", "created_at", "updated_at"]

    def get_bids(self, obj):
        request = self.context["request"]
        user = request.user
        # Clients see all bids on their job; freelancers see only their own bid
        if obj.client == user:
            bids = obj.bids.all()
        else:
            bids = obj.bids.filter(freelancer=user)
        return BidSerializer(bids, many=True, context=self.context).data

    def validate(self, data):
        budget_min = data.get("budget_min", getattr(self.instance, "budget_min", None))
        budget_max = data.get("budget_max", getattr(self.instance, "budget_max", None))
        if budget_min and budget_max and budget_min > budget_max:
            raise serializers.ValidationError("budget_min cannot exceed budget_max.")
        return data

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)