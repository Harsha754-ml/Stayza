"""Celery tasks for complaint auto-escalation."""

from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task
def escalate_overdue_complaints():
    """
    Auto-escalate complaints not resolved within 48 hours.
    Low → Medium, Medium → High. Already High get flagged as escalated.
    """
    from .models import Complaint

    cutoff = timezone.now() - timedelta(hours=48)
    overdue = Complaint.objects.filter(
        created_at__lte=cutoff,
        status__in=["pending", "in_progress"],
    )

    escalation_map = {
        "low": "medium",
        "medium": "high",
    }

    count = 0
    for complaint in overdue:
        new_priority = escalation_map.get(complaint.priority)
        if new_priority:
            complaint.priority = new_priority
            complaint.escalated = True
            complaint.save(update_fields=["priority", "escalated", "updated_at"])
            count += 1
        elif complaint.priority == "high" and not complaint.escalated:
            complaint.escalated = True
            complaint.save(update_fields=["escalated", "updated_at"])
            count += 1

    return f"Escalated {count} complaints."
