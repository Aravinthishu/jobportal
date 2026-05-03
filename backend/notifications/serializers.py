from rest_framework import serializers
from .models import Notification, JobAlert


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'link', 'created_at']
        read_only_fields = ['created_at']


class JobAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobAlert
        fields = '__all__'
        read_only_fields = ['user', 'last_sent', 'created_at']