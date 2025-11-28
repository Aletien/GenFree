"""
Chat system admin configuration for GenFree Network.
"""

from django.contrib import admin
from .models import ChatRoom, ChatMessage, ChatUserActivity, MessageReport


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    """Admin interface for chat rooms."""
    
    list_display = [
        'name', 'room_type', 'is_active', 'is_moderated',
        'allow_anonymous', 'created_by', 'created_at'
    ]
    list_filter = ['room_type', 'is_active', 'is_moderated', 'allow_anonymous', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['moderators']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'room_type', 'description')
        }),
        ('Linked Objects', {
            'fields': ('livestream', 'event'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('is_active', 'is_moderated', 'allow_anonymous', 'max_message_length')
        }),
        ('Moderation', {
            'fields': ('banned_words', 'moderators'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin interface for chat messages."""
    
    list_display = [
        'sender_name', 'room', 'message_type', 'content_preview',
        'is_approved', 'likes', 'reports', 'created_at'
    ]
    list_filter = [
        'message_type', 'is_approved', 'is_moderated', 'room',
        'created_at'
    ]
    search_fields = ['content', 'user__username', 'anonymous_name']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    fieldsets = (
        ('Message Information', {
            'fields': ('room', 'user', 'anonymous_name', 'session_id')
        }),
        ('Content', {
            'fields': ('message_type', 'content', 'emoji_reaction')
        }),
        ('Moderation', {
            'fields': ('is_approved', 'is_moderated', 'moderated_by', 'moderation_reason')
        }),
        ('Engagement', {
            'fields': ('likes', 'reports'),
            'classes': ('collapse',)
        }),
        ('Technical', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_messages', 'moderate_messages']
    
    def approve_messages(self, request, queryset):
        queryset.update(is_approved=True)
    approve_messages.short_description = "Approve selected messages"
    
    def moderate_messages(self, request, queryset):
        queryset.update(is_approved=False, is_moderated=True, moderated_by=request.user)
    moderate_messages.short_description = "Moderate selected messages"


@admin.register(ChatUserActivity)
class ChatUserActivityAdmin(admin.ModelAdmin):
    """Admin interface for chat user activity."""
    
    list_display = [
        'user', 'room', 'activity_type', 'timestamp'
    ]
    list_filter = ['activity_type', 'room', 'timestamp']
    search_fields = ['user__username', 'room__name']
    readonly_fields = ['timestamp']


@admin.register(MessageReport)
class MessageReportAdmin(admin.ModelAdmin):
    """Admin interface for message reports."""
    
    list_display = [
        'message_preview', 'reason', 'reported_by', 'is_resolved',
        'created_at', 'resolved_at'
    ]
    list_filter = ['reason', 'is_resolved', 'created_at']
    search_fields = ['message__content', 'reported_by__username']
    readonly_fields = ['created_at', 'resolved_at']
    
    def message_preview(self, obj):
        return obj.message.content[:50] + '...' if len(obj.message.content) > 50 else obj.message.content
    message_preview.short_description = 'Message'
    
    fieldsets = (
        ('Report Information', {
            'fields': ('message', 'reported_by', 'session_id', 'reason', 'description')
        }),
        ('Resolution', {
            'fields': ('is_resolved', 'resolved_by', 'resolution_note', 'resolved_at')
        }),
    )
    
    actions = ['resolve_reports']
    
    def resolve_reports(self, request, queryset):
        queryset.update(is_resolved=True, resolved_by=request.user)
    resolve_reports.short_description = "Resolve selected reports"