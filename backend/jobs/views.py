from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, SavedJob
from .serializers import JobListSerializer, JobDetailSerializer, JobCreateSerializer
from .filters import JobFilter


class IsRecruiterOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'recruiter'


class JobListView(generics.ListCreateAPIView):
    queryset           = Job.objects.filter(status='active').select_related('company', 'posted_by')
    permission_classes = [IsRecruiterOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = JobFilter
    search_fields      = ['title', 'description', 'company__name', 'location']
    ordering_fields    = ['created_at', 'salary_min', 'views_count', 'applications_count']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        return JobCreateSerializer if self.request.method == 'POST' else JobListSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field       = 'slug'
    permission_classes = [IsRecruiterOrReadOnly]

    def get_queryset(self):
        return Job.objects.select_related('company', 'posted_by')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateSerializer
        return JobDetailSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)


class RecruiterJobsView(generics.ListAPIView):
    serializer_class   = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            posted_by=self.request.user
        ).select_related('company')

    def get_serializer_context(self):
        return {'request': self.request}


class SaveJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        job = Job.objects.get(slug=slug)
        obj, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if not created:
            obj.delete()
            return Response({'saved': False})
        return Response({'saved': True})


class SavedJobsView(generics.ListAPIView):
    serializer_class   = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            saved_by__user=self.request.user
        ).select_related('company')

    def get_serializer_context(self):
        return {'request': self.request}