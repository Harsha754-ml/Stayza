"""Payment URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.AllPaymentsView.as_view(), name="payment-list"),
    path("mine/", views.MyPaymentsView.as_view(), name="my-payments"),
    path("create/", views.PaymentCreateView.as_view(), name="payment-create"),
    path("<int:pk>/pay/", views.mark_paid, name="mark-paid"),
    path("summary/", views.payment_summary, name="payment-summary"),
]
