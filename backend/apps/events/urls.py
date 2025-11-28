"""
Events URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, EventCategoryViewSet, SpeakerViewSet, EventRegistrationViewSet
)

# Create router for ViewSets
router = DefaultRouter()
router.register('events', EventViewSet, basename='event')
router.register('categories', EventCategoryViewSet, basename='event-category')
router.register('speakers', SpeakerViewSet, basename='speaker')
router.register('registrations', EventRegistrationViewSet, basename='event-registration')

app_name = 'events'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]