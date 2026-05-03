from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Company
from .serializers import CompanySerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class CompanyListCreateView(generics.ListCreateAPIView):
    queryset           = Company.objects.all()
    serializer_class   = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['name', 'industry', 'headquarters']
    filterset_fields   = ['industry', 'is_verified']
    parser_classes     = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Company.objects.all()
    serializer_class   = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser]


class MyCompanyView(generics.ListAPIView):
    serializer_class   = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(created_by=self.request.user)