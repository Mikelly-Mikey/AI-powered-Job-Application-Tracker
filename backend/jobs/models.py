from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime
import uuid


class JobRequirements(EmbeddedDocument):
    """Embedded document for job requirements"""
    required_skills = fields.ListField(fields.StringField(max_length=100))
    preferred_skills = fields.ListField(fields.StringField(max_length=100))
    education_level = fields.StringField(
        max_length=50,
        choices=[
            ('high_school', 'High School'),
            ('associate', 'Associate Degree'),
            ('bachelor', 'Bachelor\'s Degree'),
            ('master', 'Master\'s Degree'),
            ('phd', 'PhD'),
            ('bootcamp', 'Bootcamp/Certificate'),
            ('not_specified', 'Not Specified')
        ],
        default='not_specified'
    )
    experience_years_min = fields.IntField(min_value=0)
    experience_years_max = fields.IntField(min_value=0)
    certifications = fields.ListField(fields.StringField(max_length=100))


class CompanyInfo(EmbeddedDocument):
    """Embedded document for company information"""
    name = fields.StringField(max_length=200, required=True)
    industry = fields.StringField(max_length=100)
    size = fields.StringField(
        max_length=20,
        choices=[
            ('startup', '1-10 employees'),
            ('small', '11-50 employees'),
            ('medium', '51-200 employees'),
            ('large', '201-1000 employees'),
            ('enterprise', '1000+ employees')
        ]
    )
    website = fields.URLField()
    logo_url = fields.URLField()
    description = fields.StringField(max_length=1000)
    rating = fields.FloatField(min_value=0, max_value=5)
    glassdoor_url = fields.URLField()


class SalaryInfo(EmbeddedDocument):
    """Embedded document for salary information"""
    min_salary = fields.IntField(min_value=0)
    max_salary = fields.IntField(min_value=0)
    currency = fields.StringField(max_length=3, default='USD')
    salary_type = fields.StringField(
        max_length=20,
        choices=[
            ('hourly', 'Hourly'),
            ('annual', 'Annual'),
            ('contract', 'Contract'),
            ('not_specified', 'Not Specified')
        ],
        default='annual'
    )
    equity = fields.BooleanField(default=False)
    bonus_eligible = fields.BooleanField(default=False)


class JobBenefits(EmbeddedDocument):
    """Embedded document for job benefits"""
    health_insurance = fields.BooleanField(default=False)
    dental_insurance = fields.BooleanField(default=False)
    vision_insurance = fields.BooleanField(default=False)
    retirement_plan = fields.BooleanField(default=False)
    paid_time_off = fields.IntField(min_value=0)  # days per year
    flexible_schedule = fields.BooleanField(default=False)
    remote_work = fields.BooleanField(default=False)
    professional_development = fields.BooleanField(default=False)
    gym_membership = fields.BooleanField(default=False)
    free_meals = fields.BooleanField(default=False)
    other_benefits = fields.ListField(fields.StringField(max_length=100))


class Job(Document):
    """Main Job document for MongoDB"""
    job_id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic job information
    title = fields.StringField(max_length=200, required=True)
    description = fields.StringField(required=True)
    job_type = fields.StringField(
        max_length=20,
        choices=[
            ('full_time', 'Full Time'),
            ('part_time', 'Part Time'),
            ('contract', 'Contract'),
            ('temporary', 'Temporary'),
            ('internship', 'Internship'),
            ('freelance', 'Freelance')
        ],
        default='full_time'
    )
    
    # Location information
    location = fields.StringField(max_length=200)
    remote_type = fields.StringField(
        max_length=20,
        choices=[
            ('remote', 'Remote'),
            ('hybrid', 'Hybrid'),
            ('onsite', 'On-site'),
            ('flexible', 'Flexible')
        ],
        default='onsite'
    )
    city = fields.StringField(max_length=100)
    state = fields.StringField(max_length=50)
    country = fields.StringField(max_length=50, default='USA')
    
    # Source information
    source = fields.StringField(max_length=100)  # LinkedIn, Indeed, etc.
    source_url = fields.URLField()
    external_id = fields.StringField(max_length=200)  # ID from source platform
    
    # Embedded documents
    company = fields.EmbeddedDocumentField(CompanyInfo, required=True)
    requirements = fields.EmbeddedDocumentField(JobRequirements, default=JobRequirements)
    salary = fields.EmbeddedDocumentField(SalaryInfo, default=SalaryInfo)
    benefits = fields.EmbeddedDocumentField(JobBenefits, default=JobBenefits)
    
    # Status and metadata
    is_active = fields.BooleanField(default=True)
    posted_date = fields.DateTimeField()
    application_deadline = fields.DateTimeField()
    
    # AI-generated fields
    ai_summary = fields.StringField(max_length=500)
    ai_match_score = fields.FloatField(min_value=0, max_value=100)  # AI-calculated match score
    ai_tags = fields.ListField(fields.StringField(max_length=50))
    
    # Timestamps
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    scraped_at = fields.DateTimeField()
    
    # Analytics
    view_count = fields.IntField(default=0)
    application_count = fields.IntField(default=0)
    
    meta = {
        'collection': 'jobs',
        'indexes': [
            'title',
            'company.name',
            'location',
            'job_type',
            'remote_type',
            'posted_date',
            'created_at',
            'is_active',
            ('requirements.required_skills', 'location'),
            ('ai_match_score', '-posted_date'),
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save()
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'job_id': self.job_id,
            'title': self.title,
            'description': self.description,
            'job_type': self.job_type,
            'location': self.location,
            'remote_type': self.remote_type,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'source': self.source,
            'source_url': self.source_url,
            'company': {
                'name': self.company.name,
                'industry': self.company.industry,
                'size': self.company.size,
                'website': self.company.website,
                'logo_url': self.company.logo_url,
                'description': self.company.description,
                'rating': self.company.rating,
            },
            'requirements': {
                'required_skills': self.requirements.required_skills,
                'preferred_skills': self.requirements.preferred_skills,
                'education_level': self.requirements.education_level,
                'experience_years_min': self.requirements.experience_years_min,
                'experience_years_max': self.requirements.experience_years_max,
                'certifications': self.requirements.certifications,
            },
            'salary': {
                'min_salary': self.salary.min_salary,
                'max_salary': self.salary.max_salary,
                'currency': self.salary.currency,
                'salary_type': self.salary.salary_type,
                'equity': self.salary.equity,
                'bonus_eligible': self.salary.bonus_eligible,
            },
            'benefits': {
                'health_insurance': self.benefits.health_insurance,
                'dental_insurance': self.benefits.dental_insurance,
                'vision_insurance': self.benefits.vision_insurance,
                'retirement_plan': self.benefits.retirement_plan,
                'paid_time_off': self.benefits.paid_time_off,
                'flexible_schedule': self.benefits.flexible_schedule,
                'remote_work': self.benefits.remote_work,
                'professional_development': self.benefits.professional_development,
                'other_benefits': self.benefits.other_benefits,
            },
            'is_active': self.is_active,
            'posted_date': self.posted_date.isoformat() if self.posted_date else None,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'ai_summary': self.ai_summary,
            'ai_match_score': self.ai_match_score,
            'ai_tags': self.ai_tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'view_count': self.view_count,
            'application_count': self.application_count,
        }
    
    def __str__(self):
        return f"{self.title} @ {self.company.name}"