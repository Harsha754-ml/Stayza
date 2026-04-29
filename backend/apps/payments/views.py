"""Payment views."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone

from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer, MarkPaidSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class MyPaymentsView(generics.ListAPIView):
    """Student views their own payment history."""
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class AllPaymentsView(generics.ListAPIView):
    """Admin views all payments."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ["status", "month"]
    search_fields = ["user__first_name", "user__last_name", "user__username"]

    def get_queryset(self):
        return Payment.objects.select_related("user").all()


class PaymentCreateView(generics.CreateAPIView):
    """Admin creates a payment record for a student."""
    serializer_class = PaymentCreateSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        user_id = self.request.data.get("user_id")
        from django.contrib.auth import get_user_model
        User = get_user_model()
        student = User.objects.get(id=user_id)
        serializer.save(user=student)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_paid(request, pk):
    """Mark a payment as paid (student pays or admin marks)."""
    try:
        payment = Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Students can only pay their own
    if request.user.role == "student" and payment.user_id != request.user.id:
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    serializer = MarkPaidSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    payment.status = "paid"
    payment.method = serializer.validated_data["method"]
    payment.paid_date = timezone.now().date()
    payment.save()
    return Response(PaymentSerializer(payment).data)


@api_view(["GET"])
@permission_classes([IsAdminRole])
def payment_summary(request):
    """Admin dashboard: payment summary stats."""
    from django.db.models import Sum, Count

    payments = Payment.objects.all()
    total_collected = payments.filter(status="paid").aggregate(
        total=Sum("amount"), count=Count("id")
    )
    total_pending = payments.filter(status="pending").aggregate(
        total=Sum("amount"), count=Count("id")
    )
    total_overdue = payments.filter(status="overdue").aggregate(
        total=Sum("amount"), count=Count("id")
    )

    return Response({
        "collected": {
            "amount": total_collected["total"] or 0,
            "count": total_collected["count"],
        },
        "pending": {
            "amount": total_pending["total"] or 0,
            "count": total_pending["count"],
        },
        "overdue": {
            "amount": total_overdue["total"] or 0,
            "count": total_overdue["count"],
        },
    })
