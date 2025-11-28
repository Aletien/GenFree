"""
CMS admin configuration for GenFree Network.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Page, BlogPost, Category, Tag, MediaFile, Menu, MenuItem, SiteSettings
)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    """Admin interface for pages."""
    
    list_display = [
        'title', 'status', 'is_featured', 'show_in_menu',
        'view_count', 'author', 'created_at'
    ]
    list_filter = ['status', 'is_featured', 'show_in_menu', 'template', 'created_at']
    search_fields = ['title', 'content', 'meta_title']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content', 'excerpt')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Display Options', {
            'fields': ('template', 'featured_image', 'status', 'is_featured')
        }),
        ('Navigation', {
            'fields': ('show_in_menu', 'menu_order', 'parent')
        }),
        ('Organization', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('author', 'view_count'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """Admin interface for blog posts."""
    
    list_display = [
        'title', 'category', 'status', 'is_featured',
        'view_count', 'like_count', 'author', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'category', 'allow_comments',
        'created_at', 'published_at'
    ]
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content', 'excerpt')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('featured_image', 'featured_video_url')
        }),
        ('Organization', {
            'fields': ('category', 'tags')
        }),
        ('Settings', {
            'fields': ('status', 'is_featured', 'allow_comments')
        }),
        ('Analytics', {
            'fields': ('view_count', 'like_count', 'share_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('author', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for categories."""
    
    list_display = [
        'name', 'parent', 'color_display', 'is_active',
        'show_in_menu', 'menu_order', 'post_count'
    ]
    list_filter = ['is_active', 'show_in_menu', 'parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 6px; border-radius: 3px; color: white;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'Color'
    
    def post_count(self, obj):
        return obj.blogpost_set.filter(status='published').count()
    post_count.short_description = 'Posts'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin interface for tags."""
    
    list_display = ['name', 'color_display', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 6px; border-radius: 3px; color: white;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'Color'


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    """Admin interface for media files."""
    
    list_display = [
        'title', 'file_type', 'file_size_display', 'dimensions',
        'uploaded_by', 'uploaded_at'
    ]
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['tags']
    readonly_fields = ['file_size', 'mime_type', 'width', 'height']
    
    def file_size_display(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"
    file_size_display.short_description = 'Size'
    
    def dimensions(self, obj):
        if obj.width and obj.height:
            return f"{obj.width} x {obj.height}"
        return "-"
    dimensions.short_description = 'Dimensions'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


class MenuItemInline(admin.TabularInline):
    """Inline admin for menu items."""
    model = MenuItem
    extra = 0
    fields = ['title', 'link_type', 'order', 'is_active']


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    """Admin interface for menus."""
    
    list_display = ['name', 'location', 'is_active', 'item_count', 'updated_at']
    list_filter = ['location', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MenuItemInline]
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """Admin interface for menu items."""
    
    list_display = [
        'title', 'menu', 'link_type', 'parent', 'order', 'is_active'
    ]
    list_filter = ['menu', 'link_type', 'is_active']
    search_fields = ['title', 'menu__name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('menu', 'title', 'parent', 'order', 'is_active')
        }),
        ('Link Configuration', {
            'fields': ('link_type', 'page', 'post', 'category', 'custom_url')
        }),
        ('Display Options', {
            'fields': ('css_classes', 'icon', 'open_in_new_tab'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """Admin interface for site settings."""
    
    def has_add_permission(self, request):
        # Prevent creating multiple instances
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of site settings
        return False
    
    fieldsets = (
        ('Site Identity', {
            'fields': ('site_title', 'tagline', 'description', 'logo', 'favicon')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Social Media', {
            'fields': (
                'facebook_url', 'twitter_url', 'instagram_url', 
                'youtube_url', 'linkedin_url'
            )
        }),
        ('SEO Settings', {
            'fields': (
                'default_meta_description', 'default_meta_keywords',
                'google_analytics_id', 'google_site_verification'
            ),
            'classes': ('collapse',)
        }),
        ('Features', {
            'fields': (
                'enable_comments', 'enable_newsletter', 'enable_donations',
                'enable_events', 'enable_livestream'
            )
        }),
        ('Maintenance', {
            'fields': ('maintenance_mode', 'maintenance_message'),
            'classes': ('collapse',)
        }),
    )