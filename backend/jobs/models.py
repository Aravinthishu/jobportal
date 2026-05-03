from django.db import models
from django.utils.text import slugify
from django.conf import settings
import uuid

class Job(models.Model):
    JOB_TYPE = [
        ('full_time', 'Full Time'), ('part_time', 'Part Time'),
        ('contract', 'Contract'),   ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    ]
    WORK_MODE = [
        ('onsite', 'On-site'), ('remote', 'Remote'), ('hybrid', 'Hybrid'),
    ]
    EXPERIENCE = [
        ('fresher', 'Fresher'),     ('1_3', '1–3 years'),
        ('3_5', '3–5 years'),       ('5_10', '5–10 years'),
        ('10_plus', '10+ years'),
    ]
    STATUS = [
        ('draft', 'Draft'), ('active', 'Active'), ('closed', 'Closed'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company         = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='jobs')
    posted_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    title           = models.CharField(max_length=200)
    slug            = models.SlugField(max_length=250, unique=True, blank=True)
    description     = models.TextField()
    requirements    = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    job_type        = models.CharField(max_length=20, choices=JOB_TYPE, default='full_time')
    work_mode       = models.CharField(max_length=20, choices=WORK_MODE, default='onsite')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE, default='fresher')
    location        = models.CharField(max_length=150)
    salary_min      = models.PositiveIntegerField(null=True, blank=True)
    salary_max      = models.PositiveIntegerField(null=True, blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    status          = models.CharField(max_length=20, choices=STATUS, default='draft')
    is_featured     = models.BooleanField(default=False)
    views_count     = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)
    expires_at      = models.DateField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.title}-{str(self.id)[:8]}")
            self.slug = base
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class SavedJob(models.Model):
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job      = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')