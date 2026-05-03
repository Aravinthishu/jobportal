from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('application_status', 'Application Status'),
        ('new_application',    'New Application'),
        ('invite',             'Interview Invite'),
        ('job_alert',          'Job Alert'),
        ('profile_view',       'Profile View'),
        ('system',             'System'),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='notifications')
    type       = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    link       = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.title}"


class JobAlert(models.Model):
    FREQUENCY = [
        ('daily',  'Daily'),
        ('weekly', 'Weekly'),
    ]

    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='job_alerts')
    keywords    = models.CharField(max_length=200, blank=True)
    location    = models.CharField(max_length=100, blank=True)
    job_type    = models.CharField(max_length=20, blank=True)
    work_mode   = models.CharField(max_length=20, blank=True)
    min_salary  = models.PositiveIntegerField(null=True, blank=True)
    frequency   = models.CharField(max_length=10, choices=FREQUENCY, default='daily')
    is_active   = models.BooleanField(default=True)
    last_sent   = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} — {self.keywords or 'All jobs'}"