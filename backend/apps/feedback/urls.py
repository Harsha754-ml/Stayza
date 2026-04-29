"""Feedback URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.AllFeedbackView.as_view(), name="feedback-list"),
    path("submit/", views.FeedbackCreateView.as_view(), name="feedback-submit"),
    path("given/", views.MyGivenFeedbackView.as_view(), name="feedback-given"),
    path("received/", views.MyReceivedFeedbackView.as_view(), name="feedback-received"),
    path("pending/", views.pending_feedback, name="feedback-pending"),
    path("reputation/<int:user_id>/", views.user_reputation, name="user-reputation"),
]
