"""Room URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.RoomListView.as_view(), name="room-list"),
    path("create/", views.RoomCreateView.as_view(), name="room-create"),
    path("<int:pk>/", views.RoomDetailView.as_view(), name="room-detail"),
    path("book/", views.book_room, name="book-room"),
    path("checkout/", views.checkout, name="checkout"),
    path("my-bookings/", views.MyBookingView.as_view(), name="my-bookings"),
    path("all-bookings/", views.AllBookingsView.as_view(), name="all-bookings"),
    path("admin-assign/", views.admin_assign_room, name="admin-assign"),
]
