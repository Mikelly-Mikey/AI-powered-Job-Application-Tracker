from django.urls import path, include
from django.http import JsonResponse
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def api_root(request):
    """Root API endpoint that provides information about available endpoints"""
    return JsonResponse({
        "message": "Welcome to AJAT Backend API",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "authentication": "/api/auth/",
            "users": "/api/users/",
            "jobs": "/api/jobs/",
            "resumes": "/api/resumes/",
            "applications": "/api/applications/",
            "recommendations": "/api/recommendations/",
            "insights": "/api/insights/"
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),  # Root endpoint
    path('api/', api_root, name='api-root-with-slash'),  # API root endpoint with trailing slash
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/', include('users.urls')),  # Custom auth endpoints (register, login, etc.)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/recommendations/', include('recommender.urls')),
    path('api/insights/', include('insights.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)