"""
Chat WebSocket consumers for real-time messaging.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatRoom, ChatMessage
from .serializers import ChatMessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for chat functionality."""
    
    async def connect(self):
        self.room_slug = self.scope['url_route']['kwargs']['room_slug']
        self.room_group_name = f'chat_{self.room_slug}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send current user count
        user_count = await self.get_room_user_count()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_count_update',
                'count': user_count
            }
        )
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Update user count
        user_count = await self.get_room_user_count()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_count_update',
                'count': user_count
            }
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'chat_message')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'typing':
                await self.handle_typing(text_data_json)
            elif message_type == 'reaction':
                await self.handle_reaction(text_data_json)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def handle_chat_message(self, data):
        """Handle incoming chat messages."""
        content = data.get('content', '').strip()
        user = self.scope['user']
        
        if not content:
            return
        
        # Save message to database
        message_data = await self.save_message(content, user)
        
        if message_data:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': message_data
                }
            )
    
    async def handle_typing(self, data):
        """Handle typing indicators."""
        user = self.scope['user']
        username = user.username if user.is_authenticated else 'Anonymous'
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_broadcast',
                'user': username,
                'typing': data.get('typing', False)
            }
        )
    
    async def handle_reaction(self, data):
        """Handle message reactions."""
        message_id = data.get('message_id')
        reaction = data.get('reaction')
        user = self.scope['user']
        
        if message_id and reaction:
            # Update message likes in database
            await self.add_reaction(message_id, reaction)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reaction_broadcast',
                    'message_id': message_id,
                    'reaction': reaction,
                    'user': user.username if user.is_authenticated else 'Anonymous'
                }
            )
    
    # Message broadcast handlers
    async def chat_message_broadcast(self, event):
        """Send chat message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def typing_broadcast(self, event):
        """Send typing indicator to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'typing': event['typing']
        }))
    
    async def reaction_broadcast(self, event):
        """Send reaction to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'message_id': event['message_id'],
            'reaction': event['reaction'],
            'user': event['user']
        }))
    
    async def user_count_update(self, event):
        """Send user count update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'user_count',
            'count': event['count']
        }))
    
    async def system_message(self, event):
        """Send system message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'message': event['message']
        }))
    
    # Database operations
    @database_sync_to_async
    def save_message(self, content, user):
        """Save chat message to database."""
        try:
            room = ChatRoom.objects.get(slug=self.room_slug)
            
            # Create message
            message = ChatMessage.objects.create(
                room=room,
                user=user if user.is_authenticated else None,
                content=content,
                anonymous_name=user.username if not user.is_authenticated else None,
                session_id=self.scope.get('session', {}).get('session_key', '')
            )
            
            # Serialize message data
            serializer = ChatMessageSerializer(message)
            return serializer.data
            
        except ChatRoom.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    @database_sync_to_async
    def add_reaction(self, message_id, reaction):
        """Add reaction to a message."""
        try:
            message = ChatMessage.objects.get(id=message_id)
            if reaction == 'like':
                message.likes += 1
                message.save(update_fields=['likes'])
            return True
        except ChatMessage.DoesNotExist:
            return False
    
    @database_sync_to_async 
    def get_room_user_count(self):
        """Get approximate user count for the room."""
        # In production, this would use Redis to track active connections
        # For now, return a placeholder based on recent activity
        try:
            recent_time = timezone.now() - timezone.timedelta(minutes=5)
            count = ChatMessage.objects.filter(
                room__slug=self.room_slug,
                created_at__gte=recent_time
            ).values('user', 'session_id').distinct().count()
            return max(count, 1)  # At least 1 (current user)
        except:
            return 1