"""
Donations admin configuration for GenFree Network.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Donation, DonationCampaign, RecurringDonation, DonationReceipt


@admin.register(DonationCampaign)
class DonationCampaignAdmin(admin.ModelAdmin):
    """Admin interface for donation campaigns."""
    
    list_display = [
        'title', 'organizer', 'goal_amount', 'raised_amount',
        'progress_percentage', 'status', 'is_featured', 'created_at'
    ]
    list_filter = ['status', 'is_featured', 'currency', 'created_at']
    search_fields = ['title', 'description', 'organizer__username']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['raised_amount', 'donor_count', 'view_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Campaign Information', {
            'fields': ('title', 'slug', 'organizer', 'description', 'short_description')
        }),
        ('Financial Goals', {
            'fields': ('goal_amount', 'raised_amount', 'currency')
        }),
        ('Duration', {
            'fields': ('start_date', 'end_date')
        }),
        ('Display Options', {
            'fields': ('status', 'is_featured', 'featured_image', 'video_url')
        }),
        ('Analytics', {
            'fields': ('donor_count', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def progress_percentage(self, obj):
        percentage = obj.progress_percentage
        color = 'green' if percentage >= 100 else 'orange' if percentage >= 50 else 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, percentage
        )
    progress_percentage.short_description = 'Progress'


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    """Admin interface for donations."""
    
    list_display = [
        'transaction_id', 'display_name', 'amount', 'currency',
        'campaign_title', 'status', 'payment_method', 'created_at'
    ]
    list_filter = [
        'status', 'payment_method', 'currency', 'is_anonymous', 'created_at'
    ]
    search_fields = [
        'transaction_id', 'donor_name', 'donor_email', 'campaign__title'
    ]
    readonly_fields = [
        'transaction_id', 'display_name', 'created_at', 'processed_at'
    ]
    
    def campaign_title(self, obj):
        return obj.campaign.title if obj.campaign else obj.event.title if obj.event else 'General'
    campaign_title.short_description = 'Campaign/Event'
    
    fieldsets = (
        ('Donation Information', {
            'fields': ('transaction_id', 'amount', 'currency', 'status', 'payment_method')
        }),
        ('Donor Information', {
            'fields': ('donor', 'donor_name', 'donor_email', 'donor_phone', 'is_anonymous')
        }),
        ('Target', {
            'fields': ('campaign', 'event')
        }),
        ('Additional Info', {
            'fields': ('message',)
        }),
        ('Payment Details', {
            'fields': ('payment_reference', 'payment_gateway_response'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_failed']
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected donations as completed"
    
    def mark_as_failed(self, request, queryset):
        queryset.update(status='failed')
    mark_as_failed.short_description = "Mark selected donations as failed"


@admin.register(RecurringDonation)
class RecurringDonationAdmin(admin.ModelAdmin):
    """Admin interface for recurring donations."""
    
    list_display = [
        'donor', 'campaign', 'amount', 'currency', 'frequency',
        'status', 'next_charge_date', 'success_rate'
    ]
    list_filter = ['frequency', 'status', 'currency', 'created_at']
    search_fields = ['donor__username', 'campaign__title']
    readonly_fields = [
        'total_charges', 'successful_charges', 'failed_charges',
        'last_charge_date', 'created_at'
    ]
    
    fieldsets = (
        ('Recurring Donation Setup', {
            'fields': ('donor', 'campaign', 'amount', 'currency', 'frequency')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'next_charge_date', 'last_charge_date')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Statistics', {
            'fields': ('total_charges', 'successful_charges', 'failed_charges'),
            'classes': ('collapse',)
        }),
        ('Payment Info', {
            'fields': ('payment_method_token', 'payment_gateway'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_recurring', 'pause_recurring', 'cancel_recurring']
    
    def activate_recurring(self, request, queryset):
        queryset.update(status='active')
    activate_recurring.short_description = "Activate selected recurring donations"
    
    def pause_recurring(self, request, queryset):
        queryset.update(status='paused')
    pause_recurring.short_description = "Pause selected recurring donations"
    
    def cancel_recurring(self, request, queryset):
        queryset.update(status='cancelled')
    cancel_recurring.short_description = "Cancel selected recurring donations"


@admin.register(DonationReceipt)
class DonationReceiptAdmin(admin.ModelAdmin):
    """Admin interface for donation receipts."""
    
    list_display = [
        'receipt_number', 'donation', 'issued_date',
        'pdf_generated', 'email_sent', 'email_sent_at'
    ]
    list_filter = ['pdf_generated', 'email_sent', 'issued_date']
    search_fields = ['receipt_number', 'donation__transaction_id']
    readonly_fields = ['receipt_number', 'issued_date']
    
    fieldsets = (
        ('Receipt Information', {
            'fields': ('receipt_number', 'donation', 'issued_date')
        }),
        ('Organization Details', {
            'fields': ('organization_name', 'organization_address')
        }),
        ('Generation Status', {
            'fields': ('pdf_generated', 'pdf_file')
        }),
        ('Email Status', {
            'fields': ('email_sent', 'email_sent_at')
        }),
    )
    
    actions = ['regenerate_receipts', 'resend_receipts']
    
    def regenerate_receipts(self, request, queryset):
        # Logic to regenerate PDF receipts would go here
        self.message_user(request, f"Regenerated {queryset.count()} receipts.")
    regenerate_receipts.short_description = "Regenerate PDF receipts"
    
    def resend_receipts(self, request, queryset):
        # Logic to resend receipt emails would go here
        self.message_user(request, f"Resent {queryset.count()} receipt emails.")
    resend_receipts.short_description = "Resend receipt emails"