"""
Authentication admin configuration for GenFree Network.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, LoginAttempt, UserSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin for User model.
    """
    list_display = (
        'email', 'username', 'first_name', 'last_name', 
        'is_minister', 'is_volunteer', 'is_active', 
        'total_donations', 'events_attended', 'date_joined'
    )
    list_filter = (
        'is_active', 'is_staff', 'is_superuser', 'is_minister', 
        'is_volunteer', 'email_notifications', 'newsletter_subscription',
        'date_joined', 'last_login'
    )
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': (
                'first_name', 'last_name', 'email', 'phone_number',
                'date_of_birth', 'profile_picture', 'bio'
            )
        }),
        (_('Ministry info'), {
            'fields': (
                'is_minister', 'is_volunteer', 'ministry_role'
            )
        }),
        (_('Engagement'), {
            'fields': (
                'total_donations', 'events_attended', 'last_activity'
            ),
            'classes': ('collapse',)
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 
                'groups', 'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        (_('Communication preferences'), {
            'fields': (
                'email_notifications', 'sms_notifications', 'newsletter_subscription'
            )
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name', 'last_name',
                'password1', 'password2', 'is_minister', 'is_volunteer'
            ),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined', 'created_at', 'updated_at', 'last_activity')
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('profile')


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Extended Profile'
    
    fieldsets = (
        (_('Personal Information'), {
            'fields': (
                'gender', 'marital_status', 'occupation',
                'address', 'city', 'country'
            )
        }),
        (_('Emergency Contact'), {
            'fields': (
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            ),
            'classes': ('collapse',)
        }),
        (_('Ministry Information'), {
            'fields': (
                'baptized', 'baptism_date', 'member_since',
                'spiritual_gifts', 'ministry_interests'
            )
        }),
        (_('Social Media'), {
            'fields': (
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url'
            ),
            'classes': ('collapse',)
        }),
    )


# Add the inline to UserAdmin
UserAdmin.inlines = [UserProfileInline]


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """
    Admin for LoginAttempt model.
    """
    list_display = ('email', 'user', 'success', 'ip_address', 'timestamp')
    list_filter = ('success', 'timestamp')
    search_fields = ('email', 'user__email', 'user__username', 'ip_address')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)
    
    def has_add_permission(self, request):
        """Disable manual addition of login attempts."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable modification of login attempts."""
        return False


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    Admin for UserSession model.
    """
    list_display = (
        'user', 'device_type', 'ip_address', 
        'is_active', 'started_at', 'duration'
    )
    list_filter = ('device_type', 'started_at', 'ended_at')
    search_fields = ('user__email', 'user__username', 'ip_address', 'session_key')
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'last_activity', 'duration')
    
    def is_active(self, obj):
        """Display session active status."""
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active'
    
    def duration(self, obj):
        """Display session duration."""
        return obj.duration or 'Active'
    duration.short_description = 'Duration'
    
    def has_add_permission(self, request):
        """Disable manual addition of sessions."""
        return False


# Customize admin site
admin.site.site_header = "GenFree Network Administration"
admin.site.site_title = "GenFree Admin Portal"
admin.site.index_title = "Welcome to GenFree Network Administration"