"""Room and Booking models."""

from django.conf import settings
from django.db import models


class Room(models.Model):
    class RoomType(models.TextChoices):
        SINGLE = "single", "Single"
        DOUBLE = "double", "Double"
        TRIPLE = "triple", "Triple"
        PREMIUM = "premium", "Premium Suite"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        PARTIAL = "partial", "Partially Occupied"
        OCCUPIED = "occupied", "Fully Occupied"
        MAINTENANCE = "maintenance", "Under Maintenance"

    number = models.CharField(max_length=10, unique=True)
    floor = models.PositiveIntegerField()
    room_type = models.CharField(max_length=10, choices=RoomType.choices)
    capacity = models.PositiveIntegerField(default=1)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.AVAILABLE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["floor", "number"]

    def __str__(self):
        return f"Room {self.number} ({self.get_room_type_display()})"

    @property
    def occupant_count(self):
        return self.bookings.filter(is_active=True).count()

    def refresh_status(self):
        """Update status based on current occupancy."""
        count = self.occupant_count
        if self.status == self.Status.MAINTENANCE:
            return
        if count == 0:
            self.status = self.Status.AVAILABLE
        elif count < self.capacity:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.OCCUPIED
        self.save(update_fields=["status"])


class Booking(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings"
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="bookings")
    is_active = models.BooleanField(default=True)
    booked_at = models.DateTimeField(auto_now_add=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-booked_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_active=True),
                name="one_active_booking_per_user",
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} → Room {self.room.number}"
