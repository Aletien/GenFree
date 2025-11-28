"""
Payment Integration Configuration for GenFree Network.
Flutterwave payment gateway setup and configuration.
"""

import requests
import hashlib
import hmac
from django.conf import settings
from decimal import Decimal

class FlutterwavePaymentGateway:
    """Flutterwave payment gateway integration."""
    
    def __init__(self):
        self.public_key = settings.FLUTTERWAVE_PUBLIC_KEY
        self.secret_key = settings.FLUTTERWAVE_SECRET_KEY
        self.base_url = "https://api.flutterwave.com/v3"
        
    def initialize_payment(self, payment_data):
        """Initialize a payment transaction."""
        
        endpoint = f"{self.base_url}/payments"
        
        payload = {
            "tx_ref": payment_data['transaction_reference'],
            "amount": str(payment_data['amount']),
            "currency": payment_data.get('currency', 'UGX'),
            "redirect_url": payment_data['redirect_url'],
            "payment_options": "card,mobilemoneyuganda,ussd",
            "customer": {
                "email": payment_data['customer_email'],
                "phonenumber": payment_data.get('customer_phone', ''),
                "name": payment_data['customer_name']
            },
            "customizations": {
                "title": "GenFree Network Donation",
                "description": payment_data.get('description', 'Donation to GenFree Network'),
                "logo": "https://your-logo-url.com/logo.png"
            },
            "meta": {
                "campaign_id": payment_data.get('campaign_id'),
                "event_id": payment_data.get('event_id'),
                "donor_message": payment_data.get('message', ''),
                "is_anonymous": payment_data.get('is_anonymous', False)
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            if result['status'] == 'success':
                return {
                    'success': True,
                    'payment_link': result['data']['link'],
                    'transaction_id': result['data']['id'],
                    'tx_ref': payment_data['transaction_reference']
                }
            else:
                return {
                    'success': False,
                    'error': result.get('message', 'Payment initialization failed')
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}"
            }
    
    def verify_payment(self, transaction_id):
        """Verify a payment transaction."""
        
        endpoint = f"{self.base_url}/transactions/{transaction_id}/verify"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            if result['status'] == 'success':
                transaction = result['data']
                
                return {
                    'success': True,
                    'transaction_id': transaction['id'],
                    'tx_ref': transaction['tx_ref'],
                    'amount': Decimal(transaction['amount']),
                    'currency': transaction['currency'],
                    'status': transaction['status'],
                    'payment_type': transaction['payment_type'],
                    'customer': transaction['customer']
                }
            else:
                return {
                    'success': False,
                    'error': result.get('message', 'Payment verification failed')
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}"
            }
    
    def validate_webhook(self, payload, signature):
        """Validate webhook signature from Flutterwave."""
        
        # Create hash using secret key
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def process_webhook(self, payload):
        """Process Flutterwave webhook notification."""
        
        event_type = payload.get('event')
        
        if event_type == 'charge.completed':
            transaction = payload.get('data', {})
            
            # Extract transaction details
            return {
                'event': 'payment_completed',
                'transaction_id': transaction.get('id'),
                'tx_ref': transaction.get('tx_ref'),
                'amount': Decimal(str(transaction.get('amount', 0))),
                'currency': transaction.get('currency'),
                'status': transaction.get('status'),
                'customer_email': transaction.get('customer', {}).get('email'),
                'payment_type': transaction.get('payment_type'),
                'meta': transaction.get('meta', {})
            }
        
        return None

# Payment configuration for settings
PAYMENT_SETTINGS = """
# Add to Django settings.py

# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY = config('FLUTTERWAVE_PUBLIC_KEY', default='FLWPUBK-test-xxxxxx')
FLUTTERWAVE_SECRET_KEY = config('FLUTTERWAVE_SECRET_KEY', default='FLWSECK-test-xxxxxx')
FLUTTERWAVE_WEBHOOK_SECRET = config('FLUTTERWAVE_WEBHOOK_SECRET', default='webhook-secret')

# Payment settings
PAYMENT_CURRENCY_DEFAULT = 'UGX'
PAYMENT_MINIMUM_AMOUNT = {
    'UGX': 1000,
    'USD': 1,
    'EUR': 1,
}

# Email notifications
PAYMENT_NOTIFICATION_EMAIL = config('PAYMENT_NOTIFICATION_EMAIL', default='payments@genfree.org')
"""

def setup_payment_integration():
    """Setup instructions for payment integration."""
    
    print("💳 Payment Integration Setup (Flutterwave)")
    print("=" * 45)
    
    steps = [
        "1. Create Flutterwave account at https://flutterwave.com",
        "2. Get API keys from Flutterwave dashboard",
        "3. Add environment variables to .env:",
        "   - FLUTTERWAVE_PUBLIC_KEY=your_public_key",
        "   - FLUTTERWAVE_SECRET_KEY=your_secret_key", 
        "   - FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret",
        "4. Update donation views to use FlutterwavePaymentGateway",
        "5. Create webhook endpoint for payment notifications",
        "6. Test with Flutterwave test keys first",
        "7. Configure payment success/failure redirect URLs",
        "8. Set up email notifications for successful payments"
    ]
    
    for step in steps:
        print(f"   {step}")
    
    print(f"\n📝 Add to requirements.txt:")
    print("   requests>=2.25.1")
    
    return True

if __name__ == "__main__":
    setup_payment_integration()
    print("\n✅ Payment integration configuration ready!")