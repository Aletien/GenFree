"""
ASGI routing configuration for GenFree Network.
Handles both HTTP and WebSocket connections.
"""

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path

# Import WebSocket routing from apps
websocket_urlpatterns = [
    # Chat WebSocket routes
    path('ws/chat/<str:room_slug>/', 'apps.chat.consumers.ChatConsumer'.as_asgi()),
    
    # LiveStream WebSocket routes  
    path('ws/stream/<str:stream_id>/', 'apps.livestream.consumers.LiveStreamConsumer'.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})