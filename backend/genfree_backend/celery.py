"""
Celery configuration for GenFree Network backend.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'genfree_backend.settings.production')

app = Celery('genfree_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'check-live-streams': {
        'task': 'apps.livestream.tasks.check_live_status',
        'schedule': 30.0,  # Every 30 seconds
    },
    'process-pending-donations': {
        'task': 'apps.donations.tasks.process_pending_donations',
        'schedule': 60.0,  # Every minute
    },
    'send-daily-analytics': {
        'task': 'apps.analytics.tasks.send_daily_report',
        'schedule': crontab(hour=8, minute=0),  # Daily at 8 AM
    },
    'cleanup-old-chat-messages': {
        'task': 'apps.chat.tasks.cleanup_old_messages',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}

app.conf.timezone = 'Africa/Kampala'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')