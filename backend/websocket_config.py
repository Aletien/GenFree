"""
WebSocket Configuration for GenFree Network.
Real-time features for chat and live streaming.
"""

# Add to genfree_backend/routing.py
ROUTING_CONFIG = """
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
import apps.chat.routing
import apps.livestream.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                *apps.chat.routing.websocket_urlpatterns,
                *apps.livestream.routing.websocket_urlpatterns,
            ])
        )
    ),
})
"""

# Chat WebSocket Consumer
CHAT_CONSUMER = """
# apps/chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage
from .serializers import ChatMessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
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
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    async def handle_chat_message(self, data):
        content = data['content']
        user = self.scope['user']
        
        # Save message to database
        message = await self.save_message(content, user)
        
        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': message
                }
            )
    
    async def handle_typing(self, data):
        # Broadcast typing indicator
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_broadcast',
                'user': data.get('user', 'Anonymous'),
                'typing': data.get('typing', False)
            }
        )
    
    async def handle_reaction(self, data):
        # Handle message reactions
        message_id = data.get('message_id')
        reaction = data.get('reaction')
        
        if message_id and reaction:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reaction_broadcast',
                    'message_id': message_id,
                    'reaction': reaction,
                    'user': str(self.scope['user']) if self.scope['user'].is_authenticated else 'Anonymous'
                }
            )
    
    # Message handlers
    async def chat_message_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def typing_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'typing': event['typing']
        }))
    
    async def reaction_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'message_id': event['message_id'],
            'reaction': event['reaction'],
            'user': event['user']
        }))
    
    async def user_count_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_count',
            'count': event['count']
        }))
    
    @database_sync_to_async
    def save_message(self, content, user):
        try:
            room = ChatRoom.objects.get(slug=self.room_slug)
            message = ChatMessage.objects.create(
                room=room,
                user=user if user.is_authenticated else None,
                content=content,
                anonymous_name=user.username if not user.is_authenticated else None
            )
            return ChatMessageSerializer(message).data
        except Exception as e:
            return None
    
    @database_sync_to_async 
    def get_room_user_count(self):
        # This would need to be implemented with Redis or similar
        # For now, return a placeholder
        return 1
"""

# Chat WebSocket Routing
CHAT_ROUTING = """
# apps/chat/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<str:room_slug>/', consumers.ChatConsumer.as_asgi()),
]
"""

# Livestream WebSocket Consumer
LIVESTREAM_CONSUMER = """
# apps/livestream/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import LiveStream, StreamViewer

class LiveStreamConsumer(AsyncWebsocketConsumer):
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
        
        # Send current viewer count
        viewer_count = await self.get_viewer_count()
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
                
        except json.JSONDecodeError:
            pass
    
    async def handle_analytics(self, data):
        # Handle analytics events from viewer
        await self.save_analytics(data)
    
    # Message handlers
    async def viewer_count_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'viewer_count',
            'count': event['count']
        }))
    
    async def stream_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'stream_status',
            'status': event['status']
        }))
    
    @database_sync_to_async
    def add_viewer(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            user = self.scope['user'] if self.scope['user'].is_authenticated else None
            session_id = self.scope.get('session', {}).get('session_key', '')
            
            StreamViewer.objects.get_or_create(
                stream=stream,
                user=user,
                session_id=session_id,
                defaults={'country': '', 'city': ''}
            )
            return True
        except Exception:
            return False
    
    @database_sync_to_async
    def remove_viewer(self):
        try:
            user = self.scope['user'] if self.scope['user'].is_authenticated else None
            session_id = self.scope.get('session', {}).get('session_key', '')
            
            StreamViewer.objects.filter(
                stream_id=self.stream_id,
                user=user,
                session_id=session_id
            ).update(left_at=timezone.now())
            return True
        except Exception:
            return False
    
    @database_sync_to_async
    def get_viewer_count(self):
        return StreamViewer.objects.filter(
            stream_id=self.stream_id,
            left_at__isnull=True
        ).count()
    
    @database_sync_to_async
    def save_analytics(self, data):
        # Save analytics data
        pass
"""

# Livestream WebSocket Routing
LIVESTREAM_ROUTING = """
# apps/livestream/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/stream/<str:stream_id>/', consumers.LiveStreamConsumer.as_asgi()),
]
"""

def setup_websockets():
    """Instructions for setting up WebSockets."""
    
    print("🔌 WebSocket Configuration Setup")
    print("=" * 40)
    
    steps = [
        "1. Install channels: pip install channels channels-redis",
        "2. Add 'channels' to INSTALLED_APPS in settings",
        "3. Set ASGI_APPLICATION in settings",
        "4. Create routing.py files in chat and livestream apps",
        "5. Create consumers.py files with the code above",
        "6. Update main genfree_backend/routing.py",
        "7. Configure Redis for channel layers (production)",
        "8. Update frontend to connect to WebSocket endpoints"
    ]
    
    for step in steps:
        print(f"   {step}")
    
    print("\n📁 Files to create:")
    files = [
        "backend/genfree_backend/routing.py",
        "backend/apps/chat/consumers.py", 
        "backend/apps/chat/routing.py",
        "backend/apps/livestream/consumers.py",
        "backend/apps/livestream/routing.py"
    ]
    
    for file in files:
        print(f"   {file}")
    
    return {
        'routing_config': ROUTING_CONFIG,
        'chat_consumer': CHAT_CONSUMER,
        'chat_routing': CHAT_ROUTING,
        'livestream_consumer': LIVESTREAM_CONSUMER,
        'livestream_routing': LIVESTREAM_ROUTING
    }

if __name__ == "__main__":
    config = setup_websockets()
    print("\n✅ WebSocket configuration ready!")