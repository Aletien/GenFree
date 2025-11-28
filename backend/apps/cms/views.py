"""
CMS views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import (
    Page, BlogPost, Category, Tag, MediaFile, Menu, MenuItem, SiteSettings
)
from .serializers import (
    PageSerializer, PageListSerializer, BlogPostSerializer, BlogPostListSerializer,
    CategorySerializer, TagSerializer, MediaFileSerializer, MenuSerializer,
    SiteSettingsSerializer, SiteInfoSerializer
)


class PageViewSet(viewsets.ModelViewSet):
    """ViewSet for CMS pages."""
    
    queryset = Page.objects.filter(status='published')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PageListSerializer
        return PageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(excerpt__icontains=search)
            )
        
        return queryset.select_related('author').prefetch_related('tags')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a page and increment view count."""
        page = self.get_object()
        page.view_count += 1
        page.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(page)
        return Response(serializer.data)


class BlogPostViewSet(viewsets.ModelViewSet):
    """ViewSet for blog posts."""
    
    queryset = BlogPost.objects.filter(status='published')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(excerpt__icontains=search)
            )
        
        return queryset.select_related('author', 'category').prefetch_related('tags')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a blog post and increment view count."""
        post = self.get_object()
        post.view_count += 1
        post.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        """Like a blog post."""
        post = self.get_object()
        post.like_count += 1
        post.save(update_fields=['like_count'])
        
        return Response({'like_count': post.like_count})
    
    @action(detail=True, methods=['post'])
    def share(self, request, slug=None):
        """Track blog post share."""
        post = self.get_object()
        post.share_count += 1
        post.save(update_fields=['share_count'])
        
        return Response({'share_count': post.share_count})


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for categories."""
    
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Only show parent categories for list view
        if self.action == 'list':
            show_all = self.request.query_params.get('show_all', 'false')
            if show_all.lower() != 'true':
                queryset = queryset.filter(parent__isnull=True)
        
        return queryset.order_by('menu_order', 'name')


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for tags."""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search tags
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('name')


class MediaFileViewSet(viewsets.ModelViewSet):
    """ViewSet for media files."""
    
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by file type
        file_type = self.request.query_params.get('file_type')
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('uploaded_by').prefetch_related('tags')
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class MenuViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for menus."""
    
    queryset = Menu.objects.filter(is_active=True)
    serializer_class = MenuSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get menu by location."""
        location = request.query_params.get('location', 'main')
        
        try:
            menu = Menu.objects.get(location=location, is_active=True)
            serializer = self.get_serializer(menu)
            return Response(serializer.data)
        except Menu.DoesNotExist:
            return Response(
                {'error': f'No menu found for location: {location}'}, 
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def site_info(request):
    """Get site information and settings."""
    try:
        settings = SiteSettings.objects.first()
        if not settings:
            # Create default settings if none exist
            settings = SiteSettings.objects.create(
                site_title='GenFree Network',
                tagline='Transforming Lives Through Faith',
                description='Welcome to GenFree Network - a community of believers committed to spreading the Gospel and transforming lives through faith, hope, and love.',
            )
        
        # Get main menu
        main_menu = None
        try:
            main_menu_obj = Menu.objects.get(location='main', is_active=True)
            main_menu = MenuSerializer(main_menu_obj).data
        except Menu.DoesNotExist:
            pass
        
        # Get footer menu
        footer_menu = None
        try:
            footer_menu_obj = Menu.objects.get(location='footer', is_active=True)
            footer_menu = MenuSerializer(footer_menu_obj).data
        except Menu.DoesNotExist:
            pass
        
        data = {
            'site_title': settings.site_title,
            'tagline': settings.tagline,
            'description': settings.description,
            'logo': settings.logo.url if settings.logo else None,
            'email': settings.email,
            'phone': settings.phone,
            'facebook_url': settings.facebook_url,
            'twitter_url': settings.twitter_url,
            'instagram_url': settings.instagram_url,
            'youtube_url': settings.youtube_url,
            'features': {
                'comments': settings.enable_comments,
                'newsletter': settings.enable_newsletter,
                'donations': settings.enable_donations,
                'events': settings.enable_events,
                'livestream': settings.enable_livestream,
            },
            'main_menu': main_menu,
            'footer_menu': footer_menu
        }
        
        serializer = SiteInfoSerializer(data)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """Search across pages and blog posts."""
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Search pages
    pages = Page.objects.filter(
        status='published'
    ).filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(excerpt__icontains=query)
    ).select_related('author')[:10]
    
    # Search blog posts
    posts = BlogPost.objects.filter(
        status='published'
    ).filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(excerpt__icontains=query)
    ).select_related('author', 'category')[:10]
    
    data = {
        'query': query,
        'pages': PageListSerializer(pages, many=True).data,
        'posts': BlogPostListSerializer(posts, many=True).data,
        'total_results': len(pages) + len(posts)
    }
    
    return Response(data)