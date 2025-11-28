"""
Analytics admin configuration for GenFree Network.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AnalyticsEvent, UserSession, PageView, ConversionGoal,
    Conversion, AnalyticsReport
)


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    """Admin interface for analytics events."""
    
    list_display = [
        'event_name', 'event_type', 'username', 'device_type',
        'country', 'timestamp'
    ]
    list_filter = [
        'event_type', 'device_type', 'browser', 'country', 'timestamp'
    ]
    search_fields = [
        'event_name', 'event_category', 'page_url', 'user__username'
    ]
    readonly_fields = ['id', 'timestamp']
    
    def username(self, obj):
        return obj.user.username if obj.user else 'Anonymous'
    username.short_description = 'User'
    
    fieldsets = (
        ('Event Information', {
            'fields': ('event_type', 'event_name', 'event_category', 'event_label', 'event_value')
        }),
        ('User & Session', {
            'fields': ('user', 'session_id', 'ip_address')
        }),
        ('Location', {
            'fields': ('country', 'region', 'city'),
            'classes': ('collapse',)
        }),
        ('Device Information', {
            'fields': ('device_type', 'browser', 'os', 'screen_resolution'),
            'classes': ('collapse',)
        }),
        ('Page Context', {
            'fields': ('page_url', 'page_title', 'referrer')
        }),
        ('Marketing', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign'),
            'classes': ('collapse',)
        }),
        ('Technical', {
            'fields': ('user_agent', 'custom_data', 'timestamp'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Admin interface for user sessions."""
    
    list_display = [
        'username', 'start_time', 'duration_display', 'page_views',
        'events_count', 'bounce', 'device_type', 'country'
    ]
    list_filter = ['bounce', 'device_type', 'country', 'start_time']
    search_fields = ['user__username', 'session_id', 'landing_page']
    readonly_fields = ['id', 'start_time', 'duration']
    
    def username(self, obj):
        return obj.user.username if obj.user else 'Anonymous'
    username.short_description = 'User'
    
    def duration_display(self, obj):
        duration = obj.duration
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return "Active"
    duration_display.short_description = 'Duration'
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session_id', 'user', 'start_time', 'end_time', 'duration')
        }),
        ('Metrics', {
            'fields': ('page_views', 'events_count', 'bounce')
        }),
        ('Pages', {
            'fields': ('landing_page', 'exit_page'),
            'classes': ('collapse',)
        }),
        ('Location & Device', {
            'fields': ('ip_address', 'country', 'city', 'device_type', 'browser'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    """Admin interface for page views."""
    
    list_display = [
        'url_short', 'title_short', 'timestamp', 'time_on_page',
        'scroll_depth', 'session_user'
    ]
    list_filter = ['timestamp']
    search_fields = ['url', 'title', 'session__user__username']
    readonly_fields = ['id', 'timestamp']
    
    def url_short(self, obj):
        return obj.url[:50] + '...' if len(obj.url) > 50 else obj.url
    url_short.short_description = 'URL'
    
    def title_short(self, obj):
        return obj.title[:30] + '...' if len(obj.title) > 30 else obj.title
    title_short.short_description = 'Title'
    
    def session_user(self, obj):
        return obj.session.user.username if obj.session.user else 'Anonymous'
    session_user.short_description = 'User'


@admin.register(ConversionGoal)
class ConversionGoalAdmin(admin.ModelAdmin):
    """Admin interface for conversion goals."""
    
    list_display = [
        'name', 'goal_type', 'value', 'is_active',
        'conversions_count', 'created_at'
    ]
    list_filter = ['goal_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def conversions_count(self, obj):
        return obj.conversions.count()
    conversions_count.short_description = 'Conversions'
    
    fieldsets = (
        ('Goal Information', {
            'fields': ('name', 'description', 'goal_type', 'value', 'is_active')
        }),
        ('Goal Conditions', {
            'fields': ('target_event_type', 'target_page_url', 'target_duration', 'target_value')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Conversion)
class ConversionAdmin(admin.ModelAdmin):
    """Admin interface for conversions."""
    
    list_display = [
        'goal', 'username', 'value', 'timestamp',
        'first_touch_source', 'last_touch_source'
    ]
    list_filter = ['goal', 'timestamp']
    search_fields = ['goal__name', 'user__username']
    readonly_fields = ['id', 'timestamp']
    
    def username(self, obj):
        return obj.user.username if obj.user else 'Anonymous'
    username.short_description = 'User'
    
    def first_touch_source(self, obj):
        return obj.first_touch_utm_source or 'Direct'
    first_touch_source.short_description = 'First Touch'
    
    def last_touch_source(self, obj):
        return obj.last_touch_utm_source or 'Direct'
    last_touch_source.short_description = 'Last Touch'


@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    """Admin interface for analytics reports."""
    
    list_display = [
        'name', 'report_type', 'date_range', 'generated_by',
        'generated_at'
    ]
    list_filter = ['report_type', 'generated_at']
    search_fields = ['name', 'generated_by__username']
    readonly_fields = ['generated_at']
    
    def date_range(self, obj):
        return f"{obj.start_date} to {obj.end_date}"
    date_range.short_description = 'Date Range'