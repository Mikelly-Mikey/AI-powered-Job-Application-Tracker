from django.urls import path
from .views import ResumeCreateView, ExtractSkillsView, ParseResumeView, ResumeUploadView, ResumeListView, ResumeTextCreateView

urlpatterns = [
    path('', ResumeCreateView.as_view(), name='resume-create'),
    path('list/', ResumeListView.as_view(), name='resume-list'),
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('text/', ResumeTextCreateView.as_view(), name='resume-text-create'),
    path('extract-skills/', ExtractSkillsView.as_view(), name='resume-extract-skills'),
    path('parse/', ParseResumeView.as_view(), name='resume-parse'),
]
