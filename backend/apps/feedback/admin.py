from django.contrib import admin
from .models import RoommateFeedback


@admin.register(RoommateFeedback)
class RoommateFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        "reviewer",
        "reviewee",
        "cleanliness_rating",
        "noise_rating",
        "overall_rating",
        "created_at",
    ]
    list_filter = ["overall_rating", "created_at"]
    search_fields = [
        "reviewer__first_name",
        "reviewer__last_name",
        "reviewee__first_name",
        "reviewee__last_name",
    ]
    raw_id_fields = ["reviewer", "reviewee", "booking"]
