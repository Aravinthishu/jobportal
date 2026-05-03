from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Notification, JobAlert


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display    = ['user_email', 'type_badge', 'title',
                       'is_read_icon', 'created_at']
    list_filter     = ['type', 'is_read', 'created_at']
    search_fields   = ['user__email', 'title', 'message']
    ordering        = ['-created_at']
    readonly_fields = ['created_at']
    list_per_page   = 30
    date_hierarchy  = 'created_at'

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def type_badge(self, obj):
        colors = {
            'application_status': ('#EFF6FF', '#1E40AF'),
            'new_application':    ('#ECFDF5', '#059669'),
            'invite':             ('#FFFBEB', '#D97706'),
            'job_alert':          ('#EEF2FF', '#4338CA'),
            'system':             ('#F1F5F9', '#475569'),
        }
        bg, text = colors.get(obj.type, ('#F1F5F9', '#475569'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:600">{}</span>',
            bg, text, obj.type.replace('_', ' ').title()
        )
    type_badge.short_description = 'Type'

    def is_read_icon(self, obj):
        if obj.is_read:
            return mark_safe('<span style="color:#059669">✓ Read</span>')
        return mark_safe('<span style="color:#F59E0B;font-weight:600">● Unread</span>')
    is_read_icon.short_description = 'Read'

    actions = ['mark_all_read', 'mark_all_unread']

    def mark_all_read(self, request, queryset):
        count = queryset.update(is_read=True)
        self.message_user(request, f'{count} notifications marked as read.')
    mark_all_read.short_description = 'Mark as read'

    def mark_all_unread(self, request, queryset):
        count = queryset.update(is_read=False)
        self.message_user(request, f'{count} notifications marked as unread.')
    mark_all_unread.short_description = 'Mark as unread'


@admin.register(JobAlert)
class JobAlertAdmin(admin.ModelAdmin):
    list_display    = ['user_email', 'keywords', 'location',
                       'job_type', 'frequency_badge',
                       'is_active_icon', 'last_sent', 'created_at']
    list_filter     = ['frequency', 'is_active', 'job_type', 'work_mode']
    search_fields   = ['user__email', 'keywords', 'location']
    ordering        = ['-created_at']
    readonly_fields = ['last_sent', 'created_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def frequency_badge(self, obj):
        color = '#059669' if obj.frequency == 'daily' else '#6366F1'
        return format_html(
            '<span style="color:{};font-weight:600;font-size:12px">{}</span>',
            color, obj.frequency.title()
        )
    frequency_badge.short_description = 'Frequency'

    def is_active_icon(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#059669;font-weight:600">● Active</span>')
        return mark_safe('<span style="color:#94A3B8">○ Paused</span>')
    is_active_icon.short_description = 'Status'

    actions = ['activate_alerts', 'pause_alerts']

    def activate_alerts(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} alerts activated.')
    activate_alerts.short_description = 'Activate selected alerts'

    def pause_alerts(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} alerts paused.')
    pause_alerts.short_description = 'Pause selected alerts'