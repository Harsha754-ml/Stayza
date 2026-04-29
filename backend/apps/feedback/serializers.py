"""Feedback serializers."""

from rest_framework import serializers
from apps.accounts.serializers import UserMinimalSerializer
from .models import RoommateFeedback


class FeedbackSerializer(serializers.ModelSerializer):
    reviewer_detail = UserMinimalSerializer(source="reviewer", read_only=True)
    reviewee_detail = UserMinimalSerializer(source="reviewee", read_only=True)
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = RoommateFeedback
        fields = [
            "id",
            "reviewer",
            "reviewer_detail",
            "reviewee",
            "reviewee_detail",
            "booking",
            "cleanliness_rating",
            "noise_rating",
            "overall_rating",
            "comment",
            "average_rating",
            "created_at",
        ]
        read_only_fields = ["id", "reviewer", "created_at"]


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoommateFeedback
        fields = [
            "reviewee",
            "booking",
            "cleanliness_rating",
            "noise_rating",
            "overall_rating",
            "comment",
        ]

    def validate(self, data):
        reviewer = self.context["request"].user

        # Can't review yourself
        if data["reviewee"].id == reviewer.id:
            raise serializers.ValidationError("You cannot review yourself.")

        # Verify they actually shared a room during this booking
        booking = data["booking"]
        if booking.user != reviewer:
            raise serializers.ValidationError(
                "This booking does not belong to you."
            )

        # Check the reviewee was in the same room during overlapping time
        from apps.rooms.models import Booking

        reviewee_was_roommate = Booking.objects.filter(
            user=data["reviewee"],
            room=booking.room,
        ).exists()

        if not reviewee_was_roommate:
            raise serializers.ValidationError(
                "This person was not your roommate in this room."
            )

        # Check for duplicate
        if RoommateFeedback.objects.filter(
            reviewer=reviewer,
            reviewee=data["reviewee"],
            booking=booking,
        ).exists():
            raise serializers.ValidationError(
                "You have already submitted feedback for this roommate for this booking."
            )

        return data

    def create(self, validated_data):
        validated_data["reviewer"] = self.context["request"].user
        return super().create(validated_data)
