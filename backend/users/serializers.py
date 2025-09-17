from rest_framework import serializers
from .models import User
import re


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration"""
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=50, required=False)
    last_name = serializers.CharField(max_length=50, required=False)
    
    def validate_username(self, value):
        """Validate username format"""
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and underscores"
            )
        return value
    
    def validate_email(self, value):
        """Validate email format"""
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()
    
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number")
        
        return value
    
    def validate(self, data):
        """Validate password confirmation"""
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError("Passwords do not match")
        return data


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()  # Can be username or email
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.Serializer):
    """Serializer for user profile updates"""
    first_name = serializers.CharField(max_length=50, required=False)
    last_name = serializers.CharField(max_length=50, required=False)
    phone = serializers.CharField(max_length=20, required=False)
    location = serializers.CharField(max_length=100, required=False)
    linkedin_url = serializers.URLField(required=False)
    github_url = serializers.URLField(required=False)
    portfolio_url = serializers.URLField(required=False)
    bio = serializers.CharField(max_length=500, required=False)
    avatar = serializers.URLField(required=False)
    current_title = serializers.CharField(max_length=100, required=False)
    experience_level = serializers.ChoiceField(
        choices=[
            ('entry', 'Entry Level'),
            ('mid', 'Mid Level'),
            ('senior', 'Senior Level'),
            ('lead', 'Lead/Principal'),
            ('executive', 'Executive')
        ],
        required=False
    )
    skills = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    industries = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    desired_salary_min = serializers.IntegerField(min_value=0, required=False)
    desired_salary_max = serializers.IntegerField(min_value=0, required=False)
    preferred_locations = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False
    )
    remote_preference = serializers.ChoiceField(
        choices=[
            ('remote', 'Remote Only'),
            ('hybrid', 'Hybrid'),
            ('onsite', 'On-site Only'),
            ('flexible', 'Flexible')
        ],
        required=False
    )
    
    # Settings
    email_notifications = serializers.BooleanField(required=False)
    push_notifications = serializers.BooleanField(required=False)
    weekly_digest = serializers.BooleanField(required=False)
    job_alerts = serializers.BooleanField(required=False)
    theme = serializers.ChoiceField(
        choices=[('light', 'Light'), ('dark', 'Dark')],
        required=False
    )
    timezone = serializers.CharField(max_length=50, required=False)
    
    def validate_desired_salary_max(self, value):
        """Validate that max salary is greater than min salary"""
        min_salary = self.initial_data.get('desired_salary_min')
        if min_salary and value and value < min_salary:
            raise serializers.ValidationError(
                "Maximum salary must be greater than minimum salary"
            )
        return value


class UserSerializer(serializers.Serializer):
    """Serializer for user data responses"""
    user_id = serializers.CharField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    is_premium = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    
    # Profile data
    profile = serializers.DictField(read_only=True)
    settings = serializers.DictField(read_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_new_password = serializers.CharField(min_length=8, write_only=True)
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number")
        
        return value
    
    def validate(self, data):
        """Validate password confirmation"""
        if data.get('new_password') != data.get('confirm_new_password'):
            raise serializers.ValidationError("New passwords do not match")
        return data