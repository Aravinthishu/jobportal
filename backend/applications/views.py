from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusUpdateSerializer


class JobSeekerApplicationsView(generics.ListCreateAPIView):
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status']
    ordering_fields    = ['applied_at']
    ordering           = ['-applied_at']

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).select_related('job', 'job__company')

    def get_serializer_context(self):
        return {'request': self.request}


class ApplicationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).select_related('job', 'job__company')

    def get_serializer_context(self):
        return {'request': self.request}

    def destroy(self, request, *args, **kwargs):
        app = self.get_object()
        if app.status not in ['applied', 'viewed']:
            return Response(
                {'error': 'Cannot withdraw after shortlisting.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        job = app.job
        app.delete()
        job.applications_count = max(0, job.applications_count - 1)
        job.save(update_fields=['applications_count'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecruiterApplicationsView(generics.ListAPIView):
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status']
    ordering           = ['-applied_at']

    def get_queryset(self):
        qs = Application.objects.filter(
            job__posted_by=self.request.user
        ).select_related('job', 'job__company', 'applicant', 'applicant__jobseeker_profile')
        job_id = self.request.query_params.get('job')
        if job_id:
            qs = qs.filter(job__id=job_id)
        return qs

    def get_serializer_context(self):
        return {'request': self.request}


class UpdateApplicationStatusView(generics.UpdateAPIView):
    serializer_class   = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__posted_by=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        # call directly — no .delay() needed for local dev
        try:
            from applications.tasks import notify_application_status
            notify_application_status(str(instance.id))
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")


class ApplicationStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'jobseeker':
            apps = Application.objects.filter(applicant=user)
            stats = {
                'total':        apps.count(),
                'applied':      apps.filter(status='applied').count(),
                'viewed':       apps.filter(status='viewed').count(),
                'shortlisted':  apps.filter(status='shortlisted').count(),
                'interviewing': apps.filter(status='interviewing').count(),
                'offered':      apps.filter(status='offered').count(),
                'rejected':     apps.filter(status='rejected').count(),
            }
        else:
            from jobs.models import Job
            jobs   = Job.objects.filter(posted_by=user)
            apps   = Application.objects.filter(job__in=jobs)
            stats  = {
                'total_jobs':        jobs.count(),
                'active_jobs':       jobs.filter(status='active').count(),
                'total_applications':apps.count(),
                'new_applications':  apps.filter(status='applied').count(),
                'shortlisted':       apps.filter(status='shortlisted').count(),
                'interviewing':      apps.filter(status='interviewing').count(),
                'offered':           apps.filter(status='offered').count(),
            }
        return Response(stats)
    
from .models import Application, RecruiterInvite
from django.contrib.auth import get_user_model


class SendInviteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from jobs.models import Job
        from django.contrib.auth import get_user_model
        User = get_user_model()

        job_id       = request.data.get('job_id')
        candidate_id = request.data.get('candidate_id')
        message      = request.data.get('message', '')

        try:
            job       = Job.objects.get(id=job_id, posted_by=request.user)
            candidate = User.objects.get(id=candidate_id, role='jobseeker')

            invite, created = RecruiterInvite.objects.get_or_create(
                job=job, candidate=candidate,
                defaults={'recruiter': request.user, 'message': message}
            )

            if not created:
                return Response(
                    {'error': 'Invite already sent to this candidate for this job.'},
                    status=400
                )

            # fire email + notification task
            try:
                from applications.tasks import notify_recruiter_invite
                notify_recruiter_invite(invite.id)
            except Exception as e:
                print(f"[EMAIL ERROR] {e}")

            return Response({'message': 'Invitation sent successfully.'})

        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Candidate not found.'}, status=404)


class CandidateSearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from accounts.models import JobSeekerProfile
        from accounts.serializers import JobSeekerProfileSerializer
        q        = request.query_params.get('q', '')
        location = request.query_params.get('location', '')
        exp_min  = request.query_params.get('exp_min', 0)
        skills   = request.query_params.get('skills', '')

        profiles = JobSeekerProfile.objects.select_related('user').all()

        if q:
            profiles = profiles.filter(full_name__icontains=q) | \
                       profiles.filter(headline__icontains=q)
        if location:
            profiles = profiles.filter(location__icontains=location)
        if exp_min:
            profiles = profiles.filter(experience_years__gte=exp_min)
        if skills:
            for skill in skills.split(','):
                profiles = profiles.filter(skills__icontains=skill.strip())

        data = []
        for p in profiles[:20]:
            data.append({
                'user_id':         p.user.id,
                'full_name':       p.full_name,
                'headline':        p.headline,
                'location':        p.location,
                'experience_years':p.experience_years,
                'skills':          p.skills,
                'profile_photo':   request.build_absolute_uri(
                                       p.profile_photo.url
                                   ) if p.profile_photo else None,
            })
        return Response(data)