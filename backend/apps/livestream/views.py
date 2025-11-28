"""
Live streaming views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Sum, Max, Count
from datetime import timedelta

from .models import LiveStream, StreamAnalytics, StreamViewer
from .serializers import (
    LiveStreamSerializer, LiveStreamCreateSerializer, StreamAnalyticsSerializer,
    StreamViewerSerializer, LiveStreamStatusSerializer, StreamStatsSerializer
)


class LiveStreamViewSet(viewsets.ModelViewSet):
    """ViewSet for managing live streams."""
    
    queryset = LiveStream.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LiveStreamCreateSerializer
        return LiveStreamSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get current live stream status."""
        # Get current live stream
        current_stream = LiveStream.objects.filter(status='live').first()
        
        # Get upcoming streams
        upcoming_streams = LiveStream.objects.filter(
            status='scheduled',
            scheduled_start__gte=timezone.now()
        ).order_by('scheduled_start')[:5]
        
        # Calculate viewer count
        viewer_count = 0
        if current_stream:
            viewer_count = current_stream.current_viewers
        
        # Get total views today
        today = timezone.now().date()
        total_views_today = LiveStream.objects.filter(
            actual_start__date=today
        ).aggregate(total=Sum('total_views'))['total'] or 0
        
        data = {
            'is_live': current_stream is not None,
            'current_stream': current_stream,
            'upcoming_streams': upcoming_streams,
            'viewer_count': viewer_count,
            'total_views_today': total_views_today
        }
        
        serializer = LiveStreamStatusSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get stream analytics and statistics."""
        # Calculate overall stats
        total_streams = LiveStream.objects.count()
        
        # Total streaming hours
        streams_with_duration = LiveStream.objects.filter(
            actual_start__isnull=False,
            actual_end__isnull=False
        )
        total_hours = 0
        for stream in streams_with_duration:
            if stream.duration:
                total_hours += stream.duration.total_seconds() / 3600
        
        # Viewership stats
        total_views = LiveStream.objects.aggregate(
            total=Sum('total_views')
        )['total'] or 0
        
        average_viewers = LiveStream.objects.aggregate(
            avg=Avg('max_viewers')
        )['avg'] or 0
        
        peak_viewers = LiveStream.objects.aggregate(
            peak=Max('max_viewers')
        )['peak'] or 0
        
        # Most popular platform
        most_popular = LiveStream.objects.values('platform').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        most_popular_platform = most_popular['platform'] if most_popular else 'youtube'
        
        # Recent analytics (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_analytics = StreamAnalytics.objects.filter(
            timestamp__gte=thirty_days_ago
        ).order_by('-timestamp')[:20]
        
        # Top streams by views
        top_streams = LiveStream.objects.filter(
            status='ended'
        ).order_by('-total_views')[:10]
        
        data = {
            'total_streams': total_streams,
            'total_hours_streamed': round(total_hours, 2),
            'total_views': total_views,
            'average_viewers': round(average_viewers, 2),
            'peak_viewers': peak_viewers,
            'most_popular_platform': most_popular_platform,
            'recent_analytics': recent_analytics,
            'top_streams': top_streams
        }
        
        serializer = StreamStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a live stream."""
        stream = self.get_object()
        
        if stream.status != 'scheduled':
            return Response(
                {'error': 'Only scheduled streams can be started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stream.start_stream()
        serializer = self.get_serializer(stream)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """End a live stream."""
        stream = self.get_object()
        
        if stream.status != 'live':
            return Response(
                {'error': 'Only live streams can be ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stream.end_stream()
        serializer = self.get_serializer(stream)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_viewers(self, request, pk=None):
        """Update current viewer count."""
        stream = self.get_object()
        viewer_count = request.data.get('viewer_count', 0)
        
        stream.current_viewers = viewer_count
        if viewer_count > stream.max_viewers:
            stream.max_viewers = viewer_count
        
        stream.save()
        
        # Create analytics record
        StreamAnalytics.objects.create(
            stream=stream,
            concurrent_viewers=viewer_count
        )
        
        return Response({'current_viewers': stream.current_viewers})


class StreamAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for stream analytics."""
    
    queryset = StreamAnalytics.objects.all()
    serializer_class = StreamAnalyticsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        stream_id = self.request.query_params.get('stream_id')
        
        if stream_id:
            queryset = queryset.filter(stream_id=stream_id)
        
        return queryset


class StreamViewerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for stream viewers."""
    
    queryset = StreamViewer.objects.all()
    serializer_class = StreamViewerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        stream_id = self.request.query_params.get('stream_id')
        
        if stream_id:
            queryset = queryset.filter(stream_id=stream_id)
        
        return queryset