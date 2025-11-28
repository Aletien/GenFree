"""
LiveStream WebSocket URL routing.
"""

from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/stream/<str:stream_id>/', consumers.LiveStreamConsumer.as_asgi()),
]