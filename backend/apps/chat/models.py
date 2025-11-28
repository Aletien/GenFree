"""
Chat system models for GenFree Network.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class ChatRoom(models.Model):
    """Model for chat rooms."""
    
    ROOM_TYPE_CHOICES = [
        ('livestream', 'Live Stream Chat'),
        ('event', 'Event Chat'),
        ('general', 'General Chat'),
        ('prayer', 'Prayer Room'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='general')
    description = models.TextField(blank=True)
    
    # Linked objects
    livestream = models.ForeignKey(
        'livestream.LiveStream', 
        on_delete=models.CASCADE, 
        null=True, blank=True,
        related_name='chat_rooms'
    )
    event = models.ForeignKey(
        'events.Event', 
        on_delete=models.CASCADE, 
        null=True, blank=True,
        related_name='chat_rooms'
    )
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_moderated = models.BooleanField(default=True)
    allow_anonymous = models.BooleanField(default=True)
    max_message_length = models.IntegerField(default=500)
    
    # Moderation
    banned_words = models.TextField(blank=True, help_text="Comma-separated list of banned words")
    moderators = models.ManyToManyField(User, blank=True, related_name='moderated_rooms')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Chat Room'
        verbose_name_plural = 'Chat Rooms'
    
    def __str__(self):
        return self.name
    
    @property
    def active_users_count(self):
        """Count of active users in the last 5 minutes."""
        five_minutes_ago = timezone.now() - timezone.timedelta(minutes=5)
        return self.messages.filter(
            created_at__gte=five_minutes_ago
        ).values('user').distinct().count()


class ChatMessage(models.Model):
    """Model for chat messages."""
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text Message'),
        ('emoji', 'Emoji Reaction'),
        ('system', 'System Message'),
        ('prayer', 'Prayer Request'),
        ('announcement', 'Announcement'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Anonymous user info
    anonymous_name = models.CharField(max_length=50, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    
    # Message content
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField()
    emoji_reaction = models.CharField(max_length=10, blank=True)
    
    # Moderation
    is_moderated = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    moderated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='moderated_messages'
    )
    moderation_reason = models.CharField(max_length=200, blank=True)
    
    # Engagement
    likes = models.IntegerField(default=0)
    reports = models.IntegerField(default=0)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
    
    def __str__(self):
        sender = self.user.username if self.user else self.anonymous_name or 'Anonymous'
        return f"{sender}: {self.content[:50]}"
    
    @property
    def sender_name(self):
        """Get the display name for the message sender."""
        if self.user:
            return self.user.get_full_name() or self.user.username
        return self.anonymous_name or 'Anonymous'
    
    def moderate(self, moderator, approved=False, reason=''):
        """Moderate the message."""
        self.is_moderated = True
        self.is_approved = approved
        self.moderated_by = moderator
        self.moderation_reason = reason
        self.save()


class ChatUserActivity(models.Model):
    """Track user activity in chat rooms."""
    
    ACTIVITY_TYPE_CHOICES = [
        ('join', 'Joined Room'),
        ('leave', 'Left Room'),
        ('message', 'Sent Message'),
        ('reaction', 'Gave Reaction'),
        ('report', 'Reported Message'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100, blank=True)
    
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Additional data
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Chat User Activity'
        verbose_name_plural = 'Chat User Activities'


class MessageReport(models.Model):
    """Model for reported messages."""
    
    REPORT_REASON_CHOICES = [
        ('spam', 'Spam'),
        ('inappropriate', 'Inappropriate Content'),
        ('harassment', 'Harassment'),
        ('hate_speech', 'Hate Speech'),
        ('violence', 'Violence/Threats'),
        ('other', 'Other'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='message_reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    
    reason = models.CharField(max_length=20, choices=REPORT_REASON_CHOICES)
    description = models.TextField(blank=True)
    
    # Resolution
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='resolved_reports'
    )
    resolution_note = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['message', 'reported_by', 'session_id']
        ordering = ['-created_at']
        verbose_name = 'Message Report'
        verbose_name_plural = 'Message Reports'