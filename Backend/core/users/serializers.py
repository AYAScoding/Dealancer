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