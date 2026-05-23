from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "email", "role", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Used to return user info after login / in protected endpoints"""
    class Meta:
        model = CustomUser
        fields = ["id", "first_name", "last_name", "email", "role", "is_verified", "is_profile_complete"]
        

from .models import (
    CustomUser, FreelancerProfile, ClientProfile,
    Skill, FreelancerSkill, SkillCategory)


# --- SkillCategory serializer ---
class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name"]


# --- Skill serializer (read-only, for nested display) ---
class SkillSerializer(serializers.ModelSerializer):
    category = SkillCategorySerializer(read_only=True)

    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


# --- Freelancer Profile ---
class FreelancerProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="skills"
    )
    categories = SkillCategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=SkillCategory.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="categories"
    )

    class Meta:
        model = FreelancerProfile
        fields = [
            "bio",
            "hourly_rate",
            "skills",       # read — returns [{id, name}, ...]
            "skill_ids",    # write — accepts [1, 2, 3]
            "categories",   # read — returns [{id, name}, ...]
            "category_ids", # write — accepts [1, 2, 3]
            "portfolio_url",
            "photo",
            "availability",
            "avg_rating",
            "total_reviews",
        ]
        read_only_fields = ["avg_rating", "total_reviews"]

    def validate(self, data):
        # Retrieve categories and skills from input (or fallback to instance)
        categories = data.get("categories")
        if categories is None and self.instance:
            categories = list(self.instance.categories.all())
        elif categories is None:
            categories = []

        skills = data.get("skills")
        if skills is None and self.instance:
            skills = list(self.instance.skills.all())
        elif skills is None:
            skills = []

        # 1. Limit Check: Max 3 skill categories
        if len(categories) > 3:
            raise serializers.ValidationError({"category_ids": "You can choose a maximum of 3 distinct skill categories."})

        # 2. Check that all skills belong to the selected categories
        category_ids_set = {c.id for c in categories}
        skills_by_category = {}
        for skill in skills:
            if not skill.category or skill.category.id not in category_ids_set:
                raise serializers.ValidationError({
                    "skill_ids": f"Skill '{skill.name}' does not belong to any of your selected categories."
                })
            skills_by_category.setdefault(skill.category.id, []).append(skill)

        # 3. Limit Check: Max 5 skills per chosen category
        for cat_id, skills_in_cat in skills_by_category.items():
            if len(skills_in_cat) > 5:
                cat_name = SkillCategory.objects.get(id=cat_id).name
                raise serializers.ValidationError({
                    "skill_ids": f"You can choose a maximum of 5 skills for the '{cat_name}' category."
                })

        return data

    def update(self, instance, validated_data):
        # Handle M2M skills and categories separately
        skills = validated_data.pop("skills", None)
        categories = validated_data.pop("categories", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        if skills is not None:
            # Replace existing skills entirely
            FreelancerSkill.objects.filter(freelancer=instance).delete()
            FreelancerSkill.objects.bulk_create([
                FreelancerSkill(freelancer=instance, skill=skill)
                for skill in skills
            ])

        return instance


# --- Client Profile ---
class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = [
            "company_name",
            "industry",
            "website",
            "photo",
        ]