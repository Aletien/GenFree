"""
Live streaming admin configuration for GenFree Network.
"""

from django.contrib import admin
from .models import LiveStream, StreamAnalytics, StreamViewer


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    """Admin interface for live streams."""
    
    list_display = [
        'title', 'platform', 'status', 'scheduled_start',
        'current_viewers', 'total_views', 'created_by'
    ]
    list_filter = ['platform', 'status', 'is_featured', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = [
        'id', 'actual_start', 'actual_end', 'max_viewers',
        'total_views', 'current_viewers', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'platform', 'is_featured')
        }),
        ('Streaming Configuration', {
            'fields': ('stream_key', 'stream_url', 'embed_code', 'thumbnail')
        }),
        ('Scheduling', {
            'fields': ('scheduled_start', 'actual_start', 'actual_end', 'status')
        }),
        ('Analytics', {
            'fields': ('current_viewers', 'max_viewers', 'total_views'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StreamAnalytics)
class StreamAnalyticsAdmin(admin.ModelAdmin):
    """Admin interface for stream analytics."""
    
    list_display = [
        'stream', 'timestamp', 'concurrent_viewers',
        'chat_messages', 'reactions', 'stream_quality'
    ]
    list_filter = ['stream', 'timestamp', 'stream_quality']
    readonly_fields = ['timestamp']


@admin.register(StreamViewer)
class StreamViewerAdmin(admin.ModelAdmin):
    """Admin interface for stream viewers."""
    
    list_display = [
        'stream', 'user', 'joined_at', 'left_at',
        'messages_sent', 'reactions_given', 'country'
    ]
    list_filter = ['stream', 'joined_at', 'country']
    readonly_fields = ['joined_at', 'left_at']