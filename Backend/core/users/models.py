import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = "CLIENT", "Client"
        FREELANCER = "FREELANCER", "Freelancer"
        ADMIN = "ADMIN", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    username = None  # remove username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name","last_name","role"]

    role = models.CharField(max_length=20, choices=Role.choices)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
