from django.urls import path
from .views import (
    JobSeekerApplicationsView, ApplicationDetailView,
    RecruiterApplicationsView, UpdateApplicationStatusView,
    ApplicationStatsView, SendInviteView, CandidateSearchView
)

urlpatterns = [
    path('',              JobSeekerApplicationsView.as_view(), name='my_applications'),
    path('<uuid:pk>/',    ApplicationDetailView.as_view(),     name='application_detail'),
    path('recruiter/',    RecruiterApplicationsView.as_view(), name='recruiter_applications'),
    path('recruiter/<uuid:pk>/status/',
                          UpdateApplicationStatusView.as_view(), name='update_status'),
    path('stats/',        ApplicationStatsView.as_view(),      name='application_stats'),
    path('invite/',          SendInviteView.as_view(),      name='send_invite'),
path('candidates/',      CandidateSearchView.as_view(), name='candidate_search'),
]