from rest_framework import serializers
from .models import Job, SavedJob
from companies.models import Company


class CompanyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Company
        fields = ['id', 'name', 'logo', 'industry', 'headquarters']


class JobListSerializer(serializers.ModelSerializer):
    company    = CompanyMiniSerializer(read_only=True)
    is_saved   = serializers.SerializerMethodField()

    class Meta:
        model  = Job
        fields = [
            'id', 'title', 'slug', 'company', 'job_type', 'work_mode',
            'experience_level', 'location', 'salary_min', 'salary_max',
            'skills_required', 'status', 'is_featured',
            'views_count', 'applications_count', 'created_at', 'is_saved',
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False


class JobDetailSerializer(JobListSerializer):
    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + [
            'description', 'requirements', 'responsibilities', 'expires_at', 'updated_at'
        ]


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Job
        fields = [
            'title', 'company', 'description', 'requirements', 'responsibilities',
            'job_type', 'work_mode', 'experience_level', 'location',
            'salary_min', 'salary_max', 'skills_required', 'status', 'expires_at',
        ]

    def validate_company(self, company):
        user = self.context['request'].user
        if not company.recruiters.filter(user=user).exists() and company.created_by != user:
            raise serializers.ValidationError("You don't belong to this company.")
        return company

    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)