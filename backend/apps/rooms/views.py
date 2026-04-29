"""Room views."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone

from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer, BookRoomSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class RoomListView(generics.ListAPIView):
    """List all rooms. Available to any authenticated user."""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    filterset_fields = ["floor", "room_type", "status"]
    search_fields = ["number"]
    ordering_fields = ["floor", "number", "price_per_month"]


class RoomDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a room. Update restricted to admins."""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]


class RoomCreateView(generics.CreateAPIView):
    """Admin-only: create a new room."""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def book_room(request):
    """Student books a room."""
    serializer = BookRoomSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Check if user already has an active booking
    if Booking.objects.filter(user=request.user, is_active=True).exists():
        return Response(
            {"detail": "You already have an active room booking."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    room = Room.objects.get(id=serializer.validated_data["room_id"])
    booking = Booking.objects.create(user=request.user, room=room)
    room.refresh_status()

    return Response(
        BookingSerializer(booking).data, status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def checkout(request):
    """Student checks out of their room."""
    booking = Booking.objects.filter(user=request.user, is_active=True).first()
    if not booking:
        return Response(
            {"detail": "No active booking found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    booking.is_active = False
    booking.checked_out_at = timezone.now()
    booking.save()
    booking.room.refresh_status()
    return Response(BookingSerializer(booking).data)


class MyBookingView(generics.ListAPIView):
    """List current user's bookings."""
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related("room")


class AllBookingsView(generics.ListAPIView):
    """Admin: list all bookings."""
    queryset = Booking.objects.select_related("user", "room").all()
    serializer_class = BookingSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ["is_active", "room__floor"]


@api_view(["POST"])
@permission_classes([IsAdminRole])
def admin_assign_room(request):
    """Admin assigns a student to a room."""
    user_id = request.data.get("user_id")
    room_id = request.data.get("room_id")
    if not user_id or not room_id:
        return Response(
            {"detail": "user_id and room_id are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        student = User.objects.get(id=user_id, role="student")
    except User.DoesNotExist:
        return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

    if room.occupant_count >= room.capacity:
        return Response({"detail": "Room is full."}, status=status.HTTP_400_BAD_REQUEST)

    # Deactivate existing booking if any
    Booking.objects.filter(user=student, is_active=True).update(
        is_active=False, checked_out_at=timezone.now()
    )

    booking = Booking.objects.create(user=student, room=room)
    room.refresh_status()
    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
