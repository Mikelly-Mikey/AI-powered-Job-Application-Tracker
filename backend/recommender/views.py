from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from jobs.models import Job
from resumes.models import Resume
import re

TOKEN_RE = re.compile(r"[A-Za-z]{2,}")

def tokenize(text: str):
    return set(t.lower() for t in TOKEN_RE.findall(text or ""))

class RefreshRecommendationsView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
        # Use latest resume text for the user; fallback to empty
        resume = None
        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if user_id:
                resume = Resume.objects(user_id=user_id).order_by('-parsed_at').first()
        except Exception:
            resume = None
        user_text = (getattr(resume, 'raw_text', None) or getattr(resume, 'text', None) or "")
        jobs = list(Job.objects.all())
        if not jobs:
            return Response({"results": []})

        # Use description_text if available; fallback to description
        corpus = [user_text] + [getattr(j, 'description_text', getattr(j, 'description', '')) for j in jobs]
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        X = vectorizer.fit_transform(corpus)
        user_vec = X[0]
        job_vecs = X[1:]
        sims = cosine_similarity(user_vec, job_vecs).flatten()
        ranked = sorted(zip(jobs, sims), key=lambda x: x[1], reverse=True)[:20]

        user_tokens = tokenize(user_text)

        results=[]
        for j, s in ranked:
            required_skills = list((j.requirements.required_skills or [])) if getattr(j, 'requirements', None) else []
            job_tokens = set(k.lower() for k in required_skills)
            missing = sorted(list(job_tokens - user_tokens))[:50]
            salary = getattr(j, 'salary', None)
            results.append({
                "job_id": getattr(j, 'id', None) or getattr(j, 'job_id', None),
                "title": j.title,
                "company": getattr(j.company, 'name', None) or getattr(j, 'company', None),
                "location": j.location,
                "remote_type": j.remote_type,
                "salary": {
                    "min": getattr(salary, 'min_salary', None),
                    "max": getattr(salary, 'max_salary', None),
                    "currency": getattr(salary, 'currency', None),
                    "type": getattr(salary, 'salary_type', None),
                } if salary else None,
                "required_skills": required_skills,
                "missing_skills": missing,
                "score": float(s),
            })
        
        return Response({"results": results})
