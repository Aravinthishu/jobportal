from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume, Education, Experience
from .serializers import ResumeSerializer, EducationSerializer, ExperienceSerializer


class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class   = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        # first resume auto becomes primary
        is_first = not Resume.objects.filter(user=self.request.user).exists()
        serializer.save(user=self.request.user, is_primary=is_first)


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class SetPrimaryResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            resume.is_primary = True
            resume.save()
            return Response({'message': 'Primary resume updated.'})
        except Resume.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class   = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)


class ExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class   = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)


class PublicProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user    = User.objects.get(id=user_id, role='jobseeker')
            profile = getattr(user, 'jobseeker_profile', None)
            edu     = Education.objects.filter(user=user)
            exp     = Experience.objects.filter(user=user)
            resumes = Resume.objects.filter(user=user)
            return Response({
                'profile':    profile and {
                    'full_name':        profile.full_name,
                    'headline':         profile.headline,
                    'summary':          profile.summary,
                    'location':         profile.location,
                    'experience_years': profile.experience_years,
                    'skills':           profile.skills,
                    'linkedin_url':     profile.linkedin_url,
                    'github_url':       profile.github_url,
                    'portfolio_url':    profile.portfolio_url,
                    'profile_photo':    request.build_absolute_uri(
                                            profile.profile_photo.url
                                        ) if profile.profile_photo else None,
                },
                'education':  EducationSerializer(edu, many=True).data,
                'experience': ExperienceSerializer(exp, many=True).data,
                'resumes':    ResumeSerializer(resumes, many=True,
                                context={'request': request}).data,
            })
        except User.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)