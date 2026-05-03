from django.db import models
from django.conf import settings
import uuid


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied',      'Applied'),
        ('viewed',       'Viewed'),
        ('shortlisted',  'Shortlisted'),
        ('interviewing', 'Interviewing'),
        ('offered',      'Offered'),
        ('rejected',     'Rejected'),
        ('withdrawn',    'Withdrawn'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job          = models.ForeignKey('jobs.Job', on_delete=models.CASCADE,
                                     related_name='applications')
    applicant    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                     related_name='applications')
    cover_letter = models.TextField(blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    notes        = models.TextField(blank=True)  # recruiter's internal notes

    class Meta:
        ordering        = ['-applied_at']
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.email} → {self.job.title}"
    
class RecruiterInvite(models.Model):
    STATUS = [('pending','Pending'),('accepted','Accepted'),('declined','Declined')]

    job       = models.ForeignKey('jobs.Job', on_delete=models.CASCADE,
                                  related_name='invites')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name='sent_invites')
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name='received_invites')
    message   = models.TextField(blank=True)
    status    = models.CharField(max_length=20, choices=STATUS, default='pending')
    sent_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'candidate')

    def __str__(self):
        return f"{self.recruiter.email} → {self.candidate.email} for {self.job.title}"