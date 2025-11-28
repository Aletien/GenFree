"""
Chat system URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, ChatMessageViewSet, MessageReportViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register('rooms', ChatRoomViewSet, basename='chatroom')
router.register('messages', ChatMessageViewSet, basename='chatmessage')
router.register('reports', MessageReportViewSet, basename='messagereport')

app_name = 'chat'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]