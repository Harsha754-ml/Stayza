"""Payment serializers."""

from rest_framework import serializers
from apps.accounts.serializers import UserMinimalSerializer
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    user_detail = UserMinimalSerializer(source="user", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "user", "user_detail", "amount", "month",
            "status", "method", "due_date", "paid_date",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["amount", "month", "due_date"]


class MarkPaidSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=Payment.Method.choices)
