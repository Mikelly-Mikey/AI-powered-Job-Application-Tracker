from django.urls import path
from .views import GapAnalysisView

urlpatterns = [
    path('gap/', GapAnalysisView.as_view(), name='gap-analysis'),
]
