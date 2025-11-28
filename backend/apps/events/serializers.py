"""
Events serializers for GenFree Network.
"""

from rest_framework import serializers
from .models import Event, EventCategory, EventRegistration, EventReminder, Speaker


class EventCategorySerializer(serializers.ModelSerializer):
    """Serializer for event categories."""
    
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EventCategory
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'is_active', 'event_count'
        ]
    
    def get_event_count(self, obj):
        return obj.events.filter(status='published').count()


class SpeakerSerializer(serializers.ModelSerializer):
    """Serializer for speakers."""
    
    class Meta:
        model = Speaker
        fields = [
            'id', 'name', 'title', 'bio', 'photo', 'website_url',
            'social_links', 'is_featured'
        ]


class EventSerializer(serializers.ModelSerializer):
    """Serializer for events."""
    
    category = EventCategorySerializer(read_only=True)
    speakers = SpeakerSerializer(many=True, read_only=True)
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    registration_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_happening_now = serializers.ReadOnlyField()
    days_until_event = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'category', 'speakers', 'start_datetime', 'end_datetime',
            'timezone', 'location_type', 'venue_name', 'venue_address',
            'online_meeting_url', 'featured_image', 'banner_image',
            'status', 'is_featured', 'is_free', 'ticket_price', 'currency',
            'max_attendees', 'registration_count', 'is_full', 'registration_deadline',
            'allow_waitlist', 'requires_approval', 'is_past', 'is_happening_now',
            'days_until_event', 'organizer_name', 'tags', 'view_count',
            'created_at', 'updated_at'
        ]


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event lists."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    registration_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    days_until_event = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'category_name',
            'start_datetime', 'end_datetime', 'location_type', 'venue_name',
            'featured_image', 'is_featured', 'is_free', 'ticket_price',
            'registration_count', 'max_attendees', 'is_full', 'is_past',
            'days_until_event', 'created_at'
        ]


class EventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating events."""
    
    speakers = serializers.PrimaryKeyRelatedField(
        queryset=Speaker.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'short_description', 'category',
            'speakers', 'start_datetime', 'end_datetime', 'timezone',
            'location_type', 'venue_name', 'venue_address', 'online_meeting_url',
            'featured_image', 'banner_image', 'is_featured', 'is_free',
            'ticket_price', 'currency', 'max_attendees', 'registration_deadline',
            'allow_waitlist', 'requires_approval', 'tags'
        ]
    
    def validate(self, attrs):
        """Validate event data."""
        start_datetime = attrs.get('start_datetime')
        end_datetime = attrs.get('end_datetime')
        
        if start_datetime and end_datetime:
            if end_datetime <= start_datetime:
                raise serializers.ValidationError(
                    "End date/time must be after start date/time."
                )
        
        location_type = attrs.get('location_type')
        if location_type == 'physical' and not attrs.get('venue_name'):
            raise serializers.ValidationError(
                "Venue name is required for physical events."
            )
        elif location_type == 'online' and not attrs.get('online_meeting_url'):
            raise serializers.ValidationError(
                "Meeting URL is required for online events."
            )
        
        if not attrs.get('is_free') and not attrs.get('ticket_price'):
            raise serializers.ValidationError(
                "Ticket price is required for paid events."
            )
        
        return attrs


class EventRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for event registrations."""
    
    event_title = serializers.CharField(source='event.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event_title', 'user_name', 'user_email', 'guest_name',
            'guest_email', 'guest_phone', 'registration_type', 'status',
            'payment_status', 'payment_reference', 'special_requirements',
            'how_did_you_hear', 'registered_at', 'checked_in_at'
        ]
        read_only_fields = [
            'id', 'payment_reference', 'registered_at', 'checked_in_at'
        ]


class EventRegistrationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating event registrations."""
    
    class Meta:
        model = EventRegistration
        fields = [
            'event', 'guest_name', 'guest_email', 'guest_phone',
            'special_requirements', 'how_did_you_hear'
        ]
    
    def validate(self, attrs):
        """Validate registration data."""
        event = attrs.get('event')
        
        if not event:
            raise serializers.ValidationError("Event is required.")
        
        # Check if event is still accepting registrations
        if event.is_past:
            raise serializers.ValidationError("Cannot register for past events.")
        
        if event.registration_deadline and timezone.now() > event.registration_deadline:
            raise serializers.ValidationError("Registration deadline has passed.")
        
        # Check if event is full
        if event.is_full and not event.allow_waitlist:
            raise serializers.ValidationError("Event is full and waitlist is not allowed.")
        
        # For authenticated users, check for duplicate registration
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            existing = EventRegistration.objects.filter(
                event=event,
                user=request.user
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    "You are already registered for this event."
                )
        
        return attrs


class EventReminderSerializer(serializers.ModelSerializer):
    """Serializer for event reminders."""
    
    event_title = serializers.CharField(source='event.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = EventReminder
        fields = [
            'id', 'event_title', 'user_email', 'reminder_type',
            'remind_at', 'is_sent', 'sent_at'
        ]


class EventStatsSerializer(serializers.Serializer):
    """Serializer for event statistics."""
    
    total_events = serializers.IntegerField()
    upcoming_events = serializers.IntegerField()
    past_events = serializers.IntegerField()
    total_registrations = serializers.IntegerField()
    
    # Popular events
    most_popular_events = EventListSerializer(many=True)
    
    # Category breakdown
    category_stats = serializers.ListField(child=serializers.DictField())
    
    # Monthly stats
    monthly_events = serializers.ListField(child=serializers.DictField())
    monthly_registrations = serializers.ListField(child=serializers.DictField())
    
    # Recent activity
    recent_registrations = EventRegistrationSerializer(many=True)


class EventCalendarSerializer(serializers.Serializer):
    """Serializer for event calendar data."""
    
    date = serializers.DateField()
    events = EventListSerializer(many=True)