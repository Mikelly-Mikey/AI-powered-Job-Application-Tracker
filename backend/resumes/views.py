from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from datetime import datetime
from .models import Resume
from .serializers import ResumeSerializer
from .utils import extract_text_from_file
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
            # Try to resolve from resume_id or latest
            resume_id = request.data.get('resume_id')
            try:
                user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
                resume = None
                if resume_id:
                    resume = Resume.objects(user_id=user_id, resume_id=resume_id).first()
                if not resume and user_id:
                    resume = Resume.objects(user_id=user_id).order_by('-parsed_at').first()
                text = getattr(resume, 'raw_text', None) or getattr(resume, 'text', None)
            except Exception:
                text = None
        if not text:
            return Response({"skills": [], "detail": "No resume text provided"}, status=400)

        # Try OpenAI extraction first if configured
        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_APIKEY')
        if _openai_available and api_key:
            try:
                client = OpenAI(api_key=api_key)
                completion = client.chat.completions.create(
                    model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
                    messages=[
                        {"role": "system", "content": "Extract a de-duplicated list of professional skills, technologies, frameworks, and tools from the resume text. Return ONLY JSON array of strings. No explanations."},
                        {"role": "user", "content": text},
                    ],
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": "skills_schema",
                            "schema": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        }
                    },
                    temperature=0.0
                )
                content = completion.choices[0].message.content or "[]"
                data = json.loads(content)
                if isinstance(data, list):
                    # Normalize skills
                    skills = sorted({str(s).strip() for s in data if str(s).strip()})
                    return Response({"skills": skills})
            except Exception:
                # Fallback to keyword-based extraction
                pass

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


class ResumeTextCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text = request.data.get('text')
        title = request.data.get('title') or 'My Resume'
        if not text:
            return Response({"detail": "No resume text provided"}, status=400)

        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response({"detail": "Invalid user"}, status=401)

            r = Resume(
                user_id=user_id,
                title=title,
                raw_text=text,
                file_type='txt',
                parsed_at=datetime.utcnow(),
            )
            # Set primary if none exists
            try:
                existing_primary = Resume.objects(user_id=user_id, is_primary=True).first()
                if not existing_primary:
                    r.is_primary = True
            except Exception:
                pass
            r.save()
            return Response(r.to_dict(), status=201)
        except Exception as e:
            return Response({"detail": f"Failed to save resume: {str(e)}"}, status=500)


class ResumeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response([], status=200)
            qs = Resume.objects(user_id=user_id).order_by('-created_at')
            items = []
            for r in qs:
                items.append({
                    'resume_id': r.resume_id,
                    'title': r.title,
                    'is_primary': r.is_primary,
                    'created_at': r.created_at.isoformat() if r.created_at else None,
                    'parsed_at': r.parsed_at.isoformat() if r.parsed_at else None,
                    'file_type': r.file_type,
                    'file_size': r.file_size,
                })
            return Response(items)
        except Exception:
            return Response([], status=200)


class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title') or 'My Resume'
        if not file:
            return Response({'detail': 'No file uploaded'}, status=400)

        # Validate extension
        name = getattr(file, 'name', 'resume')
        ext = os.path.splitext(name)[1].lower().lstrip('.')
        if ext not in ('pdf', 'docx'):
            return Response({'detail': 'Unsupported file type. Please upload a PDF or DOCX.'}, status=400)

        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response({'detail': 'Invalid user'}, status=401)

            # Save file to media
            base_dir = os.path.join(settings.MEDIA_ROOT, 'resumes', user_id)
            os.makedirs(base_dir, exist_ok=True)
            safe_name = name.replace('/', '_').replace('\\', '_')
            target_path = os.path.join(base_dir, safe_name)
            with open(target_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Extract text
            text = extract_text_from_file(target_path, ext)

            # Create resume document
            r = Resume(
                user_id=user_id,
                title=title,
                original_filename=name,
                file_path=target_path,
                file_size=getattr(file, 'size', None),
                file_type=ext,
                raw_text=text,
                parsed_at=datetime.utcnow()
            )
            # Set primary if none exists
            try:
                existing_primary = Resume.objects(user_id=user_id, is_primary=True).first()
                if not existing_primary:
                    r.is_primary = True
            except Exception:
                pass
            r.save()

            return Response({
                'resume': r.to_dict(),
                'text': text,
            }, status=201)
        except Exception as e:
            return Response({'detail': f'Upload failed: {str(e)}'}, status=500)
