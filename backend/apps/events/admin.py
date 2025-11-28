"""
Events admin configuration for GenFree Network.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Event, EventCategory, EventRegistration, EventReminder, Speaker


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for events."""
    
    list_display = [
        'title', 'category', 'start_datetime', 'location_type',
        'registration_count', 'max_attendees', 'status', 'is_featured'
    ]
    list_filter = [
        'status', 'is_featured', 'location_type', 'category',
        'is_free', 'start_datetime'
    ]
    search_fields = ['title', 'description', 'venue_name']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['speakers']
    readonly_fields = ['registration_count', 'view_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'category')
        }),
        ('Date & Time', {
            'fields': ('start_datetime', 'end_datetime', 'timezone')
        }),
        ('Location', {
            'fields': ('location_type', 'venue_name', 'venue_address', 'online_meeting_url')
        }),
        ('Media', {
            'fields': ('featured_image', 'banner_image')
        }),
        ('Registration', {
            'fields': (
                'is_free', 'ticket_price', 'currency', 'max_attendees',
                'registration_deadline', 'allow_waitlist', 'requires_approval'
            )
        }),
        ('Display Options', {
            'fields': ('status', 'is_featured', 'tags')
        }),
        ('People', {
            'fields': ('organizer', 'speakers')
        }),
        ('Analytics', {
            'fields': ('registration_count', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    """Admin interface for event categories."""
    
    list_display = ['name', 'color_display', 'is_active', 'event_count']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 6px; border-radius: 3px; color: white;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'Color'
    
    def event_count(self, obj):
        return obj.events.filter(status='published').count()
    event_count.short_description = 'Events'


@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    """Admin interface for speakers."""
    
    list_display = ['name', 'title', 'is_featured']
    list_filter = ['is_featured']
    search_fields = ['name', 'title', 'bio']


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    """Admin interface for event registrations."""
    
    list_display = [
        'event', 'user_display', 'registration_type', 'status',
        'payment_status', 'registered_at'
    ]
    list_filter = [
        'registration_type', 'status', 'payment_status', 'registered_at'
    ]
    search_fields = ['event__title', 'user__username', 'guest_name', 'guest_email']
    
    def user_display(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return obj.guest_name or obj.guest_email
    user_display.short_description = 'Attendee'


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    """Admin interface for event reminders."""
    
    list_display = ['event', 'user', 'reminder_type', 'remind_at', 'is_sent']
    list_filter = ['reminder_type', 'is_sent', 'remind_at']
    search_fields = ['event__title', 'user__username']