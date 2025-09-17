from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from jobs.models import Job
from resumes.models import Resume

class RefreshRecommendationsView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
        # Use latest resume text for the user; fallback to empty
        resume = Resume.objects.filter(user=request.user).order_by('-parsed_at').first()
        user_text = resume.text if resume else ""
        jobs = list(Job.objects.all())
        if not jobs:
            return Response({"results": []})

        corpus = [user_text] + [j.description_text for j in jobs]
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        X = vectorizer.fit_transform(corpus)
        user_vec = X[0]
        job_vecs = X[1:]
        sims = cosine_similarity(user_vec, job_vecs).flatten()
        ranked = sorted(zip(jobs, sims), key=lambda x: x[1], reverse=True)[:20]

        results=[{
            "job_id": j.id,
            "title": j.title,
            "company": j.company,
            "score": float(s)
        } for j, s in ranked]
        return Response({"results": results})
