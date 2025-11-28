"""
Live streaming URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LiveStreamViewSet, StreamAnalyticsViewSet, StreamViewerViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register('streams', LiveStreamViewSet, basename='livestream')
router.register('analytics', StreamAnalyticsViewSet, basename='stream-analytics')
router.register('viewers', StreamViewerViewSet, basename='stream-viewers')

app_name = 'livestream'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]