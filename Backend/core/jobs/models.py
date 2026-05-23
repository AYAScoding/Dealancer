from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """
    Flat category list for jobs (e.g. "Web Development", "Design").
    Kept simple intentionally — a nested tree adds complexity with little
    early-stage benefit. Easy to extend later with a parent FK.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Job(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    class BudgetType(models.TextChoices):
        FIXED = "FIXED", "Fixed Price"
        HOURLY = "HOURLY", "Hourly Rate"

    # Ownership
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posted_jobs",
        # We store the User, not ClientProfile, so JWT identity maps directly.
        # ClientProfile is reachable via user.client_profile.
    )

    # Core fields
    title = models.CharField(max_length=255)
    description = models.TextField()
    from users.models import SkillCategory

    categories = models.ManyToManyField(
        SkillCategory,
        blank=True,
        related_name="jobs",
    )
    skills_required = models.ManyToManyField(
        "users.Skill",  # Reuse the Skill model from your existing skill system
        blank=True,
        related_name="jobs",
    )

    # Budget
    budget_type = models.CharField(max_length=10, choices=BudgetType.choices, default=BudgetType.FIXED)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    # Timeline
    deadline = models.DateField(null=True, blank=True)

    # State machine
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Bid(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="bids")
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_bids",
    )

    # Proposal content
    cover_letter = models.TextField()
    proposed_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    estimated_days = models.PositiveIntegerField()

    # State
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Critical: one bid per freelancer per job
        unique_together = [("job", "freelancer")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Bid by {self.freelancer} on {self.job}"


class Contract(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_contracts",
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freelancer_contracts",
    )
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name="contract")
    accepted_bid = models.OneToOneField(Bid, on_delete=models.PROTECT, related_name="contract")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Contract for {self.job}"
