from rest_framework import generics, permissions
from .models import Application
from .serializers import ApplicationSerializer

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user).select_related("job").order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)
