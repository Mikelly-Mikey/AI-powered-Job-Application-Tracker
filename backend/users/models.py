from mongoengine import Document, EmbeddedDocument, fields
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime
import uuid


class UserProfile(EmbeddedDocument):
    """Embedded document for user profile information"""
    first_name = fields.StringField(max_length=50)
    last_name = fields.StringField(max_length=50)
    phone = fields.StringField(max_length=20)
    location = fields.StringField(max_length=100)
    linkedin_url = fields.URLField()
    github_url = fields.URLField()
    portfolio_url = fields.URLField()
    bio = fields.StringField(max_length=500)
    avatar = fields.StringField()  # URL to avatar image
    
    # Professional information
    current_title = fields.StringField(max_length=100)
    experience_level = fields.StringField(
        max_length=20,
        choices=[
            ('entry', 'Entry Level'),
            ('mid', 'Mid Level'),
            ('senior', 'Senior Level'),
            ('lead', 'Lead/Principal'),
            ('executive', 'Executive')
        ],
        default='entry'
    )
    skills = fields.ListField(fields.StringField(max_length=50))
    industries = fields.ListField(fields.StringField(max_length=50))
    
    # Preferences
    desired_salary_min = fields.IntField()
    desired_salary_max = fields.IntField()
    preferred_locations = fields.ListField(fields.StringField(max_length=100))
    remote_preference = fields.StringField(
        max_length=20,
        choices=[
            ('remote', 'Remote Only'),
            ('hybrid', 'Hybrid'),
            ('onsite', 'On-site Only'),
            ('flexible', 'Flexible')
        ],
        default='flexible'
    )


class UserSettings(EmbeddedDocument):
    """User application settings"""
    email_notifications = fields.BooleanField(default=True)
    push_notifications = fields.BooleanField(default=True)
    weekly_digest = fields.BooleanField(default=True)
    job_alerts = fields.BooleanField(default=True)
    theme = fields.StringField(max_length=10, choices=[('light', 'Light'), ('dark', 'Dark')], default='light')
    timezone = fields.StringField(max_length=50, default='UTC')


class User(Document):
    """Main User document for MongoDB"""
    # Authentication fields
    user_id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    username = fields.StringField(max_length=150, unique=True, required=True)
    email = fields.EmailField(unique=True, required=True)
    password_hash = fields.StringField(required=True)
    
    # Account status
    is_active = fields.BooleanField(default=True)
    is_verified = fields.BooleanField(default=False)
    is_premium = fields.BooleanField(default=False)
    
    # Timestamps
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    last_login = fields.DateTimeField()
    
    # Embedded documents
    profile = fields.EmbeddedDocumentField(UserProfile, default=UserProfile)
    settings = fields.EmbeddedDocumentField(UserSettings, default=UserSettings)
    
    # Verification and security
    email_verification_token = fields.StringField()
    password_reset_token = fields.StringField()
    password_reset_expires = fields.DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
            'created_at',
            ('profile.skills', 'profile.experience_level'),
        ]
    }
    
    def set_password(self, raw_password):
        """Hash and set password"""
        self.password_hash = make_password(raw_password)
        
    def check_password(self, raw_password):
        """Check if provided password matches hash"""
        return check_password(raw_password, self.password_hash)
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'is_premium': self.is_premium,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'profile': {
                'first_name': self.profile.first_name,
                'last_name': self.profile.last_name,
                'phone': self.profile.phone,
                'location': self.profile.location,
                'linkedin_url': self.profile.linkedin_url,
                'github_url': self.profile.github_url,
                'portfolio_url': self.profile.portfolio_url,
                'bio': self.profile.bio,
                'avatar': self.profile.avatar,
                'current_title': self.profile.current_title,
                'experience_level': self.profile.experience_level,
                'skills': self.profile.skills,
                'industries': self.profile.industries,
                'desired_salary_min': self.profile.desired_salary_min,
                'desired_salary_max': self.profile.desired_salary_max,
                'preferred_locations': self.profile.preferred_locations,
                'remote_preference': self.profile.remote_preference,
            },
            'settings': {
                'email_notifications': self.settings.email_notifications,
                'push_notifications': self.settings.push_notifications,
                'weekly_digest': self.settings.weekly_digest,
                'job_alerts': self.settings.job_alerts,
                'theme': self.settings.theme,
                'timezone': self.settings.timezone,
            }
        }
    
    def __str__(self):
        return f"{self.username} ({self.email})"