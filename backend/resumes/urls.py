from django.urls import path
from .views import (
    ResumeListCreateView, ResumeDetailView, SetPrimaryResumeView,
    EducationListCreateView, EducationDetailView,
    ExperienceListCreateView, ExperienceDetailView,
    PublicProfileView,
)

urlpatterns = [
    path('resumes/',                    ResumeListCreateView.as_view(),   name='resumes'),
    path('resumes/<uuid:pk>/',          ResumeDetailView.as_view(),       name='resume_detail'),
    path('resumes/<uuid:pk>/primary/',  SetPrimaryResumeView.as_view(),   name='set_primary'),
    path('education/',                  EducationListCreateView.as_view(),name='education'),
    path('education/<int:pk>/',         EducationDetailView.as_view(),    name='education_detail'),
    path('experience/',                 ExperienceListCreateView.as_view(),name='experience'),
    path('experience/<int:pk>/',        ExperienceDetailView.as_view(),   name='experience_detail'),
    path('profile/<int:user_id>/',      PublicProfileView.as_view(),      name='public_profile'),
]