"""Complaint model with priority and auto-escalation support."""

from django.conf import settings
from django.db import models


class Complaint(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"

    class Category(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        CLEANLINESS = "cleanliness", "Cleanliness"
        SECURITY = "security", "Security"
        NOISE = "noise", "Noise"
        UTILITIES = "utilities", "Utilities"
        OTHER = "other", "Other"

    filed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="filed_complaints",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_complaints",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=15, choices=Category.choices, default=Category.OTHER
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING
    )
    image = models.ImageField(upload_to="complaints/", null=True, blank=True)
    escalated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.priority.upper()}] {self.title} — {self.get_status_display()}"
