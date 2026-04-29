"""Complaint URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.AllComplaintsView.as_view(), name="complaint-list"),
    path("create/", views.ComplaintCreateView.as_view(), name="complaint-create"),
    path("mine/", views.MyComplaintsView.as_view(), name="my-complaints"),
    path("<int:pk>/", views.ComplaintDetailView.as_view(), name="complaint-detail"),
    path("<int:pk>/assign/", views.assign_complaint, name="complaint-assign"),
    path("<int:pk>/resolve/", views.resolve_complaint, name="complaint-resolve"),
]
