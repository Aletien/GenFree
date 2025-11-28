"""
Analytics serializers for GenFree Network.
"""

from rest_framework import serializers
from .models import (
    AnalyticsEvent, UserSession, PageView, ConversionGoal, 
    Conversion, AnalyticsReport
)


class AnalyticsEventSerializer(serializers.ModelSerializer):
    """Serializer for analytics events."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AnalyticsEvent
        fields = [
            'id', 'event_type', 'event_name', 'event_category', 'event_label',
            'event_value', 'username', 'session_id', 'ip_address', 'country',
            'city', 'device_type', 'browser', 'page_url', 'page_title',
            'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
            'custom_data', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class AnalyticsEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating analytics events."""
    
    class Meta:
        model = AnalyticsEvent
        fields = [
            'event_type', 'event_name', 'event_category', 'event_label',
            'event_value', 'page_url', 'page_title', 'referrer',
            'utm_source', 'utm_medium', 'utm_campaign', 'custom_data'
        ]
    
    def validate_event_value(self, value):
        """Validate event value."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Event value cannot be negative.")
        return value


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer for user sessions."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    duration = serializers.ReadOnlyField()
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_id', 'username', 'start_time', 'end_time',
            'duration', 'page_views', 'events_count', 'bounce',
            'landing_page', 'exit_page', 'country', 'city',
            'device_type', 'browser'
        ]


class PageViewSerializer(serializers.ModelSerializer):
    """Serializer for page views."""
    
    class Meta:
        model = PageView
        fields = [
            'id', 'url', 'title', 'referrer', 'timestamp',
            'time_on_page', 'scroll_depth', 'clicks', 'form_interactions'
        ]


class ConversionGoalSerializer(serializers.ModelSerializer):
    """Serializer for conversion goals."""
    
    conversions_count = serializers.SerializerMethodField()
    conversion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = ConversionGoal
        fields = [
            'id', 'name', 'description', 'goal_type', 'target_event_type',
            'target_page_url', 'target_duration', 'target_value',
            'is_active', 'value', 'conversions_count', 'conversion_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_conversions_count(self, obj):
        return obj.conversions.count()
    
    def get_conversion_rate(self, obj):
        # Calculate conversion rate (placeholder logic)
        total_sessions = UserSession.objects.count()
        if total_sessions > 0:
            return round((obj.conversions.count() / total_sessions) * 100, 2)
        return 0.0


class ConversionSerializer(serializers.ModelSerializer):
    """Serializer for conversions."""
    
    goal_name = serializers.CharField(source='goal.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Conversion
        fields = [
            'id', 'goal_name', 'username', 'value', 'timestamp',
            'first_touch_utm_source', 'first_touch_utm_campaign',
            'last_touch_utm_source', 'last_touch_utm_campaign'
        ]


class AnalyticsReportSerializer(serializers.ModelSerializer):
    """Serializer for analytics reports."""
    
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = AnalyticsReport
        fields = [
            'id', 'name', 'report_type', 'start_date', 'end_date',
            'filters', 'data', 'generated_at', 'generated_by_name'
        ]
        read_only_fields = ['generated_at']


class AnalyticsDashboardSerializer(serializers.Serializer):
    """Serializer for analytics dashboard data."""
    
    # Overview metrics
    total_page_views = serializers.IntegerField()
    unique_visitors = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    average_session_duration = serializers.DecimalField(max_digits=10, decimal_places=2)
    bounce_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Traffic sources
    traffic_sources = serializers.ListField(child=serializers.DictField())
    
    # Popular pages
    popular_pages = serializers.ListField(child=serializers.DictField())
    
    # Device/Browser stats
    device_stats = serializers.ListField(child=serializers.DictField())
    browser_stats = serializers.ListField(child=serializers.DictField())
    
    # Geographic data
    country_stats = serializers.ListField(child=serializers.DictField())
    
    # Time-based data
    hourly_traffic = serializers.ListField(child=serializers.DictField())
    daily_traffic = serializers.ListField(child=serializers.DictField())
    
    # Conversions
    total_conversions = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_converting_pages = serializers.ListField(child=serializers.DictField())
    
    # Recent activity
    recent_events = AnalyticsEventSerializer(many=True)
    active_sessions = UserSessionSerializer(many=True)


class EventTrackingSerializer(serializers.Serializer):
    """Serializer for tracking custom events."""
    
    event_type = serializers.ChoiceField(choices=AnalyticsEvent.EVENT_TYPE_CHOICES)
    event_name = serializers.CharField(max_length=200)
    event_category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    event_label = serializers.CharField(max_length=200, required=False, allow_blank=True)
    event_value = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    
    page_url = serializers.URLField()
    page_title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    referrer = serializers.URLField(required=False, allow_blank=True)
    
    # UTM parameters
    utm_source = serializers.CharField(max_length=100, required=False, allow_blank=True)
    utm_medium = serializers.CharField(max_length=100, required=False, allow_blank=True)
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Custom data
    custom_data = serializers.JSONField(required=False, default=dict)
    
    # Device info (optional, will be auto-detected if not provided)
    device_type = serializers.ChoiceField(
        choices=AnalyticsEvent.DEVICE_TYPE_CHOICES,
        required=False
    )
    browser = serializers.CharField(max_length=100, required=False, allow_blank=True)
    screen_resolution = serializers.CharField(max_length=20, required=False, allow_blank=True)