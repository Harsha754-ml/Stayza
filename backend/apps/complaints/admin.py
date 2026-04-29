from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "filed_by", "priority", "status", "assigned_to", "escalated", "created_at"]
    list_filter = ["priority", "status", "category", "escalated"]
    search_fields = ["title", "description"]
    raw_id_fields = ["filed_by", "assigned_to"]
