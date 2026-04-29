"""Complaint serializers."""

from rest_framework import serializers
from apps.accounts.serializers import UserMinimalSerializer
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    filed_by_detail = UserMinimalSerializer(source="filed_by", read_only=True)
    assigned_to_detail = UserMinimalSerializer(source="assigned_to", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            "id", "filed_by", "filed_by_detail",
            "assigned_to", "assigned_to_detail",
            "title", "description", "category",
            "priority", "status", "image", "image_url",
            "escalated", "created_at", "updated_at", "resolved_at",
        ]
        read_only_fields = [
            "id", "filed_by", "escalated",
            "created_at", "updated_at", "resolved_at",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["title", "description", "category", "priority", "image"]
