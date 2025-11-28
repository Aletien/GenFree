"""
Events views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q, Count, Prefetch
from datetime import timedelta, datetime
import calendar

from .models import Event, EventCategory, EventRegistration, EventReminder, Speaker
from .serializers import (
    EventSerializer, EventListSerializer, EventCreateSerializer,
    EventCategorySerializer, EventRegistrationSerializer,
    EventRegistrationCreateSerializer, EventReminderSerializer,
    SpeakerSerializer, EventStatsSerializer, EventCalendarSerializer
)


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for events."""
    
    queryset = Event.objects.filter(status='published')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        elif self.action == 'create':
            return EventCreateSerializer
        return EventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by location type
        location_type = self.request.query_params.get('location_type')
        if location_type:
            queryset = queryset.filter(location_type=location_type)
        
        # Filter by time period
        time_filter = self.request.query_params.get('time')
        now = timezone.now()
        
        if time_filter == 'upcoming':
            queryset = queryset.filter(start_datetime__gte=now)
        elif time_filter == 'past':
            queryset = queryset.filter(end_datetime__lt=now)
        elif time_filter == 'today':
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            queryset = queryset.filter(
                start_datetime__lt=today_end,
                end_datetime__gte=today_start
            )
        elif time_filter == 'this_week':
            week_start = now - timedelta(days=now.weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            week_end = week_start + timedelta(days=7)
            queryset = queryset.filter(
                start_datetime__gte=week_start,
                start_datetime__lt=week_end
            )
        elif time_filter == 'this_month':
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
            queryset = queryset.filter(
                start_datetime__gte=month_start,
                start_datetime__lt=next_month
            )
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by free events
        free_only = self.request.query_params.get('free')
        if free_only and free_only.lower() == 'true':
            queryset = queryset.filter(is_free=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search) |
                Q(venue_name__icontains=search)
            )
        
        return queryset.select_related('category', 'organizer').prefetch_related(
            'speakers', 'registrations'
        ).order_by('-is_featured', 'start_datetime')
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve an event and increment view count."""
        event = self.get_object()
        event.view_count += 1
        event.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, slug=None):
        """Register for an event."""
        event = self.get_object()
        
        # Check if user is already registered
        existing_registration = EventRegistration.objects.filter(
            event=event,
            user=request.user
        ).first()
        
        if existing_registration:
            return Response(
                {'error': 'You are already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create registration
        registration_data = request.data.copy()
        registration_data['event'] = event.id
        
        serializer = EventRegistrationCreateSerializer(
            data=registration_data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            registration = serializer.save(user=request.user)
            
            # Determine registration status
            if event.is_full:
                if event.allow_waitlist:
                    registration.registration_type = 'waitlist'
                    registration.status = 'waitlisted'
                else:
                    return Response(
                        {'error': 'Event is full and waitlist is not allowed'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif event.requires_approval:
                registration.status = 'pending'
            else:
                registration.status = 'confirmed'
            
            registration.save()
            
            # Create reminders
            EventReminder.create_reminders_for_registration(registration)
            
            response_serializer = EventRegistrationSerializer(registration)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, slug=None):
        """Get event registrations (for organizers)."""
        event = self.get_object()
        
        # Only event organizer or staff can view registrations
        if not (request.user == event.organizer or request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registrations = event.registrations.select_related('user').order_by('-registered_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            registrations = registrations.filter(status=status_filter)
        
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, slug=None):
        """Get event statistics."""
        event = self.get_object()
        
        registrations = event.registrations.all()
        
        stats = {
            'event': EventSerializer(event, context={'request': request}).data,
            'total_registrations': registrations.count(),
            'confirmed_registrations': registrations.filter(status='confirmed').count(),
            'pending_registrations': registrations.filter(status='pending').count(),
            'waitlist_registrations': registrations.filter(status='waitlisted').count(),
            'cancelled_registrations': registrations.filter(status='cancelled').count(),
            'checked_in_count': registrations.filter(checked_in_at__isnull=False).count(),
            'registration_by_day': self._get_registration_by_day(event),
            'recent_registrations': EventRegistrationSerializer(
                registrations.order_by('-registered_at')[:10], many=True
            ).data
        }
        
        return Response(stats)
    
    def _get_registration_by_day(self, event):
        """Get registration count by day."""
        registrations = event.registrations.filter(status__in=['confirmed', 'pending'])
        daily_stats = {}
        
        for registration in registrations:
            date = registration.registered_at.date()
            date_str = date.strftime('%Y-%m-%d')
            daily_stats[date_str] = daily_stats.get(date_str, 0) + 1
        
        return [{'date': date, 'count': count} for date, count in sorted(daily_stats.items())]
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get events for calendar view."""
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        # Get events for the month
        month_start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            month_end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            month_end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        
        events = self.get_queryset().filter(
            start_datetime__gte=month_start,
            start_datetime__lt=month_end
        )
        
        # Group events by date
        calendar_data = {}
        for event in events:
            date = event.start_datetime.date()
            date_str = date.strftime('%Y-%m-%d')
            if date_str not in calendar_data:
                calendar_data[date_str] = []
            calendar_data[date_str].append(event)
        
        # Format response
        calendar_events = []
        for date_str, day_events in sorted(calendar_data.items()):
            calendar_events.append({
                'date': date_str,
                'events': EventListSerializer(day_events, many=True).data
            })
        
        return Response({
            'year': year,
            'month': month,
            'calendar': calendar_events
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get overall event statistics."""
        now = timezone.now()
        
        # Basic counts
        total_events = Event.objects.filter(status='published').count()
        upcoming_events = Event.objects.filter(
            status='published',
            start_datetime__gte=now
        ).count()
        past_events = Event.objects.filter(
            status='published',
            end_datetime__lt=now
        ).count()
        
        total_registrations = EventRegistration.objects.filter(
            status__in=['confirmed', 'pending']
        ).count()
        
        # Most popular events (by registrations)
        most_popular_events = Event.objects.filter(
            status='published'
        ).annotate(
            registration_count=Count('registrations')
        ).order_by('-registration_count')[:5]
        
        # Category breakdown
        category_stats = list(EventCategory.objects.filter(
            is_active=True
        ).annotate(
            event_count=Count('events', filter=Q(events__status='published'))
        ).values('name', 'event_count').order_by('-event_count'))
        
        # Monthly stats for the last 6 months
        monthly_events = []
        monthly_registrations = []
        
        for i in range(6):
            date = now - timedelta(days=30 * i)
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
            
            month_events = Event.objects.filter(
                status='published',
                created_at__gte=month_start,
                created_at__lt=next_month
            ).count()
            
            month_registrations = EventRegistration.objects.filter(
                registered_at__gte=month_start,
                registered_at__lt=next_month,
                status__in=['confirmed', 'pending']
            ).count()
            
            monthly_events.insert(0, {
                'month': month_start.strftime('%Y-%m'),
                'count': month_events
            })
            
            monthly_registrations.insert(0, {
                'month': month_start.strftime('%Y-%m'),
                'count': month_registrations
            })
        
        # Recent registrations
        recent_registrations = EventRegistration.objects.select_related(
            'event', 'user'
        ).order_by('-registered_at')[:10]
        
        stats_data = {
            'total_events': total_events,
            'upcoming_events': upcoming_events,
            'past_events': past_events,
            'total_registrations': total_registrations,
            'most_popular_events': most_popular_events,
            'category_stats': category_stats,
            'monthly_events': monthly_events,
            'monthly_registrations': monthly_registrations,
            'recent_registrations': recent_registrations
        }
        
        serializer = EventStatsSerializer(stats_data)
        return Response(serializer.data)


class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for event categories."""
    
    queryset = EventCategory.objects.filter(is_active=True)
    serializer_class = EventCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class SpeakerViewSet(viewsets.ModelViewSet):
    """ViewSet for speakers."""
    
    queryset = Speaker.objects.all()
    serializer_class = SpeakerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(title__icontains=search) |
                Q(bio__icontains=search)
            )
        
        return queryset.order_by('-is_featured', 'name')


class EventRegistrationViewSet(viewsets.ModelViewSet):
    """ViewSet for event registrations."""
    
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by current user's registrations
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        return queryset.select_related('event', 'user').order_by('-registered_at')
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an event registration."""
        registration = self.get_object()
        
        # Check if cancellation is allowed
        if registration.event.start_datetime <= timezone.now():
            return Response(
                {'error': 'Cannot cancel registration for events that have started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration.status = 'cancelled'
        registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in to an event (for organizers)."""
        registration = self.get_object()
        
        # Only event organizer or staff can check in attendees
        if not (request.user == registration.event.organizer or request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if registration.checked_in_at:
            return Response(
                {'error': 'Already checked in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration.checked_in_at = timezone.now()
        registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)