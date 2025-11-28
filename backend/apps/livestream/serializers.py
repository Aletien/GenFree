"""
Live streaming serializers for GenFree Network.
"""

from rest_framework import serializers
from .models import LiveStream, StreamAnalytics, StreamViewer


class LiveStreamSerializer(serializers.ModelSerializer):
    """Serializer for live stream data."""
    
    duration = serializers.ReadOnlyField()
    is_live = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = LiveStream
        fields = [
            'id', 'title', 'description', 'platform', 'stream_url', 'embed_code',
            'scheduled_start', 'actual_start', 'actual_end', 'status', 'is_featured',
            'thumbnail', 'max_viewers', 'total_views', 'current_viewers',
            'duration', 'is_live', 'created_by_name', 'created_at'
        ]
        read_only_fields = [
            'id', 'actual_start', 'actual_end', 'max_viewers', 'total_views',
            'current_viewers', 'created_at'
        ]


class LiveStreamCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating live streams."""
    
    class Meta:
        model = LiveStream
        fields = [
            'title', 'description', 'platform', 'stream_key', 'stream_url',
            'embed_code', 'scheduled_start', 'is_featured', 'thumbnail'
        ]
    
    def validate_scheduled_start(self, value):
        """Ensure scheduled start is in the future."""
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Scheduled start must be in the future.")
        return value


class StreamAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for stream analytics."""
    
    class Meta:
        model = StreamAnalytics
        fields = [
            'timestamp', 'concurrent_viewers', 'new_viewers', 'returning_viewers',
            'chat_messages', 'reactions', 'shares', 'stream_quality', 'buffering_rate'
        ]


class StreamViewerSerializer(serializers.ModelSerializer):
    """Serializer for stream viewers."""
    
    watch_duration = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StreamViewer
        fields = [
            'username', 'joined_at', 'left_at', 'watch_duration',
            'messages_sent', 'reactions_given', 'country', 'city'
        ]


class LiveStreamStatusSerializer(serializers.Serializer):
    """Serializer for live stream status response."""
    
    is_live = serializers.BooleanField()
    current_stream = LiveStreamSerializer(allow_null=True)
    upcoming_streams = LiveStreamSerializer(many=True)
    viewer_count = serializers.IntegerField()
    total_views_today = serializers.IntegerField()


class StreamStatsSerializer(serializers.Serializer):
    """Serializer for stream statistics."""
    
    total_streams = serializers.IntegerField()
    total_hours_streamed = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_views = serializers.IntegerField()
    average_viewers = serializers.DecimalField(max_digits=10, decimal_places=2)
    peak_viewers = serializers.IntegerField()
    most_popular_platform = serializers.CharField()
    
    # Recent analytics
    recent_analytics = StreamAnalyticsSerializer(many=True)
    
    # Top streams
    top_streams = LiveStreamSerializer(many=True)