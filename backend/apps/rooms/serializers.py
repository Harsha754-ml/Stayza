"""Room serializers."""

from rest_framework import serializers
from apps.accounts.serializers import UserMinimalSerializer
from .models import Room, Booking


class RoomSerializer(serializers.ModelSerializer):
    occupant_count = serializers.ReadOnlyField()
    occupants = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id", "number", "floor", "room_type", "capacity",
            "price_per_month", "status", "occupant_count", "occupants",
            "created_at", "updated_at",
        ]

    def get_occupants(self, obj):
        active_bookings = obj.bookings.filter(is_active=True).select_related("user")
        return UserMinimalSerializer(
            [b.user for b in active_bookings], many=True
        ).data


class BookingSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    room_detail = RoomSerializer(source="room", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "user", "room", "room_detail",
            "is_active", "booked_at", "checked_out_at",
        ]
        read_only_fields = ["id", "user", "is_active", "booked_at", "checked_out_at"]


class BookRoomSerializer(serializers.Serializer):
    room_id = serializers.IntegerField()

    def validate_room_id(self, value):
        try:
            room = Room.objects.get(id=value)
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room not found.")
        if room.occupant_count >= room.capacity:
            raise serializers.ValidationError("Room is full.")
        if room.status == Room.Status.MAINTENANCE:
            raise serializers.ValidationError("Room is under maintenance.")
        return value
