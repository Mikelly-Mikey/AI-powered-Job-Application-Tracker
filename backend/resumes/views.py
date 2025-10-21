from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
import os
import json
from typing import Any, Dict

try:
    from openai import OpenAI
    _openai_available = True
except Exception:
    _openai_available = False

class ResumeCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-parsed_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExtractSkillsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Simple keyword-based extraction for demo; replace with LLM if needed
    SKILL_KEYWORDS = {
        'javascript','typescript','react','vue','angular','node','express','nextjs','nestjs',
        'python','django','flask','fastapi','pandas','numpy','scikit-learn','sklearn','tensorflow','pytorch',
        'java','spring','spring boot','kotlin','scala',
        'go','golang','rust',
        'sql','postgres','mysql','mongodb','redis','elasticsearch',
        'graphql','rest','docker','kubernetes','aws','gcp','azure','terraform','ansible',
        'html','css','sass','tailwind','bootstrap',
        'ci/cd','github actions','gitlab ci','jenkins',
        'react native','flutter','swift','objective-c','android','ios',
        'ml','machine learning','nlp','computer vision','llm','transformers'
    }

    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({"skills": [], "detail": "No resume text provided"}, status=400)

        lower = text.lower()
        found = sorted({kw for kw in self.SKILL_KEYWORDS if kw in lower})
        return Response({"skills": found})


class ParseResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({"detail": "No resume text provided"}, status=400)

        if not _openai_available:
            return Response({"detail": "OpenAI client not available on server"}, status=500)

        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_APIKEY')
        if not api_key:
            return Response({"detail": "OPENAI_API_KEY not configured"}, status=500)

        client = OpenAI(api_key=api_key)

        schema: Dict[str, Any] = {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "skills": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "experience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "company": {"type": "string"},
                            "title": {"type": "string"},
                            "location": {"type": "string"},
                            "start_date": {"type": "string"},
                            "end_date": {"type": "string"},
                            "bullets": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["company", "title"]
                    }
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "institution": {"type": "string"},
                            "degree": {"type": "string"},
                            "field": {"type": "string"},
                            "start_date": {"type": "string"},
                            "end_date": {"type": "string"}
                        },
                        "required": ["institution"]
                    }
                }
            },
            "required": ["skills", "experience"]
        }

        prompt = (
            "You are a resume parser. Extract structured JSON from the provided resume text. "
            "Return ONLY JSON matching the provided JSON schema. "
            "Include a concise professional summary if apparent, an array of normalized skills, "
            "experience items (company, title, dates, bullets), and education entries."
        )

        try:
            # Using Chat Completions with JSON schema (OpenAI Python SDK v1+)
            completion = client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "resume_schema",
                        "schema": schema
                    }
                },
                temperature=0.2
            )

            content = completion.choices[0].message.content or "{}"
            data = json.loads(content)
        except Exception as e:
            return Response({"detail": f"LLM parsing failed: {str(e)}"}, status=500)

        return Response(data)
