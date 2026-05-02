from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, FreelancerProfile, ClientProfile


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.role == CustomUser.Role.FREELANCER:
        FreelancerProfile.objects.create(user=instance)
    elif instance.role == CustomUser.Role.CLIENT:
        ClientProfile.objects.create(user=instance)