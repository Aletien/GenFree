"""
Donations URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonationCampaignViewSet, DonationViewSet, RecurringDonationViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register('campaigns', DonationCampaignViewSet, basename='donation-campaign')
router.register('donations', DonationViewSet, basename='donation')
router.register('recurring', RecurringDonationViewSet, basename='recurring-donation')

app_name = 'donations'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]