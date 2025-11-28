"""
CMS models for GenFree Network.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from ckeditor.fields import RichTextField
import uuid


class Page(models.Model):
    """Model for CMS pages."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    TEMPLATE_CHOICES = [
        ('default', 'Default Template'),
        ('landing', 'Landing Page'),
        ('about', 'About Page'),
        ('contact', 'Contact Page'),
        ('custom', 'Custom Template'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = RichTextField(blank=True)
    excerpt = models.TextField(blank=True, max_length=500)
    
    # SEO fields
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    
    # Template and layout
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='default')
    featured_image = models.ImageField(upload_to='cms/pages/', blank=True)
    
    # Status and publishing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    show_in_menu = models.BooleanField(default=True)
    menu_order = models.IntegerField(default=0)
    
    # Content organization
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    tags = models.ManyToManyField('Tag', blank=True)
    
    # Metadata
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics
    view_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['menu_order', 'title']
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.meta_title:
            self.meta_title = self.title
        super().save(*args, **kwargs)
    
    @property
    def is_published(self):
        return self.status == 'published'


class BlogPost(models.Model):
    """Model for blog posts."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = RichTextField()
    excerpt = models.TextField(max_length=500)
    
    # SEO fields
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    
    # Media
    featured_image = models.ImageField(upload_to='cms/blog/', blank=True)
    featured_video_url = models.URLField(blank=True)
    
    # Content organization
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    
    # Status and publishing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    allow_comments = models.BooleanField(default=True)
    
    # Metadata
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    share_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.meta_title:
            self.meta_title = self.title
        super().save(*args, **kwargs)


class Category(models.Model):
    """Model for content categories."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007cba', help_text='Hex color code')
    icon = models.CharField(max_length=50, blank=True, help_text='CSS icon class')
    
    # Hierarchy
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    # SEO
    meta_description = models.TextField(max_length=160, blank=True)
    
    # Display options
    is_active = models.BooleanField(default=True)
    show_in_menu = models.BooleanField(default=True)
    menu_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['menu_order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    """Model for content tags."""
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, max_length=200)
    color = models.CharField(max_length=7, default='#6c757d', help_text='Hex color code')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class MediaFile(models.Model):
    """Model for media files."""
    
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='cms/media/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    file_size = models.IntegerField()  # in bytes
    mime_type = models.CharField(max_length=100)
    
    # Image specific fields
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    
    # SEO
    alt_text = models.CharField(max_length=200, blank=True)
    caption = models.TextField(blank=True, max_length=500)
    
    # Organization
    tags = models.ManyToManyField(Tag, blank=True)
    
    # Metadata
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Media File'
        verbose_name_plural = 'Media Files'
    
    def __str__(self):
        return self.title


class Menu(models.Model):
    """Model for navigation menus."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=50, default='main', help_text='Menu location identifier')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Menu'
        verbose_name_plural = 'Menus'
    
    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Model for menu items."""
    
    LINK_TYPE_CHOICES = [
        ('page', 'Page'),
        ('post', 'Blog Post'),
        ('category', 'Category'),
        ('url', 'Custom URL'),
        ('external', 'External Link'),
    ]
    
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    
    # Link configuration
    link_type = models.CharField(max_length=20, choices=LINK_TYPE_CHOICES)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, null=True, blank=True)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    custom_url = models.URLField(blank=True)
    
    # Display options
    css_classes = models.CharField(max_length=100, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    open_in_new_tab = models.BooleanField(default=False)
    
    # Hierarchy
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.IntegerField(default=0)
    
    # Visibility
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'
    
    def __str__(self):
        return f"{self.menu.name} - {self.title}"
    
    @property
    def url(self):
        """Get the URL for this menu item."""
        if self.link_type == 'page' and self.page:
            return f"/{self.page.slug}/"
        elif self.link_type == 'post' and self.post:
            return f"/blog/{self.post.slug}/"
        elif self.link_type == 'category' and self.category:
            return f"/category/{self.category.slug}/"
        elif self.link_type in ['url', 'external']:
            return self.custom_url
        return '#'


class SiteSettings(models.Model):
    """Model for site-wide settings."""
    
    # Site identity
    site_title = models.CharField(max_length=200, default='GenFree Network')
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='cms/site/', blank=True)
    favicon = models.ImageField(upload_to='cms/site/', blank=True)
    
    # Contact information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Social media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    # SEO defaults
    default_meta_description = models.TextField(max_length=160, blank=True)
    default_meta_keywords = models.CharField(max_length=200, blank=True)
    google_analytics_id = models.CharField(max_length=20, blank=True)
    google_site_verification = models.CharField(max_length=100, blank=True)
    
    # Features
    enable_comments = models.BooleanField(default=True)
    enable_newsletter = models.BooleanField(default=True)
    enable_donations = models.BooleanField(default=True)
    enable_events = models.BooleanField(default=True)
    enable_livestream = models.BooleanField(default=True)
    
    # Maintenance
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
    
    def __str__(self):
        return self.site_title
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SiteSettings.objects.exists():
            raise ValueError('Only one SiteSettings instance is allowed')
        super().save(*args, **kwargs)