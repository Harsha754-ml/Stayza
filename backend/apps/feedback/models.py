"""
Roommate Feedback model.

When a student checks out, they can rate each roommate they shared a room with.
These ratings feed back into the roommate matching algorithm as a reputation score.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class RoommateFeedback(models.Model):
    """A rating left by one student about a former roommate."""

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="feedback_given",
        help_text="The student who is leaving the feedback.",
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="feedback_received",
        help_text="The roommate being rated.",
    )
    booking = models.ForeignKey(
        "rooms.Booking",
        on_delete=models.CASCADE,
        related_name="feedback",
        help_text="The booking during which they were roommates.",
    )

    # Rating dimensions (1–5 stars)
    cleanliness_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How clean was this roommate? 1=terrible, 5=spotless",
    )
    noise_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How respectful of noise levels? 1=very loud, 5=very quiet",
    )
    overall_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Overall experience living with this person.",
    )
    comment = models.TextField(
        blank=True,
        help_text="Optional written feedback.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["reviewer", "reviewee", "booking"],
                name="one_feedback_per_roommate_per_booking",
            )
        ]

    def __str__(self):
        return (
            f"{self.reviewer.get_full_name()} → {self.reviewee.get_full_name()} "
            f"({self.overall_rating}★)"
        )

    @property
    def average_rating(self):
        return round(
            (self.cleanliness_rating + self.noise_rating + self.overall_rating) / 3.0,
            1,
        )
