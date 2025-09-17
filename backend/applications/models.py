from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime
import uuid


class InterviewRound(EmbeddedDocument):
    """Embedded document for interview rounds"""
    round_type = fields.StringField(
        max_length=30,
        choices=[
            ('phone_screen', 'Phone Screen'),
            ('technical', 'Technical Interview'),
            ('behavioral', 'Behavioral Interview'),
            ('system_design', 'System Design'),
            ('coding', 'Coding Challenge'),
            ('panel', 'Panel Interview'),
            ('final', 'Final Interview'),
            ('hr', 'HR Interview'),
            ('other', 'Other')
        ]
    )
    scheduled_date = fields.DateTimeField()
    duration_minutes = fields.IntField()
    interviewer_name = fields.StringField(max_length=100)
    interviewer_title = fields.StringField(max_length=100)
    interviewer_email = fields.EmailField()
    location = fields.StringField(max_length=200)  # Office address or "Video Call"
    meeting_link = fields.URLField()
    
    # Interview outcome
    completed = fields.BooleanField(default=False)
    feedback = fields.StringField(max_length=1000)
    rating = fields.IntField(min_value=1, max_value=5)  # 1-5 rating
    next_steps = fields.StringField(max_length=500)
    
    # Notes and preparation
    preparation_notes = fields.StringField(max_length=1000)
    questions_asked = fields.ListField(fields.StringField(max_length=500))
    questions_to_ask = fields.ListField(fields.StringField(max_length=500))
    
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)


class ApplicationDocument(EmbeddedDocument):
    """Embedded document for application documents"""
    document_type = fields.StringField(
        max_length=20,
        choices=[
            ('resume', 'Resume'),
            ('cover_letter', 'Cover Letter'),
            ('portfolio', 'Portfolio'),
            ('transcript', 'Transcript'),
            ('certificate', 'Certificate'),
            ('other', 'Other')
        ]
    )
    file_name = fields.StringField(max_length=255)
    file_path = fields.StringField(max_length=500)
    file_size = fields.IntField()  # in bytes
    uploaded_at = fields.DateTimeField(default=datetime.utcnow)
    is_primary = fields.BooleanField(default=False)  # Primary resume/cover letter


class ApplicationTimeline(EmbeddedDocument):
    """Embedded document for application timeline events"""
    event_type = fields.StringField(
        max_length=30,
        choices=[
            ('saved', 'Job Saved'),
            ('applied', 'Application Submitted'),
            ('viewed', 'Application Viewed'),
            ('phone_screen', 'Phone Screen Scheduled'),
            ('interview_scheduled', 'Interview Scheduled'),
            ('interview_completed', 'Interview Completed'),
            ('reference_check', 'Reference Check'),
            ('offer_received', 'Offer Received'),
            ('offer_accepted', 'Offer Accepted'),
            ('offer_declined', 'Offer Declined'),
            ('rejected', 'Application Rejected'),
            ('withdrawn', 'Application Withdrawn'),
            ('follow_up', 'Follow-up Sent'),
            ('note_added', 'Note Added')
        ]
    )
    description = fields.StringField(max_length=500)
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    created_by_system = fields.BooleanField(default=False)


class OfferDetails(EmbeddedDocument):
    """Embedded document for job offer details"""
    base_salary = fields.IntField()
    currency = fields.StringField(max_length=3, default='USD')
    bonus = fields.IntField()
    equity_percentage = fields.FloatField()
    equity_value = fields.IntField()
    start_date = fields.DateTimeField()
    benefits_summary = fields.StringField(max_length=1000)
    vacation_days = fields.IntField()
    remote_work_allowed = fields.BooleanField()
    relocation_assistance = fields.BooleanField()
    signing_bonus = fields.IntField()
    
    # Offer timeline
    offer_date = fields.DateTimeField()
    response_deadline = fields.DateTimeField()
    negotiation_notes = fields.StringField(max_length=1000)
    
    # Decision
    accepted = fields.BooleanField()
    declined_reason = fields.StringField(max_length=500)


class Application(Document):
    """Main Application document for MongoDB"""
    application_id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # References
    user_id = fields.StringField(required=True)  # Reference to User
    job_id = fields.StringField(required=True)   # Reference to Job
    
    # Application status
    status = fields.StringField(
        max_length=20,
        choices=[
            ('saved', 'Saved'),
            ('applied', 'Applied'),
            ('phone_screen', 'Phone Screen'),
            ('interviewing', 'Interviewing'),
            ('offer', 'Offer Received'),
            ('accepted', 'Offer Accepted'),
            ('rejected', 'Rejected'),
            ('withdrawn', 'Withdrawn'),
            ('archived', 'Archived')
        ],
        default='saved'
    )
    
    # Application details
    applied_date = fields.DateTimeField()
    application_method = fields.StringField(
        max_length=30,
        choices=[
            ('company_website', 'Company Website'),
            ('linkedin', 'LinkedIn'),
            ('indeed', 'Indeed'),
            ('glassdoor', 'Glassdoor'),
            ('referral', 'Referral'),
            ('recruiter', 'Recruiter'),
            ('job_fair', 'Job Fair'),
            ('other', 'Other')
        ]
    )
    
    # Contact information
    recruiter_name = fields.StringField(max_length=100)
    recruiter_email = fields.EmailField()
    recruiter_phone = fields.StringField(max_length=20)
    hiring_manager_name = fields.StringField(max_length=100)
    hiring_manager_email = fields.EmailField()
    
    # Application materials
    documents = fields.ListField(fields.EmbeddedDocumentField(ApplicationDocument))
    cover_letter_text = fields.StringField()
    
    # Interview process
    interviews = fields.ListField(fields.EmbeddedDocumentField(InterviewRound))
    
    # Offer information
    offer = fields.EmbeddedDocumentField(OfferDetails)
    
    # Notes and tracking
    notes = fields.StringField()
    private_notes = fields.StringField()  # Private notes not shared
    priority = fields.StringField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('urgent', 'Urgent')
        ],
        default='medium'
    )
    
    # Timeline and reminders
    timeline = fields.ListField(fields.EmbeddedDocumentField(ApplicationTimeline))
    next_follow_up = fields.DateTimeField()
    reminder_date = fields.DateTimeField()
    
    # AI insights
    ai_match_score = fields.FloatField(min_value=0, max_value=100)
    ai_recommendations = fields.ListField(fields.StringField(max_length=200))
    ai_interview_prep = fields.StringField(max_length=1000)
    
    # Timestamps
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'applications',
        'indexes': [
            'user_id',
            'job_id',
            'status',
            'applied_date',
            'created_at',
            'priority',
            ('user_id', 'status'),
            ('user_id', 'created_at'),
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp and timeline"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def add_timeline_event(self, event_type, description=None, created_by_system=False):
        """Add a new timeline event"""
        event = ApplicationTimeline(
            event_type=event_type,
            description=description or f"Status changed to {event_type}",
            created_by_system=created_by_system
        )
        self.timeline.append(event)
        self.save()
    
    def update_status(self, new_status, description=None):
        """Update application status and add timeline event"""
        old_status = self.status
        self.status = new_status
        self.add_timeline_event(
            new_status,
            description or f"Status changed from {old_status} to {new_status}",
            created_by_system=True
        )
    
    def schedule_interview(self, interview_data):
        """Schedule a new interview"""
        interview = InterviewRound(**interview_data)
        self.interviews.append(interview)
        self.add_timeline_event('interview_scheduled', f"{interview.round_type} interview scheduled")
        self.save()
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'application_id': self.application_id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'status': self.status,
            'applied_date': self.applied_date.isoformat() if self.applied_date else None,
            'application_method': self.application_method,
            'recruiter_name': self.recruiter_name,
            'recruiter_email': self.recruiter_email,
            'recruiter_phone': self.recruiter_phone,
            'hiring_manager_name': self.hiring_manager_name,
            'hiring_manager_email': self.hiring_manager_email,
            'documents': [
                {
                    'document_type': doc.document_type,
                    'file_name': doc.file_name,
                    'file_path': doc.file_path,
                    'file_size': doc.file_size,
                    'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                    'is_primary': doc.is_primary,
                } for doc in self.documents
            ],
            'cover_letter_text': self.cover_letter_text,
            'interviews': [
                {
                    'round_type': interview.round_type,
                    'scheduled_date': interview.scheduled_date.isoformat() if interview.scheduled_date else None,
                    'duration_minutes': interview.duration_minutes,
                    'interviewer_name': interview.interviewer_name,
                    'interviewer_title': interview.interviewer_title,
                    'location': interview.location,
                    'meeting_link': interview.meeting_link,
                    'completed': interview.completed,
                    'feedback': interview.feedback,
                    'rating': interview.rating,
                    'next_steps': interview.next_steps,
                } for interview in self.interviews
            ],
            'offer': {
                'base_salary': self.offer.base_salary,
                'currency': self.offer.currency,
                'bonus': self.offer.bonus,
                'equity_percentage': self.offer.equity_percentage,
                'start_date': self.offer.start_date.isoformat() if self.offer.start_date else None,
                'benefits_summary': self.offer.benefits_summary,
                'vacation_days': self.offer.vacation_days,
                'remote_work_allowed': self.offer.remote_work_allowed,
                'offer_date': self.offer.offer_date.isoformat() if self.offer.offer_date else None,
                'response_deadline': self.offer.response_deadline.isoformat() if self.offer.response_deadline else None,
                'accepted': self.offer.accepted,
            } if self.offer else None,
            'notes': self.notes,
            'priority': self.priority,
            'timeline': [
                {
                    'event_type': event.event_type,
                    'description': event.description,
                    'timestamp': event.timestamp.isoformat() if event.timestamp else None,
                    'created_by_system': event.created_by_system,
                } for event in self.timeline
            ],
            'next_follow_up': self.next_follow_up.isoformat() if self.next_follow_up else None,
            'reminder_date': self.reminder_date.isoformat() if self.reminder_date else None,
            'ai_match_score': self.ai_match_score,
            'ai_recommendations': self.ai_recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __str__(self):
        return f"Application {self.application_id} - Status: {self.status}"