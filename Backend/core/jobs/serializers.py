# jobs/serializers.py
from rest_framework import serializers
from .models import Job, Bid, Contract
from users.models import SkillCategory, Skill
from users.serializers import SkillCategorySerializer, SkillSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name"]


class BidSerializer(serializers.ModelSerializer):
    freelancer = serializers.StringRelatedField(read_only=True)
    freelancer_id = serializers.PrimaryKeyRelatedField(source="freelancer", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_status = serializers.CharField(source="job.status", read_only=True)

    class Meta:
        model = Bid
        fields = [
            "id", "job", "job_title", "job_status", "freelancer", "freelancer_id", "cover_letter",
            "proposed_amount", "estimated_days", "status", "created_at",
        ]
        read_only_fields = ["freelancer", "freelancer_id", "job_title", "job_status", "status", "created_at"]

    def validate(self, data):
        request = self.context["request"]
        job = data.get("job") or getattr(self.instance, "job", None)

        # Rule: Can only bid on OPEN jobs
        if job.status != Job.Status.OPEN:
            raise serializers.ValidationError("You can only bid on open jobs.")

        # Rule: Client cannot bid on their own job
        if job.client == request.user:
            raise serializers.ValidationError("You cannot bid on your own job.")

        # Rule: One bid per freelancer (belt + suspenders over DB constraint)
        existing_bid = Bid.objects.filter(job=job, freelancer=request.user)
        if self.instance:
            existing_bid = existing_bid.exclude(pk=self.instance.pk)
        if existing_bid.exists():
            raise serializers.ValidationError("You have already submitted a bid for this job.")

        return data

    def create(self, validated_data):
        validated_data["freelancer"] = self.context["request"].user
        return super().create(validated_data)


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — avoids N+1 on bids."""
    categories = SkillCategorySerializer(many=True, read_only=True)
    bid_count = serializers.IntegerField(read_only=True)  # annotated in viewset
    client_id = serializers.PrimaryKeyRelatedField(source='client', read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "categories", "budget_type",
            "budget_min", "budget_max", "status", "deadline",
            "created_at", "bid_count", "client_id",
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """Full serializer for retrieve — includes bids (clients see all, freelancers see own)."""
    categories = SkillCategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=SkillCategory.objects.all(),
        many=True,
        write_only=True,
        required=True,
        source="categories"
    )
    skills_required = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="skills_required"
    )
    bids = serializers.SerializerMethodField()
    client = serializers.StringRelatedField(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(source='client', read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "client", "client_id", "categories", "category_ids",
            "skills_required", "skill_ids", "budget_type", "budget_min", "budget_max",
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
        # 1. Budget validation
        budget_min = data.get("budget_min", getattr(self.instance, "budget_min", None))
        budget_max = data.get("budget_max", getattr(self.instance, "budget_max", None))
        if budget_min and budget_max and budget_min > budget_max:
            raise serializers.ValidationError({"budget_min": "budget_min cannot exceed budget_max."})

        # Retrieve categories and skills from input (or fallback to instance)
        categories = data.get("categories")
        if categories is None and self.instance:
            categories = list(self.instance.categories.all())
        elif categories is None:
            categories = []

        skills_required = data.get("skills_required")
        if skills_required is None and self.instance:
            skills_required = list(self.instance.skills_required.all())
        elif skills_required is None:
            skills_required = []

        # 2. Category limit check: at least 1, max 2 categories
        if len(categories) < 1:
            raise serializers.ValidationError({"category_ids": "You must select at least one job category."})
        if len(categories) > 2:
            raise serializers.ValidationError({"category_ids": "You can select a maximum of 2 job categories."})

        # 3. Skills category check: all skills must belong to the chosen categories
        category_ids_set = {c.id for c in categories}
        skills_by_category = {}
        for skill in skills_required:
            if not skill.category or skill.category.id not in category_ids_set:
                raise serializers.ValidationError({
                    "skill_ids": f"Skill '{skill.name}' does not belong to any of the chosen job categories."
                })
            skills_by_category.setdefault(skill.category.id, []).append(skill)

        # 4. Limit check: Max 5 skills per chosen category
        for cat_id, skills_in_cat in skills_by_category.items():
            if len(skills_in_cat) > 5:
                cat_name = SkillCategory.objects.get(id=cat_id).name
                raise serializers.ValidationError({
                    "skill_ids": f"You can select a maximum of 5 skills for the '{cat_name}' category."
                })

        return data

    def create(self, validated_data):
        categories = validated_data.pop("categories", [])
        skills_required = validated_data.pop("skills_required", [])
        validated_data["client"] = self.context["request"].user

        job = Job.objects.create(**validated_data)
        job.categories.set(categories)
        job.skills_required.set(skills_required)
        return job

    def update(self, instance, validated_data):
        categories = validated_data.pop("categories", None)
        skills_required = validated_data.pop("skills_required", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if categories is not None:
            instance.categories.set(categories)
        if skills_required is not None:
            instance.skills_required.set(skills_required)

        return instance


class ContractSerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(source="client", read_only=True)
    freelancer = serializers.StringRelatedField(read_only=True)
    freelancer_id = serializers.PrimaryKeyRelatedField(source="freelancer", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_status = serializers.CharField(source="job.status", read_only=True)
    bid_cover_letter = serializers.CharField(source="accepted_bid.cover_letter", read_only=True)
    estimated_days = serializers.IntegerField(source="accepted_bid.estimated_days", read_only=True)

    class Meta:
        model = Contract
        fields = [
            "id", "client", "client_id", "freelancer", "freelancer_id",
            "job", "job_title", "job_status", "accepted_bid", "bid_cover_letter",
            "estimated_days", "amount", "status", "created_at", "updated_at",
        ]
        read_only_fields = fields
