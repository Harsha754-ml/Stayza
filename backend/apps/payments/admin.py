from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["user", "amount", "month", "status", "method", "due_date", "paid_date"]
    list_filter = ["status", "method"]
    search_fields = ["user__first_name", "user__last_name", "month"]
    raw_id_fields = ["user"]
