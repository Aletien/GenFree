"""
Events models for GenFree Network.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from PIL import Image
import uuid

User = get_user_model()


class EventCategory(models.Model):
    """
    Category classification for events.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#059669', help_text='Hex color code')
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name')
    order = models.PositiveIntegerField(default=0, help_text='Display order')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Event Category'
        verbose_name_plural = 'Event Categories'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Event(models.Model):
    """
    Main event model.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    FREQUENCY_CHOICES = [
        ('once', 'One-time'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    # Basic information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True, help_text='Brief summary for listings')
    
    # Classification
    category = models.ForeignKey(EventCategory, on_delete=models.PROTECT, related_name='events')
    tags = models.CharField(max_length=200, blank=True, help_text='Comma-separated tags')
    
    # Scheduling
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    timezone = models.CharField(max_length=50, default='Africa/Kampala')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='once')
    
    # Location
    location_name = models.CharField(max_length=200, blank=True)
    location_address = models.TextField(blank=True)
    location_city = models.CharField(max_length=100, blank=True)
    location_country = models.CharField(max_length=100, default='Uganda')
    is_online = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True, help_text='Online meeting link')
    
    # Media
    featured_image = models.ImageField(upload_to='events/images/', blank=True, null=True)
    gallery_images = models.JSONField(default=list, blank=True, help_text='List of image URLs')
    
    # People
    organizer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='organized_events')
    speaker = models.CharField(max_length=200, blank=True)
    speaker_bio = models.TextField(blank=True)
    speaker_image = models.ImageField(upload_to='events/speakers/', blank=True, null=True)
    
    # Registration
    requires_registration = models.BooleanField(default=False)
    max_attendees = models.PositiveIntegerField(blank=True, null=True)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_deadline = models.DateTimeField(blank=True, null=True)
    
    # Live streaming
    is_livestreamed = models.BooleanField(default=False)
    youtube_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    tiktok_url = models.URLField(blank=True)
    stream_key = models.CharField(max_length=200, blank=True)
    
    # Status and visibility
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    # Metadata
    view_count = models.PositiveIntegerField(default=0)
    attendee_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_datetime']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        indexes = [
            models.Index(fields=['start_datetime']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug and handle image processing."""
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Ensure end time is after start time
        if self.end_datetime <= self.start_datetime:
            self.end_datetime = self.start_datetime + timezone.timedelta(hours=2)
        
        super().save(*args, **kwargs)
        
        # Process featured image
        if self.featured_image:
            self.process_featured_image()
    
    def process_featured_image(self):
        """Resize and optimize featured image."""
        try:
            img = Image.open(self.featured_image.path)
            if img.width > 1200 or img.height > 800:
                img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
                img.save(self.featured_image.path, optimize=True, quality=85)
        except Exception:
            pass  # Handle gracefully if image processing fails
    
    @property
    def is_upcoming(self):
        """Check if event is upcoming."""
        return self.start_datetime > timezone.now()
    
    @property
    def is_ongoing(self):
        """Check if event is currently happening."""
        now = timezone.now()
        return self.start_datetime <= now <= self.end_datetime
    
    @property
    def is_past(self):
        """Check if event has ended."""
        return self.end_datetime < timezone.now()
    
    @property
    def duration_minutes(self):
        """Calculate event duration in minutes."""
        delta = self.end_datetime - self.start_datetime
        return int(delta.total_seconds() / 60)
    
    @property
    def has_available_spots(self):
        """Check if event has available registration spots."""
        if not self.requires_registration or not self.max_attendees:
            return True
        return self.attendee_count < self.max_attendees
    
    @property
    def registration_open(self):
        """Check if registration is still open."""
        if not self.requires_registration:
            return False
        
        if self.registration_deadline and self.registration_deadline < timezone.now():
            return False
        
        return self.has_available_spots and self.is_upcoming
    
    def get_tags_list(self):
        """Get tags as a list."""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]


class EventRegistration(models.Model):
    """
    Event registration model.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    
    # Registration details
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmation_code = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Additional information
    special_requirements = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    dietary_restrictions = models.CharField(max_length=200, blank=True)
    
    # Payment information (if applicable)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('none', 'No Payment Required'),
            ('pending', 'Payment Pending'),
            ('paid', 'Paid'),
            ('failed', 'Payment Failed'),
        ],
        default='none'
    )
    payment_reference = models.CharField(max_length=100, blank=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Check-in information
    checked_in = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registration_date']
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title}"
    
    def save(self, *args, **kwargs):
        """Update payment status based on amount and event fee."""
        if self.event.registration_fee > 0:
            if self.amount_paid >= self.event.registration_fee:
                self.payment_status = 'paid'
            elif self.amount_paid > 0:
                self.payment_status = 'pending'
        else:
            self.payment_status = 'none'
        
        super().save(*args, **kwargs)


class EventFeedback(models.Model):
    """
    Post-event feedback model.
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_feedback')
    
    # Ratings (1-5 scale)
    overall_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    content_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    organization_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    
    # Feedback text
    comments = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    
    # Recommendations
    would_recommend = models.BooleanField(default=True)
    would_attend_again = models.BooleanField(default=True)
    
    # Metadata
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True, help_text='Show in public testimonials')
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-submitted_at']
        verbose_name = 'Event Feedback'
        verbose_name_plural = 'Event Feedback'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title} ({self.overall_rating}/5)"


class EventReminder(models.Model):
    """
    Event reminder notifications.
    """
    REMINDER_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reminders')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_reminders')
    
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPES)
    send_datetime = models.DateTimeField()
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['event', 'user', 'reminder_type', 'send_datetime']
        ordering = ['send_datetime']
        verbose_name = 'Event Reminder'
        verbose_name_plural = 'Event Reminders'
    
    def __str__(self):
        return f"{self.user.email} - {self.event.title} - {self.reminder_type}"