from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display    = ['logo_preview', 'name', 'industry', 'size',
                       'headquarters', 'is_verified_badge',
                       'active_jobs_count', 'created_at']
    list_filter     = ['industry', 'size', 'is_verified', 'created_at']
    search_fields   = ['name', 'industry', 'headquarters', 'website']
    ordering        = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'slug', 'logo_preview']
    list_per_page   = 20

    fieldsets = (
        ('Company Info', {'fields': ('name', 'slug', 'logo', 'logo_preview',
                                     'website', 'industry', 'size')}),
        ('Details',      {'fields': ('description', 'founded_year', 'headquarters')}),
        ('Admin',        {'fields': ('is_verified', 'created_by',
                                     'created_at', 'updated_at'),
                          'classes': ('collapse',)}),
    )

    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;'
                'border-radius:8px;object-fit:cover" />',
                obj.logo.url
            )
        initial = obj.name[0].upper() if obj.name else '?'
        return format_html(
            '<div style="width:36px;height:36px;border-radius:8px;'
            'background:#ECFDF5;color:#059669;display:flex;align-items:center;'
            'justify-content:center;font-weight:700;font-size:14px">{}</div>',
            initial
        )
    logo_preview.short_description = 'Logo'

    def is_verified_badge(self, obj):
        if obj.is_verified:
            return mark_safe('<span style="color:#059669;font-weight:600">✓ Verified</span>')
        return mark_safe('<span style="color:#94A3B8">— Unverified</span>')
    is_verified_badge.short_description = 'Verified'

    def active_jobs_count(self, obj):
        count = obj.jobs.filter(status='active').count()
        if count > 0:
            return format_html(
                '<span style="background:#ECFDF5;color:#059669;padding:2px 8px;'
                'border-radius:4px;font-size:11px;font-weight:600">{} active</span>',
                count
            )
        return '0'
    active_jobs_count.short_description = 'Active Jobs'

    actions = ['verify_companies', 'unverify_companies']

    def verify_companies(self, request, queryset):
        count = queryset.update(is_verified=True)
        self.message_user(request, f'{count} companies verified.')
    verify_companies.short_description = 'Mark as verified'

    def unverify_companies(self, request, queryset):
        count = queryset.update(is_verified=False)
        self.message_user(request, f'{count} companies unverified.')
    unverify_companies.short_description = 'Mark as unverified'