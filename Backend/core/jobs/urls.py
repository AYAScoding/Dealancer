# jobs/urls.py
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, BidViewSet, CategoryViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("jobs", JobViewSet, basename="job")
router.register("bids", BidViewSet, basename="bid")

urlpatterns = router.urls