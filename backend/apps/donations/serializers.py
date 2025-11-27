"""
Donations serializers for GenFree Network.
"""

from rest_framework import serializers
from decimal import Decimal
from .models import Donation, DonationCampaign, RecurringDonation, DonationReceipt


class DonationCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer for donation campaigns.
    """
    progress_percentage = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    
    class Meta:
        model = DonationCampaign
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'goal_amount', 'raised_amount', 'currency', 'progress_percentage',
            'is_completed', 'remaining_amount', 'start_date', 'end_date',
            'status', 'featured_image', 'video_url', 'is_featured',
            'organizer_name', 'donor_count', 'view_count', 'created_at'
        ]
        read_only_fields = ['raised_amount', 'donor_count', 'view_count', 'created_at']


class DonationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating donations.
    """
    class Meta:
        model = Donation
        fields = [
            'amount', 'currency', 'donor_name', 'donor_email', 'donor_phone',
            'is_anonymous', 'campaign', 'event', 'payment_method', 'message'
        ]
    
    def validate_amount(self, value):
        """Validate donation amount."""
        if value <= 0:
            raise serializers.ValidationError("Donation amount must be greater than zero.")
        
        # Set minimum donation amount
        min_amount = Decimal('1000.00') if self.initial_data.get('currency') == 'UGX' else Decimal('1.00')
        if value < min_amount:
            raise serializers.ValidationError(f"Minimum donation amount is {min_amount}.")
        
        return value
    
    def validate(self, attrs):
        """Validate donation data."""
        # Ensure either campaign or event is specified for targeted donations
        if not attrs.get('campaign') and not attrs.get('event'):
            # This is a general donation
            pass
        
        # Validate campaign is active if specified
        if attrs.get('campaign'):
            campaign = attrs['campaign']
            if campaign.status != 'active':
                raise serializers.ValidationError("Selected campaign is not active.")
        
        return attrs


class DonationSerializer(serializers.ModelSerializer):
    """
    Serializer for donation details.
    """
    display_name = serializers.ReadOnlyField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = Donation
        fields = [
            'id', 'transaction_id', 'amount', 'currency', 'display_name',
            'donor_email', 'is_anonymous', 'campaign_title', 'event_title',
            'payment_method', 'status', 'message', 'created_at', 'processed_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'status', 'created_at', 'processed_at']


class FlutterwavePaymentSerializer(serializers.Serializer):
    """
    Serializer for Flutterwave payment initialization.
    """
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='UGX')
    donor_name = serializers.CharField(max_length=200)
    donor_email = serializers.EmailField()
    donor_phone = serializers.CharField(max_length=20, required=False)
    is_anonymous = serializers.BooleanField(default=False)
    campaign_id = serializers.IntegerField(required=False)
    event_id = serializers.IntegerField(required=False)
    message = serializers.CharField(required=False, allow_blank=True)
    redirect_url = serializers.URLField(required=False)
    
    def validate_amount(self, value):
        """Validate payment amount."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class WebhookPaymentSerializer(serializers.Serializer):
    """
    Serializer for payment webhook data.
    """
    event = serializers.CharField()
    data = serializers.DictField()
    
    def validate_event(self, value):
        """Validate webhook event type."""
        allowed_events = ['charge.completed', 'transfer.completed']
        if value not in allowed_events:
            raise serializers.ValidationError(f"Unsupported event type: {value}")
        return value


class RecurringDonationSerializer(serializers.ModelSerializer):
    """
    Serializer for recurring donations.
    """
    donor_name = serializers.CharField(source='donor.get_full_name', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = RecurringDonation
        fields = [
            'id', 'donor_name', 'campaign_title', 'amount', 'currency',
            'frequency', 'start_date', 'end_date', 'next_charge_date',
            'last_charge_date', 'status', 'total_charges', 'successful_charges',
            'failed_charges', 'success_rate', 'created_at'
        ]
        read_only_fields = [
            'id', 'total_charges', 'successful_charges', 'failed_charges',
            'last_charge_date', 'created_at'
        ]


class DonationReceiptSerializer(serializers.ModelSerializer):
    """
    Serializer for donation receipts.
    """
    donation_details = DonationSerializer(source='donation', read_only=True)
    
    class Meta:
        model = DonationReceipt
        fields = [
            'id', 'receipt_number', 'issued_date', 'organization_name',
            'organization_address', 'pdf_generated', 'pdf_file',
            'email_sent', 'email_sent_at', 'donation_details'
        ]
        read_only_fields = [
            'id', 'receipt_number', 'issued_date', 'pdf_generated',
            'email_sent', 'email_sent_at'
        ]


class DonationStatsSerializer(serializers.Serializer):
    """
    Serializer for donation statistics.
    """
    total_raised = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_donations = serializers.IntegerField()
    total_donors = serializers.IntegerField()
    average_donation = serializers.DecimalField(max_digits=12, decimal_places=2)
    this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    last_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    growth_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Top campaigns
    top_campaigns = DonationCampaignSerializer(many=True, read_only=True)
    
    # Recent donations
    recent_donations = DonationSerializer(many=True, read_only=True)


class DonorStatsSerializer(serializers.Serializer):
    """
    Serializer for individual donor statistics.
    """
    total_donated = serializers.DecimalField(max_digits=15, decimal_places=2)
    donation_count = serializers.IntegerField()
    average_donation = serializers.DecimalField(max_digits=12, decimal_places=2)
    largest_donation = serializers.DecimalField(max_digits=12, decimal_places=2)
    first_donation_date = serializers.DateTimeField()
    last_donation_date = serializers.DateTimeField()
    donation_frequency_days = serializers.IntegerField()
    donor_segment = serializers.CharField()
    recent_donations = DonationSerializer(many=True, read_only=True)