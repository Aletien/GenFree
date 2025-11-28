"""
Donations views for GenFree Network.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta
import uuid

from .models import Donation, DonationCampaign, RecurringDonation, DonationReceipt
from .serializers import (
    DonationSerializer, DonationCreateSerializer, DonationCampaignSerializer,
    FlutterwavePaymentSerializer, RecurringDonationSerializer,
    DonationReceiptSerializer, DonationStatsSerializer, DonorStatsSerializer
)


class DonationCampaignViewSet(viewsets.ModelViewSet):
    """ViewSet for donation campaigns."""
    
    queryset = DonationCampaign.objects.filter(status='active')
    serializer_class = DonationCampaignSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search)
            )
        
        return queryset.select_related('organizer').order_by('-is_featured', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    @action(detail=True, methods=['get'])
    def donations(self, request, slug=None):
        """Get donations for a campaign."""
        campaign = self.get_object()
        donations = campaign.donations.filter(
            status='completed'
        ).select_related('donor').order_by('-created_at')
        
        # Pagination
        limit = int(request.query_params.get('limit', 20))
        donations = donations[:limit]
        
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, slug=None):
        """Get campaign statistics."""
        campaign = self.get_object()
        
        # Calculate stats
        total_donations = campaign.donations.filter(status='completed').count()
        total_donors = campaign.donations.filter(
            status='completed'
        ).values('donor_email').distinct().count()
        
        average_donation = campaign.donations.filter(
            status='completed'
        ).aggregate(avg=Avg('amount'))['avg'] or 0
        
        largest_donation = campaign.donations.filter(
            status='completed'
        ).aggregate(max=Sum('amount'))['max'] or 0
        
        # Recent donations
        recent_donations = campaign.donations.filter(
            status='completed'
        ).select_related('donor').order_by('-created_at')[:10]
        
        # Daily progress (last 30 days)
        daily_progress = []
        today = timezone.now().date()
        for i in range(30):
            date = today - timedelta(days=29-i)
            day_total = campaign.donations.filter(
                status='completed',
                created_at__date=date
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            daily_progress.append({
                'date': date.strftime('%Y-%m-%d'),
                'amount': float(day_total)
            })
        
        data = {
            'campaign': DonationCampaignSerializer(campaign).data,
            'total_donations': total_donations,
            'total_donors': total_donors,
            'average_donation': float(average_donation),
            'largest_donation': float(largest_donation),
            'recent_donations': DonationSerializer(recent_donations, many=True).data,
            'daily_progress': daily_progress
        }
        
        return Response(data)


class DonationViewSet(viewsets.ModelViewSet):
    """ViewSet for donations."""
    
    queryset = Donation.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DonationCreateSerializer
        return DonationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by campaign
        campaign_slug = self.request.query_params.get('campaign')
        if campaign_slug:
            queryset = queryset.filter(campaign__slug=campaign_slug)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by user (if authenticated)
        if self.request.user.is_authenticated:
            my_donations = self.request.query_params.get('my_donations')
            if my_donations and my_donations.lower() == 'true':
                queryset = queryset.filter(donor=self.request.user)
        
        return queryset.select_related('campaign', 'event', 'donor').order_by('-created_at')
    
    def perform_create(self, serializer):
        # Set donor if authenticated
        donor = self.request.user if self.request.user.is_authenticated else None
        serializer.save(donor=donor)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get donation statistics."""
        # Calculate overall stats
        total_raised = Donation.objects.filter(
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_donations = Donation.objects.filter(status='completed').count()
        
        total_donors = Donation.objects.filter(
            status='completed'
        ).values('donor_email').distinct().count()
        
        average_donation = Donation.objects.filter(
            status='completed'
        ).aggregate(avg=Avg('amount'))['avg'] or 0
        
        # This month vs last month
        today = timezone.now().date()
        this_month_start = today.replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        
        this_month = Donation.objects.filter(
            status='completed',
            created_at__date__gte=this_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        last_month = Donation.objects.filter(
            status='completed',
            created_at__date__gte=last_month_start,
            created_at__date__lte=last_month_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate growth
        if last_month > 0:
            growth_percentage = ((this_month - last_month) / last_month) * 100
        else:
            growth_percentage = 100 if this_month > 0 else 0
        
        # Top campaigns
        top_campaigns = DonationCampaign.objects.filter(
            status='active'
        ).annotate(
            total_raised=Sum('donations__amount')
        ).order_by('-total_raised')[:5]
        
        # Recent donations
        recent_donations = Donation.objects.filter(
            status='completed'
        ).select_related('campaign', 'donor').order_by('-created_at')[:10]
        
        data = {
            'total_raised': float(total_raised),
            'total_donations': total_donations,
            'total_donors': total_donors,
            'average_donation': float(average_donation),
            'this_month': float(this_month),
            'last_month': float(last_month),
            'growth_percentage': round(growth_percentage, 2),
            'top_campaigns': DonationCampaignSerializer(top_campaigns, many=True).data,
            'recent_donations': DonationSerializer(recent_donations, many=True).data
        }
        
        serializer = DonationStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def initialize_payment(self, request):
        """Initialize payment with Flutterwave."""
        serializer = FlutterwavePaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            # Here you would integrate with Flutterwave API
            # For now, we'll create a mock response
            
            tx_ref = f"GFN_{uuid.uuid4().hex[:10].upper()}"
            
            # Create pending donation record
            donation_data = {
                'amount': serializer.validated_data['amount'],
                'currency': serializer.validated_data['currency'],
                'donor_name': serializer.validated_data['donor_name'],
                'donor_email': serializer.validated_data['donor_email'],
                'donor_phone': serializer.validated_data.get('donor_phone'),
                'is_anonymous': serializer.validated_data['is_anonymous'],
                'message': serializer.validated_data.get('message', ''),
                'transaction_id': tx_ref,
                'status': 'pending'
            }
            
            # Link to campaign or event if specified
            campaign_id = serializer.validated_data.get('campaign_id')
            if campaign_id:
                try:
                    campaign = DonationCampaign.objects.get(id=campaign_id)
                    donation_data['campaign'] = campaign
                except DonationCampaign.DoesNotExist:
                    pass
            
            event_id = serializer.validated_data.get('event_id')
            if event_id:
                try:
                    from apps.events.models import Event
                    event = Event.objects.get(id=event_id)
                    donation_data['event'] = event
                except:
                    pass
            
            # Set donor if authenticated
            if request.user.is_authenticated:
                donation_data['donor'] = request.user
            
            donation = Donation.objects.create(**donation_data)
            
            # Mock payment link (replace with real Flutterwave integration)
            payment_link = f"https://checkout.flutterwave.com/v3/hosted/pay/{tx_ref}"
            
            return Response({
                'status': 'success',
                'data': {
                    'link': payment_link,
                    'tx_ref': tx_ref,
                    'donation_id': str(donation.id)
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_donations(self, request):
        """Get authenticated user's donations."""
        donations = Donation.objects.filter(
            donor=request.user
        ).select_related('campaign', 'event').order_by('-created_at')
        
        # Calculate user stats
        total_donated = donations.filter(
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        donation_count = donations.filter(status='completed').count()
        
        average_donation = donations.filter(
            status='completed'
        ).aggregate(avg=Avg('amount'))['avg'] or 0
        
        largest_donation = donations.filter(
            status='completed'
        ).aggregate(max=Sum('amount'))['max'] or 0
        
        # First and last donation dates
        first_donation = donations.filter(status='completed').last()
        last_donation = donations.filter(status='completed').first()
        
        first_donation_date = first_donation.created_at if first_donation else None
        last_donation_date = last_donation.created_at if last_donation else None
        
        # Calculate frequency
        donation_frequency_days = 0
        if first_donation_date and last_donation_date and donation_count > 1:
            days_between = (last_donation_date - first_donation_date).days
            if days_between > 0:
                donation_frequency_days = days_between // (donation_count - 1)
        
        # Determine donor segment
        if total_donated >= 1000000:  # 1M (adjust based on your currency)
            donor_segment = 'Major Donor'
        elif total_donated >= 100000:  # 100K
            donor_segment = 'Regular Donor'
        elif donation_count >= 5:
            donor_segment = 'Frequent Donor'
        else:
            donor_segment = 'New Donor'
        
        # Recent donations
        recent_donations = donations.filter(status='completed')[:5]
        
        stats_data = {
            'total_donated': float(total_donated),
            'donation_count': donation_count,
            'average_donation': float(average_donation),
            'largest_donation': float(largest_donation),
            'first_donation_date': first_donation_date,
            'last_donation_date': last_donation_date,
            'donation_frequency_days': donation_frequency_days,
            'donor_segment': donor_segment,
            'recent_donations': DonationSerializer(recent_donations, many=True).data
        }
        
        serializer = DonorStatsSerializer(stats_data)
        return Response(serializer.data)


class RecurringDonationViewSet(viewsets.ModelViewSet):
    """ViewSet for recurring donations."""
    
    queryset = RecurringDonation.objects.all()
    serializer_class = RecurringDonationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        if not self.request.user.is_staff:
            queryset = queryset.filter(donor=self.request.user)
        
        return queryset.select_related('donor', 'campaign')
    
    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a recurring donation."""
        recurring_donation = self.get_object()
        recurring_donation.status = 'paused'
        recurring_donation.save()
        
        serializer = self.get_serializer(recurring_donation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused recurring donation."""
        recurring_donation = self.get_object()
        recurring_donation.status = 'active'
        recurring_donation.save()
        
        serializer = self.get_serializer(recurring_donation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a recurring donation."""
        recurring_donation = self.get_object()
        recurring_donation.status = 'cancelled'
        recurring_donation.save()
        
        serializer = self.get_serializer(recurring_donation)
        return Response(serializer.data)