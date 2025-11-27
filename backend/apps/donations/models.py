"""
Donations models for GenFree Network.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

User = get_user_model()


class DonationCampaign(models.Model):
    """
    Donation campaigns for specific causes or goals.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    
    # Financial details
    goal_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='UGX')
    
    # Timeline
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Media
    featured_image = models.ImageField(upload_to='campaigns/', blank=True, null=True)
    video_url = models.URLField(blank=True)
    
    # Settings
    is_featured = models.BooleanField(default=False)
    allow_anonymous = models.BooleanField(default=True)
    show_donor_names = models.BooleanField(default=True)
    
    # Metadata
    organizer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='campaigns')
    view_count = models.PositiveIntegerField(default=0)
    donor_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Donation Campaign'
        verbose_name_plural = 'Donation Campaigns'
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        """Calculate campaign progress percentage."""
        if self.goal_amount <= 0:
            return 0
        return min(100, (self.raised_amount / self.goal_amount) * 100)
    
    @property
    def is_completed(self):
        """Check if campaign goal is reached."""
        return self.raised_amount >= self.goal_amount
    
    @property
    def remaining_amount(self):
        """Calculate remaining amount to reach goal."""
        return max(0, self.goal_amount - self.raised_amount)


class Donation(models.Model):
    """
    Individual donation records.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Credit/Debit Card'),
        ('mobile_money', 'Mobile Money'),
        ('bank_transfer', 'Bank Transfer'),
        ('ussd', 'USSD'),
        ('cash', 'Cash'),
    ]
    
    # Transaction identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    flutterwave_tx_ref = models.CharField(max_length=100, blank=True)
    
    # Donation details
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='UGX')
    
    # Donor information
    donor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='donations'
    )
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField()
    donor_phone = models.CharField(max_length=20, blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    # Campaign and event association
    campaign = models.ForeignKey(
        DonationCampaign, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='donations'
    )
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations'
    )
    
    # Payment details
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_processor = models.CharField(max_length=50, default='flutterwave')
    processor_reference = models.CharField(max_length=100, blank=True)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, help_text='Donor message/dedication')
    
    # Financial tracking
    fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Receipt and thank you
    receipt_sent = models.BooleanField(default=False)
    thank_you_sent = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Donation'
        verbose_name_plural = 'Donations'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['campaign']),
            models.Index(fields=['donor']),
        ]
    
    def __str__(self):
        return f"{self.donor_name} - {self.amount} {self.currency}"
    
    def save(self, *args, **kwargs):
        """Calculate net amount after fees."""
        if self.amount and self.fees:
            self.net_amount = self.amount - self.fees
        else:
            self.net_amount = self.amount or 0
        
        super().save(*args, **kwargs)
    
    @property
    def display_name(self):
        """Get display name for donor."""
        if self.is_anonymous:
            return "Anonymous Donor"
        return self.donor_name


class RecurringDonation(models.Model):
    """
    Recurring donation subscriptions.
    """
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    
    # Subscription details
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_donations')
    campaign = models.ForeignKey(
        DonationCampaign, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='recurring_donations'
    )
    
    # Amount and frequency
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='UGX')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    
    # Schedule
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    next_charge_date = models.DateField()
    last_charge_date = models.DateField(blank=True, null=True)
    
    # Payment method
    payment_method = models.CharField(max_length=20, choices=Donation.PAYMENT_METHODS)
    payment_token = models.CharField(max_length=200, blank=True)  # For stored payment methods
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    total_charges = models.PositiveIntegerField(default=0)
    successful_charges = models.PositiveIntegerField(default=0)
    failed_charges = models.PositiveIntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Recurring Donation'
        verbose_name_plural = 'Recurring Donations'
    
    def __str__(self):
        return f"{self.donor.get_full_name()} - {self.amount} {self.currency} ({self.frequency})"
    
    @property
    def success_rate(self):
        """Calculate success rate percentage."""
        if self.total_charges == 0:
            return 0
        return (self.successful_charges / self.total_charges) * 100


class DonationReceipt(models.Model):
    """
    Digital receipts for donations.
    """
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='receipt')
    receipt_number = models.CharField(max_length=50, unique=True)
    
    # Receipt details
    issued_date = models.DateTimeField(auto_now_add=True)
    organization_name = models.CharField(max_length=200, default='GenFree Network')
    organization_address = models.TextField(default='Kampala, Uganda')
    organization_tax_id = models.CharField(max_length=50, blank=True)
    
    # PDF generation
    pdf_generated = models.BooleanField(default=False)
    pdf_file = models.FileField(upload_to='receipts/', blank=True, null=True)
    
    # Email tracking
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Donation Receipt'
        verbose_name_plural = 'Donation Receipts'
    
    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.donation.donor_name}"
    
    def generate_receipt_number(self):
        """Generate unique receipt number."""
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m%d')
        count = DonationReceipt.objects.filter(
            issued_date__date=datetime.now().date()
        ).count() + 1
        return f"GFN-{date_str}-{count:04d}"
    
    def save(self, *args, **kwargs):
        """Auto-generate receipt number if not provided."""
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        super().save(*args, **kwargs)


class DonorAnalytics(models.Model):
    """
    Analytics and insights about donors.
    """
    donor = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donation_analytics')
    
    # Donation statistics
    total_donated = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    donation_count = models.PositiveIntegerField(default=0)
    average_donation = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    largest_donation = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Engagement metrics
    first_donation_date = models.DateTimeField(blank=True, null=True)
    last_donation_date = models.DateTimeField(blank=True, null=True)
    donation_frequency_days = models.PositiveIntegerField(default=0)
    preferred_payment_method = models.CharField(max_length=20, blank=True)
    
    # Categorization
    donor_segment = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New Donor'),
            ('occasional', 'Occasional Donor'),
            ('regular', 'Regular Donor'),
            ('major', 'Major Donor'),
            ('lapsed', 'Lapsed Donor'),
        ],
        default='new'
    )
    
    # Metadata
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Donor Analytics'
        verbose_name_plural = 'Donor Analytics'
    
    def __str__(self):
        return f"{self.donor.get_full_name()} - Analytics"
    
    def calculate_metrics(self):
        """Calculate and update donor metrics."""
        donations = self.donor.donations.filter(status='successful')
        
        if donations.exists():
            self.donation_count = donations.count()
            self.total_donated = sum(d.amount for d in donations)
            self.average_donation = self.total_donated / self.donation_count
            self.largest_donation = max(d.amount for d in donations)
            self.first_donation_date = donations.order_by('created_at').first().created_at
            self.last_donation_date = donations.order_by('created_at').last().created_at
            
            # Calculate frequency
            if self.donation_count > 1:
                time_span = (self.last_donation_date - self.first_donation_date).days
                self.donation_frequency_days = time_span // (self.donation_count - 1)
            
            # Determine segment
            if self.donation_count == 1:
                self.donor_segment = 'new'
            elif self.total_donated >= 1000000:  # 1M UGX
                self.donor_segment = 'major'
            elif self.donation_frequency_days <= 30:
                self.donor_segment = 'regular'
            else:
                self.donor_segment = 'occasional'
        
        self.save()