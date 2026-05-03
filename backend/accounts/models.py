from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('jobseeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    )
    email            = models.EmailField(unique=True)
    role             = models.CharField(max_length=20, choices=ROLE_CHOICES, default='jobseeker')
    is_active        = models.BooleanField(default=True)
    is_staff         = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    date_joined      = models.DateTimeField(auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class JobSeekerProfile(models.Model):
    user                = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')
    full_name           = models.CharField(max_length=150)
    phone               = models.CharField(max_length=20, blank=True)
    headline            = models.CharField(max_length=200, blank=True)
    summary             = models.TextField(blank=True)
    location            = models.CharField(max_length=100, blank=True)
    experience_years    = models.PositiveIntegerField(default=0)
    current_ctc         = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expected_ctc        = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notice_period_days  = models.PositiveIntegerField(default=30)
    skills              = models.JSONField(default=list, blank=True)
    profile_photo       = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    linkedin_url        = models.URLField(blank=True)
    github_url          = models.URLField(blank=True)
    portfolio_url       = models.URLField(blank=True)
    profile_completion  = models.PositiveIntegerField(default=0)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.user.email})"

    def calculate_completion(self):
        fields  = [self.full_name, self.phone, self.headline, self.summary,
                   self.location, self.skills, self.profile_photo]
        filled  = sum(1 for f in fields if f)
        self.profile_completion = int((filled / len(fields)) * 100)
        self.save(update_fields=['profile_completion'])


class RecruiterProfile(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    full_name   = models.CharField(max_length=150)
    phone       = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    company     = models.ForeignKey('companies.Company', on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='recruiters')
    linkedin_url = models.URLField(blank=True)
    profile_photo       = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.user.email})"