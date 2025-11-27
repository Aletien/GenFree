"""
Authentication views for GenFree Network.
"""

from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import User, UserProfile, LoginAttempt
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileDetailSerializer,
    ExtendedProfileSerializer,
    PasswordChangeSerializer,
    PasswordResetSerializer,
)


class UserRegistrationView(APIView):
    """
    User registration endpoint.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    @extend_schema(
        summary="Register new user",
        description="Create a new user account with email verification.",
        request=UserRegistrationSerializer,
        responses={201: UserProfileSerializer}
    )
    def post(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Log successful registration
            LoginAttempt.objects.create(
                user=user,
                email=user.email,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=True
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Return user data with tokens
            user_serializer = UserProfileSerializer(user, context={'request': request})
            return Response({
                'user': user_serializer.data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                },
                'message': 'User registered successfully.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(TokenObtainPairView):
    """
    User login endpoint with custom response.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    @extend_schema(
        summary="User login",
        description="Authenticate user and return JWT tokens.",
        request=UserLoginSerializer,
        responses={200: UserProfileSerializer}
    )
    def post(self, request):
        """Authenticate user and return tokens."""
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        # Log login attempt
        email = request.data.get('email', '')
        ip_address = request.META.get('REMOTE_ADDR', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Log successful login
            LoginAttempt.objects.create(
                user=user,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                success=True
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Update last activity
            user.save(update_fields=['last_activity'])
            
            # Return user data with tokens
            user_serializer = UserProfileSerializer(user, context={'request': request})
            return Response({
                'user': user_serializer.data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                },
                'message': 'Login successful.'
            }, status=status.HTTP_200_OK)
        else:
            # Log failed login attempt
            LoginAttempt.objects.create(
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                success=False
            )
            
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class UserLogoutView(APIView):
    """
    User logout endpoint.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="User logout",
        description="Blacklist refresh token to logout user.",
        request=None,
        responses={200: None}
    )
    def post(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Successfully logged out.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(GenericViewSet):
    """
    ViewSet for user profile operations.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return UserProfileDetailSerializer
        return UserProfileSerializer
    
    @extend_schema(
        summary="Get current user profile",
        description="Retrieve detailed profile of authenticated user.",
        responses={200: UserProfileDetailSerializer}
    )
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile."""
        serializer = UserProfileDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update current user profile",
        description="Update authenticated user's profile information.",
        request=UserProfileSerializer,
        responses={200: UserProfileSerializer}
    )
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user's profile."""
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=request.method == 'PATCH',
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Update extended profile",
        description="Update user's extended profile information.",
        request=ExtendedProfileSerializer,
        responses={200: ExtendedProfileSerializer}
    )
    @action(detail=False, methods=['put', 'patch'])
    def update_extended_profile(self, request):
        """Update extended profile information."""
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        serializer = ExtendedProfileSerializer(
            profile,
            data=request.data,
            partial=request.method == 'PATCH',
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Change password",
        description="Change authenticated user's password.",
        request=PasswordChangeSerializer,
        responses={200: None}
    )
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password changed successfully.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Delete account",
        description="Deactivate user account (soft delete).",
        responses={200: None}
    )
    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        """Deactivate user account."""
        user = request.user
        user.is_active = False
        user.save()
        
        return Response({
            'message': 'Account deactivated successfully.'
        })


class PasswordResetView(APIView):
    """
    Password reset request endpoint.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Request password reset",
        description="Send password reset email to user.",
        request=PasswordResetSerializer,
        responses={200: None}
    )
    def post(self, request):
        """Send password reset email."""
        serializer = PasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # TODO: Implement email sending logic
            # This would typically:
            # 1. Generate a reset token
            # 2. Create a reset link
            # 3. Send email to user
            
            return Response({
                'message': 'Password reset email sent successfully.'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStatsView(APIView):
    """
    User statistics endpoint.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get user statistics",
        description="Retrieve user's engagement statistics.",
        responses={200: None}
    )
    def get(self, request):
        """Get user statistics."""
        user = request.user
        
        # Calculate user statistics
        stats = {
            'total_donations': float(user.total_donations),
            'events_attended': user.events_attended,
            'days_since_joined': (timezone.now() - user.date_joined).days,
            'is_ministry_member': user.is_ministry_member,
            'profile_completion': self.calculate_profile_completion(user),
        }
        
        return Response(stats)
    
    def calculate_profile_completion(self, user):
        """Calculate profile completion percentage."""
        fields_to_check = [
            user.first_name, user.last_name, user.email,
            user.phone_number, user.bio, user.profile_picture,
        ]
        
        try:
            profile = user.profile
            fields_to_check.extend([
                profile.gender, profile.occupation, profile.city,
                profile.country, profile.spiritual_gifts
            ])
        except UserProfile.DoesNotExist:
            pass
        
        completed_fields = sum(1 for field in fields_to_check if field)
        total_fields = len(fields_to_check)
        
        return round((completed_fields / total_fields) * 100, 1)


# Import timezone for stats calculation
from django.utils import timezone