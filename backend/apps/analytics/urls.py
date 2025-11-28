"""
Analytics URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnalyticsEventViewSet, UserSessionViewSet, ConversionGoalViewSet,
    AnalyticsReportViewSet, track_event, track_page_view
)

# Create router for ViewSets
router = DefaultRouter()
router.register('events', AnalyticsEventViewSet, basename='analytics-event')
router.register('sessions', UserSessionViewSet, basename='user-session')
router.register('goals', ConversionGoalViewSet, basename='conversion-goal')
router.register('reports', AnalyticsReportViewSet, basename='analytics-report')

app_name = 'analytics'

urlpatterns = [
    # Event tracking endpoints
    path('track/event/', track_event, name='track-event'),
    path('track/pageview/', track_page_view, name='track-pageview'),
    
    # Include router URLs
    path('', include(router.urls)),
]