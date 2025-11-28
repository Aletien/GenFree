"""
Chat system views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta

from .models import ChatRoom, ChatMessage, ChatUserActivity, MessageReport
from .serializers import (
    ChatRoomSerializer, ChatMessageSerializer, ChatMessageCreateSerializer,
    ChatUserActivitySerializer, MessageReportSerializer, ChatStatsSerializer
)


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat rooms."""
    
    queryset = ChatRoom.objects.filter(is_active=True)
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, slug=None):
        """Get messages for a specific chat room."""
        room = self.get_object()
        limit = int(request.query_params.get('limit', 50))
        
        messages = ChatMessage.objects.filter(
            room=room,
            is_approved=True
        ).select_related('user').order_by('-created_at')[:limit]
        
        # Reverse to show oldest first
        messages = list(reversed(messages))
        
        serializer = ChatMessageSerializer(
            messages, many=True, context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def join(self, request, slug=None):
        """Join a chat room."""
        room = self.get_object()
        
        # Record join activity
        ChatUserActivity.objects.create(
            user=request.user if request.user.is_authenticated else None,
            room=room,
            session_id=request.session.session_key,
            activity_type='join'
        )
        
        return Response({'status': 'joined', 'room': room.slug})
    
    @action(detail=True, methods=['post'])
    def leave(self, request, slug=None):
        """Leave a chat room."""
        room = self.get_object()
        
        # Record leave activity
        ChatUserActivity.objects.create(
            user=request.user if request.user.is_authenticated else None,
            room=room,
            session_id=request.session.session_key,
            activity_type='leave'
        )
        
        return Response({'status': 'left', 'room': room.slug})


class ChatMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat messages."""
    
    queryset = ChatMessage.objects.filter(is_approved=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        room_slug = self.request.query_params.get('room')
        
        if room_slug:
            queryset = queryset.filter(room__slug=room_slug)
        
        return queryset.select_related('user', 'room').order_by('-created_at')
    
    def perform_create(self, serializer):
        # Get additional data
        ip_address = get_client_ip(self.request)
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        
        # Set user if authenticated
        user = self.request.user if self.request.user.is_authenticated else None
        session_id = self.request.session.session_key
        
        message = serializer.save(
            user=user,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Record message activity
        ChatUserActivity.objects.create(
            user=user,
            room=message.room,
            session_id=session_id,
            activity_type='message',
            message=message
        )
        
        # Auto-moderate if needed
        if message.room.is_moderated:
            # Simple auto-moderation logic
            content_lower = message.content.lower()
            suspicious_words = ['spam', 'fake', 'scam']  # Add more as needed
            
            if any(word in content_lower for word in suspicious_words):
                message.is_approved = False
                message.save()
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a message."""
        message = self.get_object()
        message.likes += 1
        message.save()
        
        # Record reaction activity
        ChatUserActivity.objects.create(
            user=request.user if request.user.is_authenticated else None,
            room=message.room,
            session_id=request.session.session_key,
            activity_type='reaction',
            message=message,
            metadata={'reaction': 'like'}
        )
        
        return Response({'likes': message.likes})
    
    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """Report a message."""
        message = self.get_object()
        reason = request.data.get('reason', 'other')
        description = request.data.get('description', '')
        
        # Create report
        report = MessageReport.objects.create(
            message=message,
            reported_by=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key,
            reason=reason,
            description=description
        )
        
        # Increment report count
        message.reports += 1
        message.save()
        
        # Record report activity
        ChatUserActivity.objects.create(
            user=request.user if request.user.is_authenticated else None,
            room=message.room,
            session_id=request.session.session_key,
            activity_type='report',
            message=message,
            metadata={'reason': reason}
        )
        
        serializer = MessageReportSerializer(report)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get chat statistics."""
        # Calculate stats
        total_rooms = ChatRoom.objects.filter(is_active=True).count()
        total_messages = ChatMessage.objects.filter(is_approved=True).count()
        
        # Active users (last 30 minutes)
        thirty_minutes_ago = timezone.now() - timedelta(minutes=30)
        active_users = ChatUserActivity.objects.filter(
            timestamp__gte=thirty_minutes_ago
        ).values('user', 'session_id').distinct().count()
        
        # Messages today
        today = timezone.now().date()
        messages_today = ChatMessage.objects.filter(
            created_at__date=today,
            is_approved=True
        ).count()
        
        # Most active room
        most_active_room_data = ChatMessage.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7),
            is_approved=True
        ).values('room__name').annotate(
            message_count=Count('id')
        ).order_by('-message_count').first()
        
        most_active_room = most_active_room_data['room__name'] if most_active_room_data else 'None'
        
        # Recent messages
        recent_messages = ChatMessage.objects.filter(
            is_approved=True
        ).select_related('user', 'room').order_by('-created_at')[:10]
        
        # Room stats
        room_stats = list(ChatMessage.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7),
            is_approved=True
        ).values('room__name', 'room__slug').annotate(
            message_count=Count('id'),
            user_count=Count('user', distinct=True)
        ).order_by('-message_count')[:5])
        
        data = {
            'total_rooms': total_rooms,
            'total_messages': total_messages,
            'active_users': active_users,
            'messages_today': messages_today,
            'most_active_room': most_active_room,
            'recent_messages': recent_messages,
            'room_stats': room_stats
        }
        
        serializer = ChatStatsSerializer(data)
        return Response(serializer.data)


class MessageReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing message reports."""
    
    queryset = MessageReport.objects.all()
    serializer_class = MessageReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Only moderators and staff can see all reports
        if not (self.request.user.is_staff or 
                self.request.user.moderated_rooms.exists()):
            # Regular users can only see their own reports
            queryset = queryset.filter(reported_by=self.request.user)
        
        return queryset.select_related('message', 'reported_by', 'resolved_by')
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a message report."""
        report = self.get_object()
        resolution_note = request.data.get('resolution_note', '')
        action = request.data.get('action', 'dismiss')  # dismiss, remove_message, ban_user
        
        # Only moderators can resolve reports
        if not (request.user.is_staff or 
                report.message.room.moderators.filter(id=request.user.id).exists()):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark as resolved
        report.is_resolved = True
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.resolution_note = resolution_note
        report.save()
        
        # Take action based on resolution
        if action == 'remove_message':
            report.message.is_approved = False
            report.message.save()
        elif action == 'ban_user' and report.message.user:
            # Implement user banning logic here
            pass
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)