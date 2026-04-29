"""Celery configuration."""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("stayza")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Beat schedule: run escalation check every 30 minutes
app.conf.beat_schedule = {
    "escalate-overdue-complaints": {
        "task": "apps.complaints.tasks.escalate_overdue_complaints",
        "schedule": crontab(minute="*/30"),
    },
}
