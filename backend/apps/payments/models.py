"""Payment model for tracking rent payments."""

from django.conf import settings
from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PAID = "paid", "Paid"
        PENDING = "pending", "Pending"
        OVERDUE = "overdue", "Overdue"

    class Method(models.TextChoices):
        CARD = "card", "Credit/Debit Card"
        UPI = "upi", "UPI"
        NETBANKING = "netbanking", "Net Banking"
        CASH = "cash", "Cash"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20, help_text="e.g. May 2026")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    method = models.CharField(
        max_length=15, choices=Method.choices, blank=True
    )
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-due_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "month"],
                name="one_payment_per_user_per_month",
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.month} — {self.get_status_display()}"
