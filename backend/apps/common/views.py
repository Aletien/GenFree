"""
Common views for GenFree Network.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
import platform
import sys


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring."""
    return Response({
        'status': 'healthy',
        'service': 'GenFree Network API',
        'version': '1.0.0',
        'python_version': sys.version,
        'platform': platform.platform(),
        'debug': settings.DEBUG
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """API information endpoint."""
    return Response({
        'name': 'GenFree Network API',
        'version': '1.0.0',
        'description': 'Backend API for GenFree Network - A comprehensive platform for church management, live streaming, donations, and community engagement.',
        'endpoints': {
            'authentication': '/api/auth/',
            'events': '/api/events/',
            'donations': '/api/donations/',
            'livestream': '/api/livestream/',
            'chat': '/api/chat/',
            'analytics': '/api/analytics/',
            'cms': '/api/cms/',
            'health': '/health/'
        },
        'documentation': {
            'swagger': '/api/schema/swagger-ui/',
            'redoc': '/api/schema/redoc/'
        }
    })