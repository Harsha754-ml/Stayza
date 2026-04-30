"""Account URL routes."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from . import notifications

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("roommate-matches/", views.roommate_matches, name="roommate-matches"),
    path("staff/", views.staff_list, name="staff-list"),
    path("notifications/", notifications.get_notifications, name="notifications"),
]
