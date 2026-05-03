from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html, mark_safe
from .models import User, JobSeekerProfile, RecruiterProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ['email', 'role_badge', 'is_active_icon',
                       'is_email_verified_icon', 'date_joined', 'last_login']
    list_filter     = ['role', 'is_active', 'is_email_verified',
                       'is_staff', 'date_joined']
    search_fields   = ['email']
    ordering        = ['-date_joined']
    readonly_fields = ['date_joined', 'last_login']

    fieldsets = (
        ('Account',    {'fields': ('email', 'password')}),
        ('Role & Status', {'fields': ('role', 'is_active', 'is_email_verified',
                                      'is_staff', 'is_superuser')}),
        ('Timestamps', {'fields': ('date_joined', 'last_login'),
                        'classes': ('collapse',)}),
        ('Permissions',{'fields': ('groups', 'user_permissions'),
                        'classes': ('collapse',)}),
    )

    add_fieldsets = (
        ('Create User', {
            'classes': ('wide',),
            'fields':  ('email', 'role', 'password1', 'password2'),
        }),
    )

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    def role_badge(self, obj):
        colors = {
            'jobseeker': '#059669',
            'recruiter': '#6366F1',
            'admin':     '#EF4444',
        }
        color = colors.get(obj.role, '#94A3B8')
        return format_html(
            '<span style="background:{};color:white;padding:2px 10px;'
            'border-radius:100px;font-size:11px;font-weight:600">{}</span>',
            color, obj.role.title()
        )
    role_badge.short_description = 'Role'

    def is_active_icon(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#059669;font-weight:600">✓ Active</span>')
        return mark_safe('<span style="color:#EF4444;font-weight:600">✗ Inactive</span>')
    is_active_icon.short_description = 'Status'

    def is_email_verified_icon(self, obj):
        if obj.is_email_verified:
            return mark_safe('<span style="color:#059669">✓ Verified</span>')
        return mark_safe('<span style="color:#F59E0B">⚠ Unverified</span>')
    is_email_verified_icon.short_description = 'Email'

    actions = ['activate_users', 'deactivate_users', 'verify_emails']

    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} users activated.')
    activate_users.short_description = 'Activate selected users'

    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} users deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'

    def verify_emails(self, request, queryset):
        count = queryset.update(is_email_verified=True)
        self.message_user(request, f'{count} emails marked as verified.')
    verify_emails.short_description = 'Mark emails as verified'


@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display    = ['full_name', 'user_email', 'location',
                       'experience_years', 'completion_bar',
                       'skills_count', 'updated_at']
    list_filter     = ['experience_years', 'notice_period_days',
                       'created_at', 'updated_at']
    search_fields   = ['full_name', 'user__email', 'location', 'headline']
    readonly_fields = ['profile_completion', 'created_at', 'updated_at']
    ordering        = ['-updated_at']
    list_per_page   = 25

    fieldsets = (
        ('Basic Info',  {'fields': ('user', 'full_name', 'phone',
                                    'headline', 'profile_photo')}),
        ('Professional',{'fields': ('summary', 'location', 'experience_years',
                                    'skills', 'profile_completion')}),
        ('Career',      {'fields': ('current_ctc', 'expected_ctc',
                                    'notice_period_days'),
                         'classes': ('collapse',)}),
        ('Links',       {'fields': ('linkedin_url', 'github_url', 'portfolio_url'),
                         'classes': ('collapse',)}),
        ('Timestamps',  {'fields': ('created_at', 'updated_at'),
                         'classes': ('collapse',)}),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def completion_bar(self, obj):
        pct   = obj.profile_completion or 0
        color = '#059669' if pct >= 80 else '#F59E0B' if pct >= 50 else '#EF4444'
        return format_html(
            '<div style="width:120px;background:#e2e8f0;border-radius:100px;height:8px">'
            '<div style="width:{}%;background:{};height:8px;border-radius:100px"></div>'
            '</div>'
            '<span style="font-size:11px;color:{};font-weight:600"> {}%</span>',
            pct, color, color, pct
        )
    completion_bar.short_description = 'Completion'

    def skills_count(self, obj):
        count = len(obj.skills or [])
        return format_html(
            '<span style="background:#EFF6FF;color:#1E40AF;padding:2px 8px;'
            'border-radius:4px;font-size:11px">{} skills</span>',
            count
        )
    skills_count.short_description = 'Skills'


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display  = ['full_name', 'user_email', 'designation',
                     'company_name', 'created_at']
    list_filter   = ['created_at', 'company']
    search_fields = ['full_name', 'user__email', 'designation', 'company__name']
    ordering      = ['-created_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def company_name(self, obj):
        if obj.company:
            return obj.company.name
        return '—'
    company_name.short_description = 'Company'