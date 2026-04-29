"""Account views: register, profile, roommate matching."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LoginView(TokenObtainPairView):
    """Override to include user data in login response."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from rest_framework_simplejwt.tokens import AccessToken

            token = AccessToken(response.data["access"])
            user = User.objects.get(id=token["user_id"])
            response.data["user"] = UserSerializer(user).data
        return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def roommate_matches(request):
    """
    Return scored roommate matches for the current student.

    Score formula (updated with feedback reputation):
      base_score = (sleep_match + cleanliness_match + noise_match) / 3
      reputation  = avg feedback rating normalized to 0-1 (or 0.5 if no feedback)
      final_score = base_score * 0.7 + reputation * 0.3

    This means 70% of the score comes from preference compatibility and
    30% comes from how past roommates rated this person.
    """
    user = request.user
    if user.role != "student":
        return Response(
            {"detail": "Only students can use roommate matching."},
            status=status.HTTP_403_FORBIDDEN,
        )

    from apps.feedback.models import RoommateFeedback
    from django.db.models import Avg

    candidates = User.objects.filter(role="student").exclude(id=user.id)
    results = []

    for candidate in candidates:
        # Sleep match: 0 or 1 (same or flexible = match)
        sleep_match = 1.0 if (
            user.sleep_schedule == candidate.sleep_schedule
            or candidate.sleep_schedule == "flexible"
            or user.sleep_schedule == "flexible"
        ) else 0.0

        # Cleanliness match: 1 - |diff| / 2  (range 0-1)
        cleanliness_match = 1.0 - abs(
            user.cleanliness_level - candidate.cleanliness_level
        ) / 2.0

        # Noise match: 1 - |diff| / 2  (range 0-1)
        noise_match = 1.0 - abs(
            user.noise_tolerance - candidate.noise_tolerance
        ) / 2.0

        base_score = (sleep_match + cleanliness_match + noise_match) / 3.0

        # Reputation from feedback (0-1 scale, default 0.5 if no reviews)
        feedback_agg = RoommateFeedback.objects.filter(
            reviewee=candidate
        ).aggregate(
            avg_clean=Avg("cleanliness_rating"),
            avg_noise=Avg("noise_rating"),
            avg_overall=Avg("overall_rating"),
        )
        feedback_count = RoommateFeedback.objects.filter(reviewee=candidate).count()

        if feedback_count > 0:
            # Normalize from 1-5 scale to 0-1
            avg_all = (
                (feedback_agg["avg_clean"] or 3)
                + (feedback_agg["avg_noise"] or 3)
                + (feedback_agg["avg_overall"] or 3)
            ) / 3.0
            reputation = (avg_all - 1) / 4.0  # maps 1→0, 5→1
        else:
            reputation = 0.5  # neutral default

        # Final weighted score: 70% compatibility + 30% reputation
        final_score = round((base_score * 0.7 + reputation * 0.3) * 100, 1)

        results.append({
            "user": UserSerializer(candidate).data,
            "score": final_score,
            "breakdown": {
                "sleep_match": round(sleep_match * 100, 1),
                "cleanliness_match": round(cleanliness_match * 100, 1),
                "noise_match": round(noise_match * 100, 1),
                "reputation": round(reputation * 100, 1),
            },
            "feedback_count": feedback_count,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return Response(results)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def staff_list(request):
    """List all staff/admin users. Available to admin/staff roles."""
    if request.user.role not in ("admin", "staff"):
        return Response(
            {"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN
        )
    staff_users = User.objects.filter(role__in=["staff", "admin"])
    return Response(UserSerializer(staff_users, many=True).data)
