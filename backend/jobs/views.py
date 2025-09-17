from rest_framework import generics, permissions
from .models import Job
from .serializers import JobSerializer

class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
