"""Custom User model with roles and roommate preferences."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        ADMIN = "admin", "Admin"
        STAFF = "staff", "Staff"

    class SleepSchedule(models.TextChoices):
        EARLY = "early", "Early Bird (10PM–6AM)"
        NIGHT = "night", "Night Owl (2AM–10AM)"
        FLEXIBLE = "flexible", "Flexible"

    class Level(models.IntegerChoices):
        LOW = 1, "Low"
        MEDIUM = 2, "Medium"
        HIGH = 3, "High"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    phone = models.CharField(max_length=20, blank=True)

    # Roommate preferences (students only)
    sleep_schedule = models.CharField(
        max_length=10, choices=SleepSchedule.choices, default=SleepSchedule.FLEXIBLE
    )
    cleanliness_level = models.IntegerField(
        choices=Level.choices, default=Level.MEDIUM
    )
    noise_tolerance = models.IntegerField(
        choices=Level.choices, default=Level.MEDIUM
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
