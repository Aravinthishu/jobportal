from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Resume, Education, Experience


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display    = ['user_email', 'title', 'is_primary_badge',
                       'file_link', 'uploaded_at']
    list_filter     = ['is_primary', 'uploaded_at']
    search_fields   = ['user__email', 'title']
    ordering        = ['-uploaded_at']
    readonly_fields = ['uploaded_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def is_primary_badge(self, obj):
        if obj.is_primary:
            return mark_safe(
                '<span style="background:#ECFDF5;color:#059669;padding:2px 8px;'
                'border-radius:100px;font-size:11px;font-weight:600">★ Primary</span>'
            )
        return '—'
    is_primary_badge.short_description = 'Primary'

    def file_link(self, obj):
        if obj.file:
            return format_html(
                '<a href="{}" target="_blank" style="color:#059669;'
                'font-weight:600;font-size:12px">View ↗</a>',
                obj.file.url
            )
        return '—'
    file_link.short_description = 'File'


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display  = ['user_email', 'degree', 'field',
                     'institution', 'start_year', 'end_year', 'grade']
    list_filter   = ['start_year', 'end_year', 'is_current']
    search_fields = ['user__email', 'institution', 'degree', 'field']
    ordering      = ['-start_year']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display  = ['user_email', 'designation', 'company_name',
                     'location', 'start_date', 'end_date', 'is_current']
    list_filter   = ['is_current', 'start_date']
    search_fields = ['user__email', 'company_name', 'designation']
    ordering      = ['-start_date']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'