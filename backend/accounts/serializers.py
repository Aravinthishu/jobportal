from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import JobSeekerProfile, RecruiterProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'password', 'password2', 'role', 'full_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)

        # Auto-create profile based on role
        if user.role == 'jobseeker':
            JobSeekerProfile.objects.create(user=user, full_name=full_name)
        elif user.role == 'recruiter':
            RecruiterProfile.objects.create(user=user, full_name=full_name)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'email', 'role', 'is_email_verified', 'date_joined']


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = JobSeekerProfile
        fields = '__all__'
        read_only_fields = ['user', 'profile_completion', 'created_at', 'updated_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value