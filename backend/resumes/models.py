from django.db import models
from django.conf import settings
import uuid


class Resume(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='resumes')
    title      = models.CharField(max_length=200, default='My Resume')
    file       = models.FileField(upload_to='resumes/')
    is_primary = models.BooleanField(default=False)
    uploaded_at= models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', '-uploaded_at']

    def __str__(self):
        return f"{self.user.email} — {self.title}"

    def save(self, *args, **kwargs):
        # if this is set as primary, unset others
        if self.is_primary:
            Resume.objects.filter(
                user=self.user, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class Education(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='education')
    institution = models.CharField(max_length=200)
    degree      = models.CharField(max_length=200)
    field       = models.CharField(max_length=200, blank=True)
    grade       = models.CharField(max_length=50, blank=True)
    start_year  = models.PositiveIntegerField()
    end_year    = models.PositiveIntegerField(null=True, blank=True)
    is_current  = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.degree} — {self.institution}"


class Experience(models.Model):
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                     related_name='experience')
    company_name = models.CharField(max_length=200)
    designation  = models.CharField(max_length=200)
    location     = models.CharField(max_length=100, blank=True)
    start_date   = models.DateField()
    end_date     = models.DateField(null=True, blank=True)
    is_current   = models.BooleanField(default=False)
    description  = models.TextField(blank=True)
    skills_used  = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.designation} @ {self.company_name}"