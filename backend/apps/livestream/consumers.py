"""
LiveStream WebSocket consumers for real-time viewer tracking.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import LiveStream, StreamViewer, StreamAnalytics


class LiveStreamConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for live streaming functionality."""
    
    async def connect(self):
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        self.stream_group_name = f'livestream_{self.stream_id}'
        
        # Join stream group
        await self.channel_layer.group_add(
            self.stream_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Record viewer
        await self.add_viewer()
        
        # Send current viewer count and stream status
        viewer_count = await self.get_viewer_count()
        stream_status = await self.get_stream_status()
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'viewer_count': viewer_count,
            'stream_status': stream_status
        }))
        
        # Broadcast updated viewer count
        await self.channel_layer.group_send(
            self.stream_group_name,
            {
                'type': 'viewer_count_update',
                'count': viewer_count
            }
        )
    
    async def disconnect(self, close_code):
        # Remove viewer
        await self.remove_viewer()
        
        # Leave stream group
        await self.channel_layer.group_discard(
            self.stream_group_name,
            self.channel_name
        )
        
        # Update viewer count
        viewer_count = await self.get_viewer_count()
        await self.channel_layer.group_send(
            self.stream_group_name,
            {
                'type': 'viewer_count_update',
                'count': viewer_count
            }
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'heartbeat':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'analytics':
                await self.handle_analytics(data)
            elif message_type == 'quality_report':
                await self.handle_quality_report(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def handle_analytics(self, data):
        """Handle analytics events from viewer."""
        event_type = data.get('event')
        metadata = data.get('data', {})
        
        await self.save_analytics_event(event_type, metadata)
    
    async def handle_quality_report(self, data):
        """Handle video quality reports from viewers."""
        quality = data.get('quality', '1080p')
        buffering_rate = data.get('buffering_rate', 0)
        
        await self.save_quality_data(quality, buffering_rate)
    
    # Message broadcast handlers
    async def viewer_count_update(self, event):
        """Send viewer count update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'viewer_count',
            'count': event['count']
        }))
    
    async def stream_status_update(self, event):
        """Send stream status update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'stream_status',
            'status': event['status'],
            'message': event.get('message', '')
        }))
    
    async def stream_announcement(self, event):
        """Send stream announcement to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'announcement',
            'message': event['message'],
            'priority': event.get('priority', 'normal')
        }))
    
    # Database operations
    @database_sync_to_async
    def add_viewer(self):
        """Add viewer to the stream."""
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            user = self.scope['user'] if self.scope['user'].is_authenticated else None
            session_id = self.scope.get('session', {}).get('session_key', '')
            
            # Create or get viewer record
            viewer, created = StreamViewer.objects.get_or_create(
                stream=stream,
                user=user,
                session_id=session_id,
                defaults={
                    'country': '',
                    'city': ''
                }
            )
            
            # Update stream's current viewer count
            stream.current_viewers += 1
            if stream.current_viewers > stream.max_viewers:
                stream.max_viewers = stream.current_viewers
            stream.save(update_fields=['current_viewers', 'max_viewers'])
            
            return True
        except LiveStream.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error adding viewer: {e}")
            return False
    
    @database_sync_to_async
    def remove_viewer(self):
        """Remove viewer from the stream."""
        try:
            user = self.scope['user'] if self.scope['user'].is_authenticated else None
            session_id = self.scope.get('session', {}).get('session_key', '')
            
            # Update viewer record
            StreamViewer.objects.filter(
                stream_id=self.stream_id,
                user=user,
                session_id=session_id,
                left_at__isnull=True
            ).update(left_at=timezone.now())
            
            # Update stream's current viewer count
            stream = LiveStream.objects.get(id=self.stream_id)
            stream.current_viewers = max(0, stream.current_viewers - 1)
            stream.save(update_fields=['current_viewers'])
            
            return True
        except Exception as e:
            print(f"Error removing viewer: {e}")
            return False
    
    @database_sync_to_async
    def get_viewer_count(self):
        """Get current viewer count for the stream."""
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return stream.current_viewers
        except LiveStream.DoesNotExist:
            return 0
    
    @database_sync_to_async
    def get_stream_status(self):
        """Get current stream status."""
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return {
                'status': stream.status,
                'title': stream.title,
                'platform': stream.platform,
                'is_live': stream.is_live
            }
        except LiveStream.DoesNotExist:
            return {'status': 'not_found'}
    
    @database_sync_to_async
    def save_analytics_event(self, event_type, metadata):
        """Save analytics event to database."""
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            
            StreamAnalytics.objects.create(
                stream=stream,
                concurrent_viewers=stream.current_viewers,
                new_viewers=1 if event_type == 'viewer_joined' else 0,
                chat_messages=1 if event_type == 'chat_message' else 0,
                reactions=1 if event_type == 'reaction' else 0,
                shares=1 if event_type == 'share' else 0
            )
            
            return True
        except Exception as e:
            print(f"Error saving analytics: {e}")
            return False
    
    @database_sync_to_async
    def save_quality_data(self, quality, buffering_rate):
        """Save video quality data."""
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            
            StreamAnalytics.objects.create(
                stream=stream,
                concurrent_viewers=stream.current_viewers,
                stream_quality=quality,
                buffering_rate=buffering_rate
            )
            
            return True
        except Exception as e:
            print(f"Error saving quality data: {e}")
            return False