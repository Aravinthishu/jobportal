from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Application, RecruiterInvite


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display    = ['applicant_name', 'applicant_email',
                       'job_title', 'company_name',
                       'status_badge', 'applied_at', 'updated_at']
    list_filter     = ['status', 'applied_at', 'updated_at',
                       'job__job_type', 'job__work_mode']
    search_fields   = ['applicant__email', 'job__title', 'job__company__name']
    ordering        = ['-applied_at']
    readonly_fields = ['id', 'applied_at', 'updated_at']
    list_per_page   = 30
    date_hierarchy  = 'applied_at'

    fieldsets = (
        ('Application', {'fields': ('id', 'job', 'applicant', 'status')}),
        ('Content',     {'fields': ('cover_letter', 'notes'),
                         'classes': ('collapse',)}),
        ('Timestamps',  {'fields': ('applied_at', 'updated_at'),
                         'classes': ('collapse',)}),
    )

    def applicant_name(self, obj):
        profile = getattr(obj.applicant, 'jobseeker_profile', None)
        return profile.full_name if profile else '—'
    applicant_name.short_description = 'Applicant'

    def applicant_email(self, obj):
        return obj.applicant.email
    applicant_email.short_description = 'Email'

    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job'

    def company_name(self, obj):
        return obj.job.company.name if obj.job.company else '—'
    company_name.short_description = 'Company'

    def status_badge(self, obj):
        config = {
            'applied':      ('#F1F5F9', '#475569'),
            'viewed':       ('#EFF6FF', '#1E40AF'),
            'shortlisted':  ('#ECFDF5', '#059669'),
            'interviewing': ('#FFFBEB', '#D97706'),
            'offered':      ('#ECFDF5', '#059669'),
            'rejected':     ('#FEF2F2', '#EF4444'),
            'withdrawn':    ('#F1F5F9', '#94A3B8'),
        }
        bg, text = config.get(obj.status, ('#F1F5F9', '#475569'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:100px;font-size:11px;font-weight:600">{}</span>',
            bg, text, obj.status.replace('_', ' ').title()
        )
    status_badge.short_description = 'Status'

    actions = ['mark_shortlisted', 'mark_interviewing',
               'mark_offered', 'mark_rejected']

    def mark_shortlisted(self, request, queryset):
        count = queryset.update(status='shortlisted')
        self.message_user(request, f'{count} applications shortlisted.')
    mark_shortlisted.short_description = 'Mark → Shortlisted'

    def mark_interviewing(self, request, queryset):
        count = queryset.update(status='interviewing')
        self.message_user(request, f'{count} moved to Interviewing.')
    mark_interviewing.short_description = 'Mark → Interviewing'

    def mark_offered(self, request, queryset):
        count = queryset.update(status='offered')
        self.message_user(request, f'{count} marked as Offered.')
    mark_offered.short_description = 'Mark → Offered'

    def mark_rejected(self, request, queryset):
        count = queryset.update(status='rejected')
        self.message_user(request, f'{count} marked as Rejected.')
    mark_rejected.short_description = 'Mark → Rejected'


@admin.register(RecruiterInvite)
class RecruiterInviteAdmin(admin.ModelAdmin):
    list_display    = ['recruiter_email', 'candidate_email',
                       'job_title', 'status_badge', 'sent_at']
    list_filter     = ['status', 'sent_at']
    search_fields   = ['recruiter__email', 'candidate__email', 'job__title']
    ordering        = ['-sent_at']
    readonly_fields = ['sent_at']

    def recruiter_email(self, obj):
        return obj.recruiter.email
    recruiter_email.short_description = 'Recruiter'

    def candidate_email(self, obj):
        return obj.candidate.email
    candidate_email.short_description = 'Candidate'

    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job'

    def status_badge(self, obj):
        colors = {
            'pending':  ('#FFFBEB', '#D97706'),
            'accepted': ('#ECFDF5', '#059669'),
            'declined': ('#FEF2F2', '#EF4444'),
        }
        bg, text = colors.get(obj.status, ('#F1F5F9', '#475569'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:100px;font-size:11px;font-weight:600">{}</span>',
            bg, text, obj.status.title()
        )
    status_badge.short_description = 'Status'