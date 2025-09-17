#!/usr/bin/env python
"""
Database initialization script for AJAT
Creates initial data and indexes for MongoDB
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import Django settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ajat_backend.settings')
django.setup()

from users.models import User, UserProfile, UserSettings
from jobs.models import Job, CompanyInfo, JobRequirements, SalaryInfo, JobBenefits
from applications.models import Application
from resumes.models import Resume


def create_sample_user():
    """Create a sample user for testing"""
    print("Creating sample user...")
    
    # Check if user already exists
    if User.objects(username='demo').first():
        print("Demo user already exists")
        return User.objects(username='demo').first()
    
    user = User(
        username='demo',
        email='demo@ajat.com'
    )
    user.set_password('demo123')
    
    # Set profile information
    user.profile.first_name = 'Demo'
    user.profile.last_name = 'User'
    user.profile.current_title = 'Software Engineer'
    user.profile.experience_level = 'mid'
    user.profile.skills = ['Python', 'JavaScript', 'React', 'Django', 'MongoDB']
    user.profile.industries = ['Technology', 'Software']
    user.profile.desired_salary_min = 80000
    user.profile.desired_salary_max = 120000
    user.profile.preferred_locations = ['San Francisco', 'New York', 'Remote']
    user.profile.remote_preference = 'flexible'
    
    user.save()
    print(f"Created user: {user.username}")
    return user


def create_sample_jobs():
    """Create sample job listings"""
    print("Creating sample jobs...")
    
    sample_jobs = [
        {
            'title': 'Senior Frontend Developer',
            'description': 'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user-facing features using React and TypeScript.',
            'company': {
                'name': 'TechCorp Inc.',
                'industry': 'Technology',
                'size': 'large',
                'website': 'https://techcorp.com',
                'description': 'Leading technology company focused on innovation.'
            },
            'location': 'San Francisco, CA',
            'remote_type': 'hybrid',
            'job_type': 'full_time',
            'requirements': {
                'required_skills': ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
                'preferred_skills': ['Next.js', 'GraphQL', 'Node.js'],
                'experience_years_min': 3,
                'experience_years_max': 7,
                'education_level': 'bachelor'
            },
            'salary': {
                'min_salary': 120000,
                'max_salary': 160000,
                'salary_type': 'annual',
                'equity': True,
                'bonus_eligible': True
            },
            'benefits': {
                'health_insurance': True,
                'dental_insurance': True,
                'vision_insurance': True,
                'retirement_plan': True,
                'paid_time_off': 25,
                'flexible_schedule': True,
                'remote_work': True,
                'professional_development': True
            }
        },
        {
            'title': 'Full Stack Engineer',
            'description': 'Join our startup as a Full Stack Engineer. Work with Python, Django, React, and PostgreSQL to build scalable web applications.',
            'company': {
                'name': 'StartupXYZ',
                'industry': 'Technology',
                'size': 'startup',
                'website': 'https://startupxyz.com',
                'description': 'Fast-growing startup disrupting the fintech space.'
            },
            'location': 'New York, NY',
            'remote_type': 'remote',
            'job_type': 'full_time',
            'requirements': {
                'required_skills': ['Python', 'Django', 'React', 'PostgreSQL', 'JavaScript'],
                'preferred_skills': ['Docker', 'AWS', 'Redis'],
                'experience_years_min': 2,
                'experience_years_max': 5,
                'education_level': 'bachelor'
            },
            'salary': {
                'min_salary': 100000,
                'max_salary': 140000,
                'salary_type': 'annual',
                'equity': True,
                'bonus_eligible': False
            },
            'benefits': {
                'health_insurance': True,
                'dental_insurance': True,
                'retirement_plan': False,
                'paid_time_off': 20,
                'flexible_schedule': True,
                'remote_work': True,
                'professional_development': True
            }
        },
        {
            'title': 'React Developer',
            'description': 'We need a React Developer to help build our next-generation web applications. Experience with modern React patterns and state management required.',
            'company': {
                'name': 'Digital Agency',
                'industry': 'Marketing',
                'size': 'medium',
                'website': 'https://digitalagency.com',
                'description': 'Creative digital agency serving Fortune 500 clients.'
            },
            'location': 'Austin, TX',
            'remote_type': 'onsite',
            'job_type': 'full_time',
            'requirements': {
                'required_skills': ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
                'preferred_skills': ['Redux', 'Styled Components', 'Jest'],
                'experience_years_min': 1,
                'experience_years_max': 4,
                'education_level': 'bachelor'
            },
            'salary': {
                'min_salary': 75000,
                'max_salary': 95000,
                'salary_type': 'annual',
                'equity': False,
                'bonus_eligible': True
            },
            'benefits': {
                'health_insurance': True,
                'dental_insurance': True,
                'paid_time_off': 15,
                'flexible_schedule': False,
                'remote_work': False,
                'professional_development': True
            }
        }
    ]
    
    created_jobs = []
    for job_data in sample_jobs:
        # Check if job already exists
        if Job.objects(title=job_data['title'], company__name=job_data['company']['name']).first():
            print(f"Job '{job_data['title']}' at '{job_data['company']['name']}' already exists")
            continue
        
        job = Job(
            title=job_data['title'],
            description=job_data['description'],
            location=job_data['location'],
            remote_type=job_data['remote_type'],
            job_type=job_data['job_type'],
            posted_date=datetime.utcnow() - timedelta(days=5),
            is_active=True,
            source='Demo Data'
        )
        
        # Set company info
        job.company = CompanyInfo(**job_data['company'])
        
        # Set requirements
        job.requirements = JobRequirements(**job_data['requirements'])
        
        # Set salary info
        job.salary = SalaryInfo(**job_data['salary'])
        
        # Set benefits
        job.benefits = JobBenefits(**job_data['benefits'])
        
        # AI fields
        job.ai_match_score = 85.0
        job.ai_tags = ['remote-friendly', 'growth-opportunity', 'competitive-salary']
        
        job.save()
        created_jobs.append(job)
        print(f"Created job: {job.title} at {job.company.name}")
    
    return created_jobs


def create_sample_applications(user, jobs):
    """Create sample applications for the user"""
    print("Creating sample applications...")
    
    if not jobs:
        print("No jobs available to create applications")
        return
    
    # Create applications for the first two jobs
    for i, job in enumerate(jobs[:2]):
        # Check if application already exists
        if Application.objects(user_id=user.user_id, job_id=job.job_id).first():
            print(f"Application for '{job.title}' already exists")
            continue
        
        status = 'applied' if i == 0 else 'interviewing'
        
        application = Application(
            user_id=user.user_id,
            job_id=job.job_id,
            status=status,
            applied_date=datetime.utcnow() - timedelta(days=3-i),
            application_method='company_website',
            notes=f'Applied for {job.title} position. Looks like a great opportunity!',
            priority='high' if i == 0 else 'medium',
            ai_match_score=90.0 - (i * 5)
        )
        
        # Add timeline event
        application.add_timeline_event('applied', f'Applied for {job.title}', created_by_system=True)
        
        if status == 'interviewing':
            application.add_timeline_event('interview_scheduled', 'Phone screen scheduled', created_by_system=True)
        
        application.save()
        print(f"Created application: {job.title}")


def create_indexes():
    """Create database indexes for better performance"""
    print("Creating database indexes...")
    
    try:
        # User indexes
        User.create_index([('username', 1)])
        User.create_index([('email', 1)])
        
        # Job indexes
        Job.create_index([('title', 1)])
        Job.create_index([('company.name', 1)])
        Job.create_index([('location', 1)])
        Job.create_index([('posted_date', -1)])
        Job.create_index([('is_active', 1)])
        
        # Application indexes
        Application.create_index([('user_id', 1)])
        Application.create_index([('job_id', 1)])
        Application.create_index([('status', 1)])
        Application.create_index([('applied_date', -1)])
        
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")


def main():
    """Main initialization function"""
    print("Initializing AJAT database...")
    print("=" * 50)
    
    try:
        # Create sample data
        user = create_sample_user()
        jobs = create_sample_jobs()
        create_sample_applications(user, jobs)
        
        # Create indexes
        create_indexes()
        
        print("=" * 50)
        print("Database initialization completed successfully!")
        print(f"Sample user created: {user.username} (password: demo123)")
        print(f"Sample jobs created: {len(jobs)}")
        print("You can now start the application and log in with the demo user.")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()