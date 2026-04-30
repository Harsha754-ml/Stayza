"""Simple notification system — stored in-memory per session for hackathon demo.
For production, this would be a database model."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Generate contextual notifications based on user's actual data."""
    user = request.user
    notifications = []
    now = timezone.now()

    if user.role == "student":
        # Check for active complaints
        from apps.complaints.models import Complaint
        active = Complaint.objects.filter(filed_by=user, status__in=["pending", "in_progress"])
        for c in active[:3]:
            hours_ago = (now - c.updated_at).total_seconds() / 3600
            if c.status == "in_progress":
                notifications.append({
                    "id": f"complaint-{c.id}",
                    "type": "complaint_update",
                    "title": f"Complaint #{c.id} is being worked on",
                    "message": f'"{c.title}" has been assigned to staff.',
                    "time": c.updated_at.isoformat(),
                    "read": hours_ago > 24,
                })
            elif c.status == "pending" and hours_ago > 24:
                notifications.append({
                    "id": f"complaint-pending-{c.id}",
                    "type": "complaint_pending",
                    "title": f"Complaint #{c.id} still pending",
                    "message": f'"{c.title}" — auto-escalation in {max(0, 48 - int(hours_ago))}h.',
                    "time": c.created_at.isoformat(),
                    "read": False,
                })

        # Check for pending payments
        from apps.payments.models import Payment
        pending = Payment.objects.filter(user=user, status__in=["pending", "overdue"])
        for p in pending[:2]:
            notifications.append({
                "id": f"payment-{p.id}",
                "type": "payment_due",
                "title": f"Payment due: {p.month}",
                "message": f"₹{p.amount} due by {p.due_date}",
                "time": p.created_at.isoformat(),
                "read": False,
            })

        # Check for pending feedback
        from apps.rooms.models import Booking
        from apps.feedback.models import RoommateFeedback
        past_bookings = Booking.objects.filter(
            user=user, is_active=False, checked_out_at__isnull=False
        ).select_related("room")[:5]
        for booking in past_bookings:
            roommates = Booking.objects.filter(
                room=booking.room
            ).exclude(user=user).select_related("user")
            for rb in roommates:
                if not RoommateFeedback.objects.filter(
                    reviewer=user, reviewee=rb.user, booking=booking
                ).exists():
                    notifications.append({
                        "id": f"feedback-{booking.id}-{rb.user.id}",
                        "type": "feedback_pending",
                        "title": "Rate your roommate",
                        "message": f"How was living with {rb.user.get_full_name()}?",
                        "time": booking.checked_out_at.isoformat(),
                        "read": False,
                    })

        # Welcome notification
        if user.date_joined and (now - user.date_joined).days < 7:
            notifications.append({
                "id": "welcome",
                "type": "welcome",
                "title": "Welcome to Stayza!",
                "message": "Set your roommate preferences and book a room to get started.",
                "time": user.date_joined.isoformat(),
                "read": True,
            })

    elif user.role in ("admin", "staff"):
        from apps.complaints.models import Complaint
        escalated = Complaint.objects.filter(escalated=True, status__in=["pending", "in_progress"])
        for c in escalated[:3]:
            notifications.append({
                "id": f"escalated-{c.id}",
                "type": "escalated",
                "title": f"Escalated: #{c.id}",
                "message": f'"{c.title}" needs immediate attention.',
                "time": c.updated_at.isoformat(),
                "read": False,
            })

        unassigned = Complaint.objects.filter(assigned_to__isnull=True, status="pending")
        if unassigned.count() > 0:
            notifications.append({
                "id": "unassigned",
                "type": "unassigned",
                "title": f"{unassigned.count()} unassigned complaints",
                "message": "Assign staff to handle these issues.",
                "time": now.isoformat(),
                "read": False,
            })

        from apps.payments.models import Payment
        overdue = Payment.objects.filter(status="overdue").count()
        if overdue > 0:
            notifications.append({
                "id": "overdue-payments",
                "type": "overdue",
                "title": f"{overdue} overdue payments",
                "message": "Send reminders to students with overdue rent.",
                "time": now.isoformat(),
                "read": False,
            })

    notifications.sort(key=lambda n: n["time"], reverse=True)
    unread = sum(1 for n in notifications if not n["read"])

    return Response({
        "notifications": notifications[:10],
        "unread_count": unread,
    })
