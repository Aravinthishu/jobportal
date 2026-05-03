from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display    = ['title', 'company_name', 'job_type_badge',
                       'work_mode_badge', 'experience_level',
                       'salary_range', 'status_badge',
                       'views_count', 'applications_count',
                       'is_featured', 'created_at']
    list_filter     = ['status', 'job_type', 'work_mode',
                       'experience_level', 'is_featured', 'created_at']
    search_fields   = ['title', 'company__name', 'location', 'description']
    ordering        = ['-created_at']
    readonly_fields = ['slug', 'views_count', 'applications_count',
                       'created_at', 'updated_at']
    list_per_page   = 25
    date_hierarchy  = 'created_at'

    fieldsets = (
        ('Job Info',    {'fields': ('title', 'slug', 'company',
                                    'posted_by', 'status', 'is_featured')}),
        ('Description', {'fields': ('description', 'responsibilities', 'requirements')}),
        ('Details',     {'fields': ('job_type', 'work_mode', 'experience_level',
                                    'location', 'skills_required')}),
        ('Salary',      {'fields': ('salary_min', 'salary_max'),
                         'classes': ('collapse',)}),
        ('Stats',       {'fields': ('views_count', 'applications_count',
                                    'expires_at', 'created_at', 'updated_at'),
                         'classes': ('collapse',)}),
    )

    def company_name(self, obj):
        return obj.company.name if obj.company else '—'
    company_name.short_description = 'Company'

    def status_badge(self, obj):
        colors = {
            'active': ('#ECFDF5', '#059669'),
            'draft':  ('#F1F5F9', '#475569'),
            'closed': ('#FEF2F2', '#EF4444'),
        }
        bg, text = colors.get(obj.status, ('#F1F5F9', '#475569'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:100px;font-size:11px;font-weight:600">{}</span>',
            bg, text, obj.status.title()
        )
    status_badge.short_description = 'Status'

    def job_type_badge(self, obj):
        labels = {
            'full_time':  'Full Time',
            'part_time':  'Part Time',
            'contract':   'Contract',
            'internship': 'Internship',
            'freelance':  'Freelance',
        }
        return labels.get(obj.job_type, obj.job_type)
    job_type_badge.short_description = 'Type'

    def work_mode_badge(self, obj):
        colors = {
            'remote': '#059669',
            'hybrid': '#F59E0B',
            'onsite': '#6366F1',
        }
        color = colors.get(obj.work_mode, '#94A3B8')
        return format_html(
            '<span style="color:{};font-weight:600;font-size:12px">{}</span>',
            color, obj.work_mode.title()
        )
    work_mode_badge.short_description = 'Mode'

    def salary_range(self, obj):
        if obj.salary_min and obj.salary_max:
            return format_html(
                '<span style="color:#059669;font-weight:600;font-size:12px">'
                '₹{}–{} LPA</span>',
                obj.salary_min // 100000,
                obj.salary_max // 100000
            )
        if obj.salary_min:
            return format_html(
                '<span style="color:#059669;font-size:12px">₹{}+ LPA</span>',
                obj.salary_min // 100000
            )
        return '—'
    salary_range.short_description = 'Salary'

    actions = ['activate_jobs', 'close_jobs', 'feature_jobs', 'unfeature_jobs']

    def activate_jobs(self, request, queryset):
        count = queryset.update(status='active')
        self.message_user(request, f'{count} jobs activated.')
    activate_jobs.short_description = 'Set status → Active'

    def close_jobs(self, request, queryset):
        count = queryset.update(status='closed')
        self.message_user(request, f'{count} jobs closed.')
    close_jobs.short_description = 'Set status → Closed'

    def feature_jobs(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'{count} jobs featured.')
    feature_jobs.short_description = 'Mark as featured'

    def unfeature_jobs(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'{count} jobs unfeatured.')
    unfeature_jobs.short_description = 'Remove from featured'


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display    = ['user_email', 'job_title', 'company_name', 'saved_at']
    list_filter     = ['saved_at']
    search_fields   = ['user__email', 'job__title', 'job__company__name']
    ordering        = ['-saved_at']
    readonly_fields = ['saved_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job'

    def company_name(self, obj):
        return obj.job.company.name if obj.job.company else '—'
    company_name.short_description = 'Company'