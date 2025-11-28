"""
CMS serializers for GenFree Network.
"""

from rest_framework import serializers
from .models import (
    Page, BlogPost, Category, Tag, MediaFile, Menu, MenuItem, SiteSettings
)


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'color']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories."""
    
    children = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'is_active', 'show_in_menu', 'menu_order', 'children', 'post_count'
        ]
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []
    
    def get_post_count(self, obj):
        return obj.blogpost_set.filter(status='published').count()


class PageSerializer(serializers.ModelSerializer):
    """Serializer for pages."""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'meta_title',
            'meta_description', 'template', 'featured_image', 'status',
            'is_featured', 'show_in_menu', 'menu_order', 'author_name',
            'tags', 'children', 'view_count', 'created_at', 'updated_at',
            'published_at'
        ]
    
    def get_children(self, obj):
        if obj.children.exists():
            return PageSerializer(
                obj.children.filter(status='published'), 
                many=True, 
                context=self.context
            ).data
        return []


class PageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for page lists."""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'is_featured', 'author_name', 'view_count', 'created_at',
            'published_at'
        ]


class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer for blog posts."""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'meta_title',
            'meta_description', 'featured_image', 'featured_video_url',
            'category', 'tags', 'status', 'is_featured', 'allow_comments',
            'author_name', 'view_count', 'like_count', 'share_count',
            'created_at', 'updated_at', 'published_at'
        ]


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog post lists."""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'category_name', 'is_featured', 'author_name', 'view_count',
            'like_count', 'created_at', 'published_at'
        ]


class MediaFileSerializer(serializers.ModelSerializer):
    """Serializer for media files."""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = MediaFile
        fields = [
            'id', 'title', 'description', 'file', 'file_type',
            'file_size', 'mime_type', 'width', 'height', 'alt_text',
            'caption', 'tags', 'uploaded_by_name', 'uploaded_at'
        ]


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for menu items."""
    
    children = serializers.SerializerMethodField()
    url = serializers.ReadOnlyField()
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'title', 'link_type', 'url', 'css_classes', 'icon',
            'open_in_new_tab', 'order', 'is_active', 'children'
        ]
    
    def get_children(self, obj):
        if obj.children.exists():
            return MenuItemSerializer(
                obj.children.filter(is_active=True).order_by('order'),
                many=True,
                context=self.context
            ).data
        return []


class MenuSerializer(serializers.ModelSerializer):
    """Serializer for menus."""
    
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Menu
        fields = ['id', 'name', 'slug', 'location', 'is_active', 'items']
    
    def get_items(self, obj):
        root_items = obj.items.filter(parent__isnull=True, is_active=True).order_by('order')
        return MenuItemSerializer(root_items, many=True, context=self.context).data


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Serializer for site settings."""
    
    class Meta:
        model = SiteSettings
        fields = [
            'site_title', 'tagline', 'description', 'logo', 'favicon',
            'email', 'phone', 'address', 'facebook_url', 'twitter_url',
            'instagram_url', 'youtube_url', 'linkedin_url',
            'default_meta_description', 'enable_comments', 'enable_newsletter',
            'enable_donations', 'enable_events', 'enable_livestream'
        ]


class SiteInfoSerializer(serializers.Serializer):
    """Serializer for public site information."""
    
    site_title = serializers.CharField()
    tagline = serializers.CharField()
    description = serializers.CharField()
    logo = serializers.ImageField()
    
    # Contact info
    email = serializers.EmailField()
    phone = serializers.CharField()
    
    # Social media
    facebook_url = serializers.URLField()
    twitter_url = serializers.URLField()
    instagram_url = serializers.URLField()
    youtube_url = serializers.URLField()
    
    # Features
    features = serializers.DictField()
    
    # Navigation
    main_menu = MenuSerializer()
    footer_menu = MenuSerializer()