from django.urls import path
from .views import CompanyListCreateView, CompanyDetailView, MyCompanyView

urlpatterns = [
    path('',        CompanyListCreateView.as_view(), name='company_list'),
    path('<int:pk>/', CompanyDetailView.as_view(),   name='company_detail'),
    path('mine/',   MyCompanyView.as_view(),          name='my_companies'),
]