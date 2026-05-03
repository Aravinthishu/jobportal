from rest_framework import serializers
from .models import Resume, Education, Experience


class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model  = Resume
        fields = ['id', 'title', 'file', 'file_url', 'is_primary', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_file_url(self, obj):
        req = self.context.get('request')
        if obj.file and req:
            return req.build_absolute_uri(obj.file.url)
        return None


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Education
        fields = '__all__'
        read_only_fields = ['user']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Experience
        fields = '__all__'
        read_only_fields = ['user']