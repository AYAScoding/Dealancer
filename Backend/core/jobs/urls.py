# jobs/urls.py
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, BidViewSet, CategoryViewSet, ContractViewSet
from rest_framework import viewsets
from users.models import Skill, SkillCategory
from users.serializers import SkillSerializer
from rest_framework import serializers

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name"]

class SkillModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("jobs", JobViewSet, basename="job")
router.register("bids", BidViewSet, basename="bid")
router.register("contracts", ContractViewSet, basename="contract")
router.register("skills", SkillModelViewSet, basename="skill")
router.register("skill-categories", SkillCategoryViewSet, basename="skill-category")

urlpatterns = router.urls
