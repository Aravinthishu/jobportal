import django_filters
from .models import Job

class JobFilter(django_filters.FilterSet):
    title       = django_filters.CharFilter(lookup_expr='icontains')
    location    = django_filters.CharFilter(lookup_expr='icontains')
    salary_min  = django_filters.NumberFilter(field_name='salary_min', lookup_expr='gte')
    salary_max  = django_filters.NumberFilter(field_name='salary_max', lookup_expr='lte')
    job_type    = django_filters.MultipleChoiceFilter(choices=Job.JOB_TYPE)
    work_mode   = django_filters.MultipleChoiceFilter(choices=Job.WORK_MODE)
    experience_level = django_filters.MultipleChoiceFilter(choices=Job.EXPERIENCE)
    skills      = django_filters.CharFilter(method='filter_skills')
    company     = django_filters.NumberFilter(field_name='company__id')

    class Meta:
        model  = Job
        fields = ['title', 'location', 'job_type', 'work_mode', 'experience_level', 'status']

    def filter_skills(self, queryset, name, value):
        skills = [s.strip().lower() for s in value.split(',')]
        for skill in skills:
            queryset = queryset.filter(skills_required__icontains=skill)
        return queryset