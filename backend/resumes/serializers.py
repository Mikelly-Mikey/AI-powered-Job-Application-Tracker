from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ["id","user","text","parsed_at"]
        read_only_fields = ["id","parsed_at","user"]
