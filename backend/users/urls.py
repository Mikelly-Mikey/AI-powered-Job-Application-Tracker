from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    MeView, 
    UserProfileView, 
    ChangePasswordView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('me/', MeView.as_view(), name='user-me'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:user_id>/', UserProfileView.as_view(), name='user-profile-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]