from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid


class Company(models.Model):
    name         = models.CharField(max_length=200)
    slug         = models.SlugField(unique=True, blank=True)
    logo         = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    website      = models.URLField(blank=True)
    industry     = models.CharField(max_length=100, blank=True)
    size         = models.CharField(max_length=50, blank=True)
    description  = models.TextField(blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    headquarters = models.CharField(max_length=150, blank=True)
    is_verified  = models.BooleanField(default=False)
    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='companies'
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Companies'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            # keep trying until unique
            counter = 1
            while Company.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name