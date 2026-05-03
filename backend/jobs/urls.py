from django.urls import path
from .views import JobListView, JobDetailView, RecruiterJobsView, SaveJobView, SavedJobsView

urlpatterns = [
    path('',                  JobListView.as_view(),        name='job_list'),
    path('saved/',            SavedJobsView.as_view(),      name='saved_jobs'),
    path('recruiter/mine/',   RecruiterJobsView.as_view(),  name='recruiter_jobs'),
    path('<slug:slug>/save/', SaveJobView.as_view(),         name='save_job'),
    path('<slug:slug>/',      JobDetailView.as_view(),       name='job_detail'),
]