"""
Analytics views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Q
from datetime import timedelta, datetime
import json
from user_agents import parse

from .models import (
    AnalyticsEvent, UserSession, PageView, ConversionGoal,
    Conversion, AnalyticsReport
)
from .serializers import (
    AnalyticsEventSerializer, AnalyticsEventCreateSerializer,
    UserSessionSerializer, PageViewSerializer, ConversionGoalSerializer,
    ConversionSerializer, AnalyticsReportSerializer,
    AnalyticsDashboardSerializer, EventTrackingSerializer
)


def get_client_info(request):
    """Extract client information from request."""
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(user_agent_string)
    
    # Get IP address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    
    # Determine device type
    if user_agent.is_mobile:
        device_type = 'mobile'
    elif user_agent.is_tablet:
        device_type = 'tablet'
    elif user_agent.is_pc:
        device_type = 'desktop'
    else:
        device_type = 'unknown'
    
    return {
        'ip_address': ip,
        'user_agent': user_agent_string,
        'device_type': device_type,
        'browser': f"{user_agent.browser.family} {user_agent.browser.version_string}",
        'os': f"{user_agent.os.family} {user_agent.os.version_string}"
    }


def get_or_create_session(request):
    """Get or create user session."""
    session_id = request.session.session_key
    if not session_id:
        request.session.create()
        session_id = request.session.session_key
    
    try:
        user_session = UserSession.objects.get(session_id=session_id)
        # Update last activity
        user_session.last_activity = timezone.now()
        user_session.save()
    except UserSession.DoesNotExist:
        client_info = get_client_info(request)
        user_session = UserSession.objects.create(
            session_id=session_id,
            user=request.user if request.user.is_authenticated else None,
            landing_page=request.META.get('HTTP_REFERER', ''),
            **client_info
        )
    
    return user_session


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def track_event(request):
    """Track a custom analytics event."""
    serializer = EventTrackingSerializer(data=request.data)
    
    if serializer.is_valid():
        client_info = get_client_info(request)
        session = get_or_create_session(request)
        
        # Override device info if provided
        device_info = {
            'device_type': serializer.validated_data.get('device_type', client_info['device_type']),
            'browser': serializer.validated_data.get('browser', client_info['browser']),
            'screen_resolution': serializer.validated_data.get('screen_resolution', ''),
        }
        
        # Create analytics event
        event = AnalyticsEvent.objects.create(
            event_type=serializer.validated_data['event_type'],
            event_name=serializer.validated_data['event_name'],
            event_category=serializer.validated_data.get('event_category', ''),
            event_label=serializer.validated_data.get('event_label', ''),
            event_value=serializer.validated_data.get('event_value'),
            user=request.user if request.user.is_authenticated else None,
            session_id=session.session_id,
            page_url=serializer.validated_data['page_url'],
            page_title=serializer.validated_data.get('page_title', ''),
            referrer=serializer.validated_data.get('referrer', ''),
            utm_source=serializer.validated_data.get('utm_source', ''),
            utm_medium=serializer.validated_data.get('utm_medium', ''),
            utm_campaign=serializer.validated_data.get('utm_campaign', ''),
            custom_data=serializer.validated_data.get('custom_data', {}),
            **client_info,
            **device_info
        )
        
        # Update session metrics
        session.events_count += 1
        session.save()
        
        # Check for conversions
        check_conversions(session, event)
        
        return Response({
            'status': 'success',
            'event_id': str(event.id)
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def track_page_view(request):
    """Track a page view."""
    url = request.data.get('url')
    title = request.data.get('title', '')
    referrer = request.data.get('referrer', '')
    
    if not url:
        return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    session = get_or_create_session(request)
    
    # Create page view
    page_view = PageView.objects.create(
        session=session,
        url=url,
        title=title,
        referrer=referrer
    )
    
    # Update session metrics
    session.page_views += 1
    if session.page_views > 1:
        session.bounce = False
    session.save()
    
    # Create analytics event
    client_info = get_client_info(request)
    AnalyticsEvent.objects.create(
        event_type='page_view',
        event_name='Page View',
        event_category='Navigation',
        user=request.user if request.user.is_authenticated else None,
        session_id=session.session_id,
        page_url=url,
        page_title=title,
        referrer=referrer,
        **client_info
    )
    
    return Response({
        'status': 'success',
        'page_view_id': str(page_view.id)
    }, status=status.HTTP_201_CREATED)


def check_conversions(session, event):
    """Check if event triggers any conversion goals."""
    active_goals = ConversionGoal.objects.filter(is_active=True)
    
    for goal in active_goals:
        # Check if already converted for this goal in this session
        if Conversion.objects.filter(goal=goal, session=session).exists():
            continue
        
        converted = False
        
        if goal.goal_type == 'event' and goal.target_event_type == event.event_type:
            converted = True
        elif goal.goal_type == 'page' and goal.target_page_url in event.page_url:
            converted = True
        elif goal.goal_type == 'duration':
            if session.duration.total_seconds() >= goal.target_duration:
                converted = True
        elif goal.goal_type == 'value' and event.event_value:
            if event.event_value >= goal.target_value:
                converted = True
        
        if converted:
            Conversion.objects.create(
                goal=goal,
                session=session,
                user=event.user,
                value=goal.value
            )


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    """ViewSet for analytics events."""
    
    queryset = AnalyticsEvent.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AnalyticsEventCreateSerializer
        return AnalyticsEventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset.select_related('user').order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get analytics dashboard data."""
        # Date range (default to last 30 days)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Parse date filters
        start_param = request.query_params.get('start_date')
        end_param = request.query_params.get('end_date')
        
        if start_param:
            start_date = datetime.fromisoformat(start_param.replace('Z', '+00:00'))
        if end_param:
            end_date = datetime.fromisoformat(end_param.replace('Z', '+00:00'))
        
        # Base queryset
        events_qs = AnalyticsEvent.objects.filter(
            timestamp__range=[start_date, end_date]
        )
        sessions_qs = UserSession.objects.filter(
            start_time__range=[start_date, end_date]
        )
        
        # Overview metrics
        total_page_views = events_qs.filter(event_type='page_view').count()
        unique_visitors = events_qs.values('ip_address').distinct().count()
        total_sessions = sessions_qs.count()
        
        avg_duration = sessions_qs.aggregate(
            avg=Avg('last_activity') - Avg('start_time')
        )['avg']
        average_session_duration = avg_duration.total_seconds() if avg_duration else 0
        
        bounce_sessions = sessions_qs.filter(bounce=True).count()
        bounce_rate = (bounce_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        # Traffic sources
        traffic_sources = list(events_qs.exclude(
            utm_source=''
        ).values('utm_source').annotate(
            count=Count('id')
        ).order_by('-count')[:10])
        
        # Popular pages
        popular_pages = list(events_qs.filter(
            event_type='page_view'
        ).values('page_url', 'page_title').annotate(
            views=Count('id')
        ).order_by('-views')[:10])
        
        # Device stats
        device_stats = list(events_qs.values('device_type').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        # Browser stats
        browser_stats = list(events_qs.values('browser').annotate(
            count=Count('id')
        ).order_by('-count')[:10])
        
        # Country stats
        country_stats = list(events_qs.exclude(
            country=''
        ).values('country').annotate(
            count=Count('id')
        ).order_by('-count')[:10])
        
        # Hourly traffic (last 24 hours)
        last_24h = timezone.now() - timedelta(hours=24)
        hourly_traffic = []
        for i in range(24):
            hour_start = last_24h + timedelta(hours=i)
            hour_end = hour_start + timedelta(hours=1)
            count = events_qs.filter(
                timestamp__range=[hour_start, hour_end]
            ).count()
            hourly_traffic.append({
                'hour': hour_start.strftime('%H:00'),
                'count': count
            })
        
        # Daily traffic (last 30 days)
        daily_traffic = []
        for i in range(30):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            count = events_qs.filter(
                timestamp__range=[day_start, day_end]
            ).count()
            daily_traffic.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Conversions
        conversions_qs = Conversion.objects.filter(
            timestamp__range=[start_date, end_date]
        )
        total_conversions = conversions_qs.count()
        conversion_rate = (total_conversions / total_sessions * 100) if total_sessions > 0 else 0
        
        # Top converting pages
        top_converting_pages = list(conversions_qs.values(
            'session__pageviews__url'
        ).annotate(
            conversions=Count('id')
        ).order_by('-conversions')[:10])
        
        # Recent activity
        recent_events = events_qs.select_related('user').order_by('-timestamp')[:20]
        active_sessions = sessions_qs.filter(
            end_time__isnull=True
        ).select_related('user').order_by('-last_activity')[:10]
        
        data = {
            'total_page_views': total_page_views,
            'unique_visitors': unique_visitors,
            'total_sessions': total_sessions,
            'average_session_duration': round(average_session_duration, 2),
            'bounce_rate': round(bounce_rate, 2),
            'traffic_sources': traffic_sources,
            'popular_pages': popular_pages,
            'device_stats': device_stats,
            'browser_stats': browser_stats,
            'country_stats': country_stats,
            'hourly_traffic': hourly_traffic,
            'daily_traffic': daily_traffic,
            'total_conversions': total_conversions,
            'conversion_rate': round(conversion_rate, 2),
            'top_converting_pages': top_converting_pages,
            'recent_events': recent_events,
            'active_sessions': active_sessions
        }
        
        serializer = AnalyticsDashboardSerializer(data)
        return Response(serializer.data)


class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user sessions."""
    
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset.select_related('user').order_by('-start_time')


class ConversionGoalViewSet(viewsets.ModelViewSet):
    """ViewSet for conversion goals."""
    
    queryset = ConversionGoal.objects.all()
    serializer_class = ConversionGoalSerializer
    permission_classes = [IsAuthenticated]


class AnalyticsReportViewSet(viewsets.ModelViewSet):
    """ViewSet for analytics reports."""
    
    queryset = AnalyticsReport.objects.all()
    serializer_class = AnalyticsReportSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)