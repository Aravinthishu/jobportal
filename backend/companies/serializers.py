from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    job_count        = serializers.SerializerMethodField()

    class Meta:
        model  = Company
        fields = '__all__'
        read_only_fields = ['created_by', 'is_verified', 'created_at', 'updated_at']

    def get_job_count(self, obj):
        return obj.jobs.filter(status='active').count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)