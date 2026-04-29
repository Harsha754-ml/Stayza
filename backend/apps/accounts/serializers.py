"""Account serializers."""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "password",
            "first_name", "last_name", "role", "phone",
            "sleep_schedule", "cleanliness_level", "noise_tolerance",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    reputation = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "full_name", "role", "phone",
            "sleep_schedule", "cleanliness_level", "noise_tolerance",
            "reputation",
        ]
        read_only_fields = ["id", "username", "email", "role"]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_reputation(self, obj):
        from apps.feedback.models import RoommateFeedback
        from django.db.models import Avg

        feedback = RoommateFeedback.objects.filter(reviewee=obj)
        count = feedback.count()
        if count == 0:
            return {"score": None, "count": 0}
        aggs = feedback.aggregate(
            avg_overall=Avg("overall_rating"),
        )
        return {
            "score": round(aggs["avg_overall"], 1) if aggs["avg_overall"] else None,
            "count": count,
        }


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight serializer for nested references."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "role"]

    def get_full_name(self, obj):
        return obj.get_full_name()
