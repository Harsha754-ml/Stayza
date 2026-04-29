"""Feedback views."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg
from django.contrib.auth import get_user_model

from .models import RoommateFeedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer

User = get_user_model()


class FeedbackCreateView(generics.CreateAPIView):
    """Student submits feedback about a former roommate."""

    serializer_class = FeedbackCreateSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class MyGivenFeedbackView(generics.ListAPIView):
    """Feedback I have given to others."""

    serializer_class = FeedbackSerializer

    def get_queryset(self):
        return RoommateFeedback.objects.filter(
            reviewer=self.request.user
        ).select_related("reviewer", "reviewee", "booking")


class MyReceivedFeedbackView(generics.ListAPIView):
    """Feedback others have given about me."""

    serializer_class = FeedbackSerializer

    def get_queryset(self):
        return RoommateFeedback.objects.filter(
            reviewee=self.request.user
        ).select_related("reviewer", "reviewee", "booking")


class AllFeedbackView(generics.ListAPIView):
    """Admin: view all feedback."""

    serializer_class = FeedbackSerializer
    queryset = RoommateFeedback.objects.select_related(
        "reviewer", "reviewee", "booking"
    ).all()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role not in ("admin", "staff"):
            self.permission_denied(request)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def pending_feedback(request):
    """
    Return roommates the current user hasn't reviewed yet.
    Only considers checked-out bookings (so feedback is given at departure).
    """
    user = request.user
    from apps.rooms.models import Booking

    # Get all of this user's completed (checked-out) bookings
    my_past_bookings = Booking.objects.filter(
        user=user, is_active=False, checked_out_at__isnull=False
    ).select_related("room")

    pending = []
    for booking in my_past_bookings:
        # Find other students who had a booking in the same room
        roommate_bookings = Booking.objects.filter(
            room=booking.room,
        ).exclude(user=user).select_related("user")

        for rb in roommate_bookings:
            # Check if feedback already given
            already_reviewed = RoommateFeedback.objects.filter(
                reviewer=user,
                reviewee=rb.user,
                booking=booking,
            ).exists()

            if not already_reviewed:
                from apps.accounts.serializers import UserMinimalSerializer

                pending.append({
                    "booking_id": booking.id,
                    "room_number": booking.room.number,
                    "roommate": UserMinimalSerializer(rb.user).data,
                    "checked_out_at": booking.checked_out_at,
                })

    return Response(pending)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_reputation(request, user_id):
    """Get aggregated reputation scores for a specific user."""
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
        )

    feedback = RoommateFeedback.objects.filter(reviewee=target)
    count = feedback.count()

    if count == 0:
        return Response({
            "user_id": user_id,
            "feedback_count": 0,
            "avg_cleanliness": None,
            "avg_noise": None,
            "avg_overall": None,
            "reputation_score": None,
        })

    aggs = feedback.aggregate(
        avg_cleanliness=Avg("cleanliness_rating"),
        avg_noise=Avg("noise_rating"),
        avg_overall=Avg("overall_rating"),
    )

    reputation = round(
        (
            (aggs["avg_cleanliness"] or 0)
            + (aggs["avg_noise"] or 0)
            + (aggs["avg_overall"] or 0)
        )
        / 3.0,
        2,
    )

    return Response({
        "user_id": user_id,
        "feedback_count": count,
        "avg_cleanliness": round(aggs["avg_cleanliness"], 2),
        "avg_noise": round(aggs["avg_noise"], 2),
        "avg_overall": round(aggs["avg_overall"], 2),
        "reputation_score": reputation,
    })
