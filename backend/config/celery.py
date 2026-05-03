import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('jobportal')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-daily-job-alerts': {
        'task': 'notifications.tasks.send_job_alerts',
        'schedule': crontab(hour=8, minute=0),
    },
    'send-matched-job-alerts': {
        'task': 'notifications.tasks.send_matched_job_alerts',
        'schedule': crontab(hour=9, minute=0),  # daily 9 AM
    },
    'send-weekly-digest': {
        'task': 'notifications.tasks.send_weekly_digest',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
}