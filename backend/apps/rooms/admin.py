from django.contrib import admin
from .models import Room, Booking


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ["number", "floor", "room_type", "capacity", "status", "price_per_month"]
    list_filter = ["floor", "room_type", "status"]
    search_fields = ["number"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["user", "room", "is_active", "booked_at", "checked_out_at"]
    list_filter = ["is_active"]
    raw_id_fields = ["user", "room"]
