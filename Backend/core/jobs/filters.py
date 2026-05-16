# jobs/filters.py
import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):
    # Budget range overlap — find jobs where any part of client budget matches
    min_budget = django_filters.NumberFilter(field_name="budget_max", lookup_expr="gte")
    max_budget = django_filters.NumberFilter(field_name="budget_min", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category__slug")
    skill = django_filters.CharFilter(field_name="skills_required__name", lookup_expr="icontains")
    deadline_before = django_filters.DateFilter(field_name="deadline", lookup_expr="lte")
    deadline_after = django_filters.DateFilter(field_name="deadline", lookup_expr="gte")

    class Meta:
        model = Job
        fields = ["status", "budget_type", "category", "skill", "min_budget", "max_budget"]