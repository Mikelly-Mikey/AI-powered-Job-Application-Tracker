from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer
import uuid
from datetime import datetime


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Check if user already exists
                if User.objects(email=serializer.validated_data['email']).first():
                    return Response(
                        {'error': 'User with this email already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if User.objects(username=serializer.validated_data['username']).first():
                    return Response(
                        {'error': 'User with this username already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create new user
                user = User(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    user_id=str(uuid.uuid4())
                )
                user.set_password(serializer.validated_data['password'])
                
                # Set profile information if provided
                if 'first_name' in serializer.validated_data:
                    user.profile.first_name = serializer.validated_data['first_name']
                if 'last_name' in serializer.validated_data:
                    user.profile.last_name = serializer.validated_data['last_name']
                
                user.save()
                
                # Generate tokens
                refresh = RefreshToken()
                refresh['user_id'] = user.user_id
                refresh['username'] = user.username
                
                return Response({
                    'message': 'User created successfully',
                    'user': user.to_dict(),
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to create user: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find user by username or email
            user = User.objects(username=username).first()
            if not user:
                user = User.objects(email=username).first()
            
            if not user or not user.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.is_active:
                return Response(
                    {'error': 'Account is deactivated'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Update last login
            user.last_login = datetime.utcnow()
            user.save()
            
            # Generate tokens
            refresh = RefreshToken()
            refresh['user_id'] = user.user_id
            refresh['username'] = user.username
            
            return Response({
                'message': 'Login successful',
                'user': user.to_dict(),
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Login failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(APIView):
    """Get current user information"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get user from token
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response(
                    {'error': 'Invalid token'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = User.objects(user_id=user_id).first()
            if not user:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(user.to_dict(), status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get user info: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Update current user information"""
        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response(
                    {'error': 'Invalid token'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = User.objects(user_id=user_id).first()
            if not user:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = UserProfileSerializer(data=request.data, partial=True)
            if serializer.is_valid():
                # Update user fields
                for field, value in serializer.validated_data.items():
                    if hasattr(user, field):
                        setattr(user, field, value)
                    elif hasattr(user.profile, field):
                        setattr(user.profile, field, value)
                    elif hasattr(user.settings, field):
                        setattr(user.settings, field, value)
                
                user.save()
                return Response(user.to_dict(), status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to update user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """User profile management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get user profile (own or public profile of another user)"""
        try:
            current_user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            target_user_id = user_id or current_user_id
            
            user = User.objects(user_id=target_user_id).first()
            if not user:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Return full profile for own user, limited for others
            if target_user_id == current_user_id:
                return Response(user.to_dict(), status=status.HTTP_200_OK)
            else:
                # Return public profile only
                public_profile = {
                    'user_id': user.user_id,
                    'username': user.username,
                    'profile': {
                        'first_name': user.profile.first_name,
                        'last_name': user.profile.last_name,
                        'location': user.profile.location,
                        'linkedin_url': user.profile.linkedin_url,
                        'github_url': user.profile.github_url,
                        'portfolio_url': user.profile.portfolio_url,
                        'bio': user.profile.bio,
                        'avatar': user.profile.avatar,
                        'current_title': user.profile.current_title,
                        'experience_level': user.profile.experience_level,
                        'skills': user.profile.skills,
                    }
                }
                return Response(public_profile, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to get profile: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user_id = request.user.get('user_id') if hasattr(request.user, 'get') else None
            if not user_id:
                return Response(
                    {'error': 'Invalid token'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = User.objects(user_id=user_id).first()
            if not user:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if not current_password or not new_password:
                return Response(
                    {'error': 'Current password and new password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user.check_password(current_password):
                return Response(
                    {'error': 'Current password is incorrect'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if len(new_password) < 8:
                return Response(
                    {'error': 'New password must be at least 8 characters long'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(new_password)
            user.save()
            
            return Response(
                {'message': 'Password changed successfully'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Failed to change password: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )