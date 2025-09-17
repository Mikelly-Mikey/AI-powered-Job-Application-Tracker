from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime
import uuid


class WorkExperience(EmbeddedDocument):
    """Embedded document for work experience"""
    company = fields.StringField(max_length=200, required=True)
    position = fields.StringField(max_length=200, required=True)
    location = fields.StringField(max_length=100)
    start_date = fields.DateTimeField()
    end_date = fields.DateTimeField()  # None if current position
    is_current = fields.BooleanField(default=False)
    description = fields.StringField()
    achievements = fields.ListField(fields.StringField(max_length=500))
    technologies = fields.ListField(fields.StringField(max_length=50))
    
    def duration_months(self):
        """Calculate duration in months"""
        end = self.end_date or datetime.utcnow()
        if self.start_date:
            return (end.year - self.start_date.year) * 12 + (end.month - self.start_date.month)
        return 0


class Education(EmbeddedDocument):
    """Embedded document for education"""
    institution = fields.StringField(max_length=200, required=True)
    degree = fields.StringField(max_length=100)
    field_of_study = fields.StringField(max_length=100)
    location = fields.StringField(max_length=100)
    start_date = fields.DateTimeField()
    end_date = fields.DateTimeField()
    gpa = fields.FloatField(min_value=0, max_value=4.0)
    honors = fields.ListField(fields.StringField(max_length=100))
    relevant_coursework = fields.ListField(fields.StringField(max_length=100))
    activities = fields.ListField(fields.StringField(max_length=200))


class Project(EmbeddedDocument):
    """Embedded document for projects"""
    name = fields.StringField(max_length=200, required=True)
    description = fields.StringField()
    technologies = fields.ListField(fields.StringField(max_length=50))
    url = fields.URLField()
    github_url = fields.URLField()
    start_date = fields.DateTimeField()
    end_date = fields.DateTimeField()
    achievements = fields.ListField(fields.StringField(max_length=500))
    role = fields.StringField(max_length=100)  # Team lead, contributor, etc.


class Certification(EmbeddedDocument):
    """Embedded document for certifications"""
    name = fields.StringField(max_length=200, required=True)
    issuing_organization = fields.StringField(max_length=200)
    issue_date = fields.DateTimeField()
    expiration_date = fields.DateTimeField()
    credential_id = fields.StringField(max_length=100)
    credential_url = fields.URLField()
    skills = fields.ListField(fields.StringField(max_length=50))


class Skill(EmbeddedDocument):
    """Embedded document for skills with proficiency"""
    name = fields.StringField(max_length=100, required=True)
    category = fields.StringField(
        max_length=50,
        choices=[
            ('programming', 'Programming Languages'),
            ('framework', 'Frameworks & Libraries'),
            ('database', 'Databases'),
            ('tool', 'Tools & Software'),
            ('cloud', 'Cloud Platforms'),
            ('soft_skill', 'Soft Skills'),
            ('language', 'Languages'),
            ('other', 'Other')
        ],
        default='other'
    )
    proficiency = fields.StringField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert')
        ],
        default='intermediate'
    )
    years_experience = fields.IntField(min_value=0)
    last_used = fields.DateTimeField()


class ParsedContent(EmbeddedDocument):
    """Embedded document for AI-parsed resume content"""
    contact_info = fields.DictField()
    summary = fields.StringField()
    skills_extracted = fields.ListField(fields.StringField(max_length=100))
    experience_summary = fields.StringField()
    education_summary = fields.StringField()
    total_experience_years = fields.IntField()
    key_achievements = fields.ListField(fields.StringField(max_length=500))
    industry_keywords = fields.ListField(fields.StringField(max_length=50))
    
    # AI analysis
    ai_score = fields.FloatField(min_value=0, max_value=100)
    ai_feedback = fields.StringField()
    improvement_suggestions = fields.ListField(fields.StringField(max_length=200))
    missing_keywords = fields.ListField(fields.StringField(max_length=50))


class Resume(Document):
    """Main Resume document for MongoDB"""
    resume_id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = fields.StringField(required=True)  # Reference to User
    
    # Basic information
    title = fields.StringField(max_length=200, default="My Resume")
    is_primary = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)
    
    # File information
    original_filename = fields.StringField(max_length=255)
    file_path = fields.StringField(max_length=500)
    file_size = fields.IntField()  # in bytes
    file_type = fields.StringField(max_length=10)  # pdf, docx, txt
    
    # Raw content
    raw_text = fields.StringField()  # Extracted text from file
    
    # Structured data
    work_experience = fields.ListField(fields.EmbeddedDocumentField(WorkExperience))
    education = fields.ListField(fields.EmbeddedDocumentField(Education))
    projects = fields.ListField(fields.EmbeddedDocumentField(Project))
    certifications = fields.ListField(fields.EmbeddedDocumentField(Certification))
    skills = fields.ListField(fields.EmbeddedDocumentField(Skill))
    
    # Additional sections
    languages = fields.ListField(fields.DictField())  # [{"language": "Spanish", "proficiency": "Fluent"}]
    volunteer_experience = fields.ListField(fields.DictField())
    publications = fields.ListField(fields.DictField())
    awards = fields.ListField(fields.DictField())
    
    # AI-parsed content
    parsed_content = fields.EmbeddedDocumentField(ParsedContent)
    
    # Processing status
    processing_status = fields.StringField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    processing_error = fields.StringField()
    
    # Version control
    version = fields.IntField(default=1)
    parent_resume_id = fields.StringField()  # For resume versions
    
    # Analytics
    view_count = fields.IntField(default=0)
    download_count = fields.IntField(default=0)
    application_count = fields.IntField(default=0)  # How many times used in applications
    
    # Timestamps
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    parsed_at = fields.DateTimeField()
    last_used_at = fields.DateTimeField()
    
    meta = {
        'collection': 'resumes',
        'indexes': [
            'user_id',
            'is_primary',
            'is_active',
            'created_at',
            'processing_status',
            ('user_id', 'is_primary'),
            ('user_id', 'created_at'),
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def set_as_primary(self):
        """Set this resume as primary and unset others"""
        # First, unset all other primary resumes for this user
        Resume.objects(user_id=self.user_id, is_primary=True).update(is_primary=False)
        # Then set this one as primary
        self.is_primary = True
        self.save()
    
    def calculate_total_experience(self):
        """Calculate total work experience in years"""
        total_months = sum(exp.duration_months() for exp in self.work_experience)
        return round(total_months / 12, 1)
    
    def get_skills_by_category(self):
        """Group skills by category"""
        skills_by_category = {}
        for skill in self.skills:
            category = skill.category
            if category not in skills_by_category:
                skills_by_category[category] = []
            skills_by_category[category].append({
                'name': skill.name,
                'proficiency': skill.proficiency,
                'years_experience': skill.years_experience
            })
        return skills_by_category
    
    def get_recent_experience(self, years=5):
        """Get work experience from the last N years"""
        cutoff_date = datetime.utcnow().replace(year=datetime.utcnow().year - years)
        return [exp for exp in self.work_experience 
                if exp.start_date and exp.start_date >= cutoff_date]
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'resume_id': self.resume_id,
            'user_id': self.user_id,
            'title': self.title,
            'is_primary': self.is_primary,
            'is_active': self.is_active,
            'original_filename': self.original_filename,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'work_experience': [
                {
                    'company': exp.company,
                    'position': exp.position,
                    'location': exp.location,
                    'start_date': exp.start_date.isoformat() if exp.start_date else None,
                    'end_date': exp.end_date.isoformat() if exp.end_date else None,
                    'is_current': exp.is_current,
                    'description': exp.description,
                    'achievements': exp.achievements,
                    'technologies': exp.technologies,
                } for exp in self.work_experience
            ],
            'education': [
                {
                    'institution': edu.institution,
                    'degree': edu.degree,
                    'field_of_study': edu.field_of_study,
                    'location': edu.location,
                    'start_date': edu.start_date.isoformat() if edu.start_date else None,
                    'end_date': edu.end_date.isoformat() if edu.end_date else None,
                    'gpa': edu.gpa,
                    'honors': edu.honors,
                } for edu in self.education
            ],
            'projects': [
                {
                    'name': proj.name,
                    'description': proj.description,
                    'technologies': proj.technologies,
                    'url': proj.url,
                    'github_url': proj.github_url,
                    'role': proj.role,
                } for proj in self.projects
            ],
            'certifications': [
                {
                    'name': cert.name,
                    'issuing_organization': cert.issuing_organization,
                    'issue_date': cert.issue_date.isoformat() if cert.issue_date else None,
                    'expiration_date': cert.expiration_date.isoformat() if cert.expiration_date else None,
                    'credential_id': cert.credential_id,
                    'credential_url': cert.credential_url,
                } for cert in self.certifications
            ],
            'skills': [
                {
                    'name': skill.name,
                    'category': skill.category,
                    'proficiency': skill.proficiency,
                    'years_experience': skill.years_experience,
                } for skill in self.skills
            ],
            'languages': self.languages,
            'volunteer_experience': self.volunteer_experience,
            'publications': self.publications,
            'awards': self.awards,
            'parsed_content': {
                'contact_info': self.parsed_content.contact_info,
                'summary': self.parsed_content.summary,
                'skills_extracted': self.parsed_content.skills_extracted,
                'total_experience_years': self.parsed_content.total_experience_years,
                'ai_score': self.parsed_content.ai_score,
                'ai_feedback': self.parsed_content.ai_feedback,
                'improvement_suggestions': self.parsed_content.improvement_suggestions,
            } if self.parsed_content else None,
            'processing_status': self.processing_status,
            'version': self.version,
            'view_count': self.view_count,
            'download_count': self.download_count,
            'application_count': self.application_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'parsed_at': self.parsed_at.isoformat() if self.parsed_at else None,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
        }
    
    def __str__(self):
        return f"{self.title} - {self.user_id}"