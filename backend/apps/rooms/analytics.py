"""Analytics endpoints for admin dashboard charts."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from apps.complaints.models import Complaint
from apps.payments.models import Payment
from apps.rooms.models import Room


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics(request):
    """Return chart data for admin dashboard."""
    if request.user.role not in ("admin", "staff"):
        return Response({"detail": "Forbidden."}, status=403)

    # Complaints by category
    complaints_by_cat = list(
        Complaint.objects.values("category")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    # Complaints by status
    complaints_by_status = list(
        Complaint.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    # Complaints by priority
    complaints_by_priority = list(
        Complaint.objects.values("priority")
        .annotate(count=Count("id"))
        .order_by("priority")
    )

    # Room occupancy by type
    rooms_by_type = list(
        Room.objects.values("room_type")
        .annotate(count=Count("id"))
        .order_by("room_type")
    )

    # Room occupancy by status
    rooms_by_status = list(
        Room.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    # Payments by status
    payments_by_status = list(
        Payment.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    return Response({
        "complaints_by_category": complaints_by_cat,
        "complaints_by_status": complaints_by_status,
        "complaints_by_priority": complaints_by_priority,
        "rooms_by_type": rooms_by_type,
        "rooms_by_status": rooms_by_status,
        "payments_by_status": payments_by_status,
    })
