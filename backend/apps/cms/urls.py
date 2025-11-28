"""
CMS URLs for GenFree Network.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PageViewSet, BlogPostViewSet, CategoryViewSet, TagViewSet,
    MediaFileViewSet, MenuViewSet, site_info, search
)

# Create router for ViewSets
router = DefaultRouter()
router.register('pages', PageViewSet, basename='page')
router.register('posts', BlogPostViewSet, basename='blogpost')
router.register('categories', CategoryViewSet, basename='category')
router.register('tags', TagViewSet, basename='tag')
router.register('media', MediaFileViewSet, basename='mediafile')
router.register('menus', MenuViewSet, basename='menu')

app_name = 'cms'

urlpatterns = [
    # Site info endpoint
    path('site-info/', site_info, name='site-info'),
    
    # Search endpoint
    path('search/', search, name='search'),
    
    # Include router URLs
    path('', include(router.urls)),
]