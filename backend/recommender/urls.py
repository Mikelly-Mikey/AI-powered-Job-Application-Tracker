from django.urls import path
from .views import RefreshRecommendationsView

urlpatterns = [
    path('refresh/', RefreshRecommendationsView.as_view(), name='refresh-recommendations'),
]