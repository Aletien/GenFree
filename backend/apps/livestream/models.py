"""
Live streaming models for GenFree Network.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class LiveStream(models.Model):
    """Model for live streaming sessions."""
    
    PLATFORM_CHOICES = [
        ('youtube', 'YouTube'),
        ('facebook', 'Facebook Live'),
        ('instagram', 'Instagram Live'),
        ('custom', 'Custom Platform'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    stream_key = models.CharField(max_length=100, blank=True)
    stream_url = models.URLField(blank=True)
    embed_code = models.TextField(blank=True)
    
    # Scheduling
    scheduled_start = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    is_featured = models.BooleanField(default=False)
    thumbnail = models.ImageField(upload_to='livestream/thumbnails/', blank=True)
    
    # Viewership
    max_viewers = models.IntegerField(default=0)
    total_views = models.IntegerField(default=0)
    current_viewers = models.IntegerField(default=0)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_start']
        verbose_name = 'Live Stream'
        verbose_name_plural = 'Live Streams'
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    @property
    def is_live(self):
        return self.status == 'live'
    
    @property
    def duration(self):
        if self.actual_start and self.actual_end:
            return self.actual_end - self.actual_start
        return None
    
    def start_stream(self):
        """Start the live stream."""
        self.status = 'live'
        self.actual_start = timezone.now()
        self.save()
    
    def end_stream(self):
        """End the live stream."""
        self.status = 'ended'
        self.actual_end = timezone.now()
        self.save()


class StreamAnalytics(models.Model):
    """Model for storing stream analytics data."""
    
    stream = models.ForeignKey(LiveStream, on_delete=models.CASCADE, related_name='analytics')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Viewership metrics
    concurrent_viewers = models.IntegerField(default=0)
    new_viewers = models.IntegerField(default=0)
    returning_viewers = models.IntegerField(default=0)
    
    # Engagement metrics
    chat_messages = models.IntegerField(default=0)
    reactions = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    
    # Technical metrics
    stream_quality = models.CharField(max_length=10, default='1080p')
    buffering_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Stream Analytics'
        verbose_name_plural = 'Stream Analytics'


class StreamViewer(models.Model):
    """Track individual viewers of streams."""
    
    stream = models.ForeignKey(LiveStream, on_delete=models.CASCADE, related_name='viewers')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100)  # For anonymous users
    
    # Viewing session
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Engagement
    messages_sent = models.IntegerField(default=0)
    reactions_given = models.IntegerField(default=0)
    
    # Location data (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    class Meta:
        unique_together = ['stream', 'user', 'session_id']
        verbose_name = 'Stream Viewer'
        verbose_name_plural = 'Stream Viewers'
    
    @property
    def watch_duration(self):
        if self.left_at:
            return self.left_at - self.joined_at
        return timezone.now() - self.joined_at