"""
Analytics models for GenFree Network.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid


class AnalyticsEvent(models.Model):
    """Model for tracking analytics events."""
    
    EVENT_TYPE_CHOICES = [
        ('page_view', 'Page View'),
        ('button_click', 'Button Click'),
        ('form_submission', 'Form Submission'),
        ('video_play', 'Video Play'),
        ('video_pause', 'Video Pause'),
        ('video_complete', 'Video Complete'),
        ('download', 'Download'),
        ('share', 'Share'),
        ('search', 'Search'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('registration', 'Registration'),
        ('donation', 'Donation'),
        ('event_registration', 'Event Registration'),
        ('chat_message', 'Chat Message'),
        ('prayer_request', 'Prayer Request'),
        ('newsletter_signup', 'Newsletter Signup'),
        ('contact_form', 'Contact Form'),
        ('livestream_join', 'Livestream Join'),
        ('livestream_leave', 'Livestream Leave'),
        ('error', 'Error'),
        ('custom', 'Custom Event'),
    ]
    
    DEVICE_TYPE_CHOICES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event details
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    event_name = models.CharField(max_length=200)
    event_category = models.CharField(max_length=100, blank=True)
    event_label = models.CharField(max_length=200, blank=True)
    event_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # User information
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100)
    user_agent = models.TextField(blank=True)
    
    # Location data
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Device information
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES, default='unknown')
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    screen_resolution = models.CharField(max_length=20, blank=True)
    
    # Page/Context information
    page_url = models.URLField(max_length=500)
    page_title = models.CharField(max_length=200, blank=True)
    referrer = models.URLField(max_length=500, blank=True)
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    
    # Generic relation to link to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional data
    custom_data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['session_id', 'timestamp']),
        ]
        verbose_name = 'Analytics Event'
        verbose_name_plural = 'Analytics Events'
    
    def __str__(self):
        return f"{self.event_name} - {self.timestamp}"


class UserSession(models.Model):
    """Model for tracking user sessions."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Session details
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    # Session metrics
    page_views = models.IntegerField(default=0)
    events_count = models.IntegerField(default=0)
    bounce = models.BooleanField(default=True)  # True if only one page view
    
    # Entry/Exit pages
    landing_page = models.URLField(max_length=500)
    exit_page = models.URLField(max_length=500, blank=True)
    
    # Device/Location (copied from first event)
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-start_time']
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
    
    def __str__(self):
        user_str = self.user.username if self.user else 'Anonymous'
        return f"{user_str} - {self.start_time}"
    
    @property
    def duration(self):
        """Calculate session duration."""
        end = self.end_time or self.last_activity
        return end - self.start_time
    
    def end_session(self, exit_page=''):
        """End the session."""
        self.end_time = timezone.now()
        self.exit_page = exit_page
        self.save()


class PageView(models.Model):
    """Model for tracking page views."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='pageviews')
    
    # Page details
    url = models.URLField(max_length=500)
    title = models.CharField(max_length=200, blank=True)
    referrer = models.URLField(max_length=500, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(auto_now_add=True)
    time_on_page = models.IntegerField(default=0)  # seconds
    
    # Engagement metrics
    scroll_depth = models.IntegerField(default=0)  # percentage
    clicks = models.IntegerField(default=0)
    form_interactions = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Page View'
        verbose_name_plural = 'Page Views'
    
    def __str__(self):
        return f"{self.url} - {self.timestamp}"


class ConversionGoal(models.Model):
    """Model for tracking conversion goals."""
    
    GOAL_TYPE_CHOICES = [
        ('event', 'Event Based'),
        ('page', 'Page View'),
        ('duration', 'Session Duration'),
        ('value', 'Value Based'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    
    # Goal conditions
    target_event_type = models.CharField(max_length=50, blank=True)
    target_page_url = models.URLField(max_length=500, blank=True)
    target_duration = models.IntegerField(null=True, blank=True)  # seconds
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Goal settings
    is_active = models.BooleanField(default=True)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # Goal value for calculations
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Conversion Goal'
        verbose_name_plural = 'Conversion Goals'
    
    def __str__(self):
        return self.name


class Conversion(models.Model):
    """Model for tracking goal conversions."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(ConversionGoal, on_delete=models.CASCADE, related_name='conversions')
    session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='conversions')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Conversion details
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Attribution
    first_touch_utm_source = models.CharField(max_length=100, blank=True)
    first_touch_utm_campaign = models.CharField(max_length=100, blank=True)
    last_touch_utm_source = models.CharField(max_length=100, blank=True)
    last_touch_utm_campaign = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        unique_together = ['goal', 'session']  # One conversion per goal per session
        verbose_name = 'Conversion'
        verbose_name_plural = 'Conversions'
    
    def __str__(self):
        return f"{self.goal.name} - {self.timestamp}"


class AnalyticsReport(models.Model):
    """Model for storing generated analytics reports."""
    
    REPORT_TYPE_CHOICES = [
        ('daily', 'Daily Report'),
        ('weekly', 'Weekly Report'),
        ('monthly', 'Monthly Report'),
        ('custom', 'Custom Report'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    
    # Report parameters
    start_date = models.DateField()
    end_date = models.DateField()
    filters = models.JSONField(default=dict, blank=True)
    
    # Report data
    data = models.JSONField(default=dict)
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Analytics Report'
        verbose_name_plural = 'Analytics Reports'
    
    def __str__(self):
        return f"{self.name} - {self.generated_at}"