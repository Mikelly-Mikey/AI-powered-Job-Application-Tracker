from django.urls import path
from .views import ResumeCreateView
urlpatterns=[path('', ResumeCreateView.as_view())]
