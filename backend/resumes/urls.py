from django.urls import path
from .views import ResumeCreateView, ExtractSkillsView, ParseResumeView

urlpatterns = [
    path('', ResumeCreateView.as_view(), name='resume-create'),
    path('extract-skills/', ExtractSkillsView.as_view(), name='resume-extract-skills'),
    path('parse/', ParseResumeView.as_view(), name='resume-parse'),
]
