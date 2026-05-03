from rest_framework import serializers
from .models import Application
from jobs.serializers import JobListSerializer
from accounts.serializers import JobSeekerProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    job             = JobListSerializer(read_only=True)
    job_id          = serializers.UUIDField(write_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_name  = serializers.SerializerMethodField()
    applicant_profile = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            'id', 'job', 'job_id', 'applicant_email', 'applicant_name',
            'applicant_profile', 'cover_letter', 'status',
            'applied_at', 'updated_at', 'notes',
        ]
        read_only_fields = ['status', 'applied_at', 'updated_at', 'notes']

    def get_applicant_name(self, obj):
        profile = getattr(obj.applicant, 'jobseeker_profile', None)
        return profile.full_name if profile else obj.applicant.email

    def get_applicant_profile(self, obj):
        profile = getattr(obj.applicant, 'jobseeker_profile', None)
        if not profile:
            return None
        return {
            'user_id':          profile.user.id,
            'headline':         profile.headline,
            'experience_years': profile.experience_years,
            'location':         profile.location,
            'skills':           profile.skills,
            'profile_photo':    self.context['request'].build_absolute_uri(
                                    profile.profile_photo.url
                                ) if profile.profile_photo else None,
        }

    def validate_job_id(self, value):
        from jobs.models import Job
        try:
            job = Job.objects.get(id=value, status='active')
        except Job.DoesNotExist:
            raise serializers.ValidationError('Job not found or no longer active.')
        user = self.context['request'].user
        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError('You have already applied for this job.')
        return value

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        from jobs.models import Job
        job = Job.objects.get(id=job_id)
        application = Application.objects.create(
            job=job,
            applicant=self.context['request'].user,
            **validated_data
        )
        job.applications_count += 1
        job.save(update_fields=['applications_count'])

        # call directly — no .delay()
        try:
            from applications.tasks import notify_new_application
            notify_new_application(str(application.id))
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")

        return application


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Application
        fields = ['status', 'notes']