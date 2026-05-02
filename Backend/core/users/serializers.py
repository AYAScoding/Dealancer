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
        fields = ["id", "first_name", "last_name", "email", "role", "is_verified"]
        

from .models import (
    CustomUser, FreelancerProfile, ClientProfile,
    Skill, FreelancerSkill)


# --- Skill serializer (read-only, for nested display) ---
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


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

    class Meta:
        model = FreelancerProfile
        fields = [
            "bio",
            "hourly_rate",
            "skills",       # read — returns [{id, name}, ...]
            "skill_ids",    # write — accepts [1, 2, 3]
            "portfolio_url",
            "photo",
            "availability",
            "avg_rating",
            "total_reviews",
        ]
        read_only_fields = ["avg_rating", "total_reviews"]

    def update(self, instance, validated_data):
        # Handle M2M skills separately
        skills = validated_data.pop("skills", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

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