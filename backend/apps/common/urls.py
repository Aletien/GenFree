"""
Common URLs for GenFree Network.
"""

from django.urls import path
from .views import health_check, api_info

app_name = 'common'

urlpatterns = [
    path('', health_check, name='health-check'),
    path('info/', api_info, name='api-info'),
]