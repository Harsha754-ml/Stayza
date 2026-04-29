"""Complaint views."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "staff")


class ComplaintCreateView(generics.CreateAPIView):
    """Student files a new complaint."""
    serializer_class = ComplaintCreateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(filed_by=self.request.user)


class MyComplaintsView(generics.ListAPIView):
    """Student views their own complaints."""
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(filed_by=self.request.user)


class AllComplaintsView(generics.ListAPIView):
    """Admin/Staff views all complaints."""
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrStaff]
    filterset_fields = ["priority", "status", "category", "assigned_to"]
    search_fields = ["title", "description"]
    ordering_fields = ["priority", "created_at", "updated_at"]

    def get_queryset(self):
        return Complaint.objects.select_related("filed_by", "assigned_to").all()


class ComplaintDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a complaint."""
    serializer_class = ComplaintSerializer
    queryset = Complaint.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminOrStaff()]

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == "resolved" and not instance.resolved_at:
            instance.resolved_at = timezone.now()
            instance.save(update_fields=["resolved_at"])


@api_view(["POST"])
@permission_classes([IsAdminOrStaff])
def assign_complaint(request, pk):
    """Admin assigns a complaint to a staff member."""
    try:
        complaint = Complaint.objects.get(pk=pk)
    except Complaint.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    staff_id = request.data.get("staff_id")
    if not staff_id:
        return Response(
            {"detail": "staff_id is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        staff_user = User.objects.get(id=staff_id, role__in=["staff", "admin"])
    except User.DoesNotExist:
        return Response(
            {"detail": "Staff member not found."}, status=status.HTTP_404_NOT_FOUND
        )

    complaint.assigned_to = staff_user
    if complaint.status == "pending":
        complaint.status = "in_progress"
    complaint.save()
    return Response(ComplaintSerializer(complaint, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAdminOrStaff])
def resolve_complaint(request, pk):
    """Mark a complaint as resolved."""
    try:
        complaint = Complaint.objects.get(pk=pk)
    except Complaint.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    complaint.status = "resolved"
    complaint.resolved_at = timezone.now()
    complaint.save()
    return Response(ComplaintSerializer(complaint, context={"request": request}).data)
