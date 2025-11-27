"""
Authentication URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileViewSet,
    PasswordResetView,
    UserStatsView,
)

# Create router for ViewSets
router = DefaultRouter()
router.register('profile', UserProfileViewSet, basename='user-profile')

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password management
    path('password/reset/', PasswordResetView.as_view(), name='password-reset'),
    
    # User profile endpoints
    path('', include(router.urls)),
    
    # User statistics
    path('stats/', UserStatsView.as_view(), name='user-stats'),
]