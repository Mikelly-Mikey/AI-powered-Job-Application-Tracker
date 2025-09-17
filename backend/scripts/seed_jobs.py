# Simple CSV loader for jobs (run with: python manage.py shell < scripts/seed_jobs.py)
import csvfrom jobs.models 
import Job
import sys
reader = csv.DictReader(sys.stdin)
for row in reader:
    Job.objects.create(
        title=row.get("title",""),
        company=row.get("company",""),
        location=row.get("location",""),
        source=row.get("source",""),
        url=row.get("url",""),
        posted_at=row.get("posted_at") or None,
        description_text=row.get("description_text",""),
    )
print("Seeded jobs")
