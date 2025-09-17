from rest_framework import generics, permissions
from .models import Resume
from .serializers import ResumeSerializer

class ResumeCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-parsed_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
