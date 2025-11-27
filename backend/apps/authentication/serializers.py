"""
Authentication serializers for GenFree Network.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'username', 'first_name', 'last_name', 
            'phone_number', 'password', 'password_confirm',
            'newsletter_subscription', 'email_notifications'
        )
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """Validate username uniqueness."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, attrs):
        """Authenticate user credentials."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
            
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'profile_picture', 'profile_picture_url',
            'bio', 'is_minister', 'is_volunteer', 'ministry_role',
            'total_donations', 'events_attended', 'last_activity',
            'email_notifications', 'sms_notifications', 'newsletter_subscription',
            'date_joined', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'username', 'total_donations', 'events_attended', 
            'last_activity', 'date_joined', 'created_at', 'updated_at'
        )
    
    def get_profile_picture_url(self, obj):
        """Get profile picture URL."""
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for user profile including extended profile.
    """
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'profile_picture', 'bio',
            'is_minister', 'is_volunteer', 'ministry_role',
            'total_donations', 'events_attended', 'last_activity',
            'email_notifications', 'sms_notifications', 'newsletter_subscription',
            'date_joined', 'created_at', 'updated_at', 'profile'
        )
        read_only_fields = (
            'id', 'username', 'total_donations', 'events_attended',
            'last_activity', 'date_joined', 'created_at', 'updated_at'
        )
    
    def get_profile(self, obj):
        """Get extended profile information."""
        try:
            profile = obj.profile
            return {
                'gender': profile.gender,
                'marital_status': profile.marital_status,
                'occupation': profile.occupation,
                'address': profile.address,
                'city': profile.city,
                'country': profile.country,
                'emergency_contact_name': profile.emergency_contact_name,
                'emergency_contact_phone': profile.emergency_contact_phone,
                'emergency_contact_relationship': profile.emergency_contact_relationship,
                'baptized': profile.baptized,
                'baptism_date': profile.baptism_date,
                'member_since': profile.member_since,
                'spiritual_gifts': profile.spiritual_gifts,
                'ministry_interests': profile.ministry_interests,
                'facebook_url': profile.facebook_url,
                'twitter_url': profile.twitter_url,
                'instagram_url': profile.instagram_url,
                'linkedin_url': profile.linkedin_url,
            }
        except UserProfile.DoesNotExist:
            return None


class ExtendedProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for extended user profile.
    """
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def save(self, **kwargs):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email exists."""
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("No active user found with this email.")
        return value


class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal user serializer for public displays.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'is_minister', 'ministry_role')
        read_only_fields = fields