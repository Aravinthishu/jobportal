from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (RegisterView, MeView, JobSeekerProfileView,
                    RecruiterProfileView, ChangePasswordView, LogoutView)

urlpatterns = [
    path('register/',          RegisterView.as_view(),          name='register'),
    path('login/',             TokenObtainPairView.as_view(),   name='login'),
    path('token/refresh/',     TokenRefreshView.as_view(),      name='token_refresh'),
    path('logout/',            LogoutView.as_view(),            name='logout'),
    path('me/',                MeView.as_view(),                name='me'),
    path('profile/jobseeker/', JobSeekerProfileView.as_view(),  name='jobseeker_profile'),
    path('profile/recruiter/', RecruiterProfileView.as_view(),  name='recruiter_profile'),
    path('change-password/',   ChangePasswordView.as_view(),    name='change_password'),
]

