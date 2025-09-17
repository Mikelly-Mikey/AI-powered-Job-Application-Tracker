import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from resumes.models import Resume

TOKEN_RE = re.compile(r"[A-Za-z]{2,}")

def tokenize(text):
    return set(t.lower() for t in TOKEN_RE.findall(text or ""))

class GapAnalysisView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"detail": "job_id is required"}, status=400)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"detail": "Job not found"}, status=404)

        resume = Resume.objects.filter(user=request.user).order_by('-parsed_at').first()
        user_tokens = tokenize(resume.text if resume else "")
        job_tokens = tokenize(job.description_text)

        missing = sorted(list(job_tokens - user_tokens))[:50]
        coverage = round(len(job_tokens & user_tokens) / (len(job_tokens) or 1), 3)
        return Response({"job_id": job.id, "missing_keywords": missing, "coverage": coverage})
