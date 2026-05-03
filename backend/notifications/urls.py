from django.urls import path
from .views import (
    NotificationListView, NotificationUnreadCountView,
    MarkNotificationReadView, MarkAllReadView,
    JobAlertListCreateView, JobAlertDetailView,
)

from django.urls import path
from .views import (
    NotificationListView, NotificationUnreadCountView,
    MarkNotificationReadView, MarkAllReadView,
    JobAlertListCreateView, JobAlertDetailView,
    DeleteNotificationView, DeleteAllNotificationsView,
)

urlpatterns = [
    path('',                    NotificationListView.as_view(),       name='notifications'),
    path('unread-count/',       NotificationUnreadCountView.as_view(),name='unread_count'),
    path('<int:pk>/read/',      MarkNotificationReadView.as_view(),   name='mark_read'),
    path('<int:pk>/delete/',    DeleteNotificationView.as_view(),     name='delete_notification'),
    path('mark-all-read/',      MarkAllReadView.as_view(),            name='mark_all_read'),
    path('delete-all/',         DeleteAllNotificationsView.as_view(), name='delete_all'),
    path('alerts/',             JobAlertListCreateView.as_view(),     name='job_alerts'),
    path('alerts/<int:pk>/',    JobAlertDetailView.as_view(),         name='job_alert_detail'),
]