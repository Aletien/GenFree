import { useState, useEffect } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Heart, Gift, DollarSign, CreditCard, Smartphone, Building, Target, Users, Star } from 'lucide-react';

const DonationSystem = ({ streamId, onDonationComplete }) => {
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [donorName, setDonorName] = useState('');
    const [donorMessage, setDonorMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('mobile');
    const [isProcessing, setIsProcessing] = useState(false);
    const [donations, setDonations] = useState([]);
    const [campaignGoal, setCampaignGoal] = useState(50000);
    const [totalRaised, setTotalRaised] = useState(0);
    const [showThankYou, setShowThankYou] = useState(false);

    // Currency selection
    const [selectedCurrency, setSelectedCurrency] = useState('UGX');

    // Preset amounts for different currencies
    const presetAmounts = {
        UGX: [2000, 5000, 10000, 20000, 50000, 100000],
        USD: [1, 5, 10, 25, 50, 100]
    };

    // Sample recent donations
    useEffect(() => {
        const sampleDonations = [
            { id: 1, name: 'John Mwangi', amount: 10000, currency: 'UGX', message: 'God bless this ministry! 🙏', timestamp: Date.now() - 300000, anonymous: false },
            { id: 2, name: 'Anonymous', amount: 5, currency: 'USD', message: 'Praying for the church', timestamp: Date.now() - 240000, anonymous: true },
            { id: 3, name: 'Mary Grace', amount: 25000, currency: 'UGX', message: 'Thank you for the blessing', timestamp: Date.now() - 180000, anonymous: false },
            { id: 4, name: 'Peter Kamau', amount: 10, currency: 'USD', message: 'Keep up the good work!', timestamp: Date.now() - 120000, anonymous: false },
            { id: 5, name: 'Anonymous', amount: 15000, currency: 'UGX', message: '', timestamp: Date.now() - 60000, anonymous: true }
        ];
        setDonations(sampleDonations);
        // Calculate total in UGX equivalent for progress tracking
        const totalInUGX = sampleDonations.reduce((total, donation) => {
            const amount = donation.currency === 'USD' ? donation.amount * 3700 : donation.amount; // USD to UGX conversion
            return total + amount;
        }, 0) + 50000000; // Starting amount in UGX
        setTotalRaised(totalInUGX);
    }, []);

    // Simulate live donations
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.85) { // 15% chance every 30 seconds
                const amounts = { UGX: [2000, 5000, 10000, 20000], USD: [1, 5, 10, 25] };
                const currencies = ['UGX', 'USD'];
                const selectedCurr = currencies[Math.floor(Math.random() * currencies.length)];
                const names = ['Anonymous', 'Grace Wanjiku', 'David Ochieng', 'Sarah Njeri', 'Anonymous'];
                const messages = [
                    'God bless! 🙏',
                    'Thank you for this ministry',
                    'Praying for the church',
                    'Keep spreading the gospel',
                    'May God multiply this seed',
                    ''
                ];

                const newDonation = {
                    id: Date.now(),
                    name: names[Math.floor(Math.random() * names.length)],
                    amount: amounts[selectedCurr][Math.floor(Math.random() * amounts[selectedCurr].length)],
                    currency: selectedCurr,
                    message: messages[Math.floor(Math.random() * messages.length)],
                    timestamp: Date.now(),
                    anonymous: Math.random() > 0.6
                };

                setDonations(prev => [newDonation, ...prev.slice(0, 19)]); // Keep last 20
                // Convert to UGX for progress tracking
                const amountInUGX = newDonation.currency === 'USD' ? newDonation.amount * 3700 : newDonation.amount;
                setTotalRaised(prev => prev + amountInUGX);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const config = {
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now(),
        amount: parseInt(donationAmount),
        currency: selectedCurrency,
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: 'user@example.com', // In a real app, you'd ask for email
            phone_number: '0700000000', // In a real app, you'd ask for phone
            name: donorName,
        },
        customizations: {
            title: 'GenFree Ministry Donation',
            description: donorMessage || 'Support for ministry work',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    // Debug: Check if environment variable is loaded
    if (!import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
        console.error('Flutterwave public key not found in environment variables');
        console.log('Available env vars:', import.meta.env);
    }

    const handleFlutterwavePayment = useFlutterwave(config);

    const handleDonationSubmit = () => {
        if (!donationAmount || !donorName.trim()) return;

        setIsProcessing(true);

        handleFlutterwavePayment({
            callback: (response) => {
                console.log(response);
                closePaymentModal(); // this will close the modal programmatically

                if (response.status === "successful") {
                    const newDonation = {
                        id: response.transaction_id,
                        name: donorName,
                        amount: parseInt(donationAmount),
                        currency: selectedCurrency,
                        message: donorMessage,
                        timestamp: Date.now(),
                        anonymous: false,
                        isOwn: true
                    };

                    setDonations(prev => [newDonation, ...prev]);
                    // Convert to UGX for progress tracking
                    const amountInUGX = selectedCurrency === 'USD' ? parseInt(donationAmount) * 3700 : parseInt(donationAmount);
                    setTotalRaised(prev => prev + amountInUGX);

                    // Trigger analytics
                    if (window.trackStreamEvent) {
                        window.trackStreamEvent('donation', {
                            amount: parseInt(donationAmount),
                            currency: selectedCurrency,
                            method: 'flutterwave'
                        });
                    }

                    setShowDonationModal(false);
                    setShowThankYou(true);

                    // Reset form
                    setDonationAmount('');
                    setSelectedAmount(null);
                    setDonorName('');
                    setDonorMessage('');

                    // Call callback
                    if (onDonationComplete) {
                        onDonationComplete(newDonation);
                    }

                    // Hide thank you after 5 seconds
                    setTimeout(() => setShowThankYou(false), 5000);
                }
                setIsProcessing(false);
            },
            onClose: () => {
                setIsProcessing(false);
            },
        });
    };

    const handlePresetAmount = (amount) => {
        setSelectedAmount(amount);
        setDonationAmount(amount.toString());
    };

    const formatCurrency = (amount, currency = selectedCurrency) => {
        const locales = {
            UGX: 'en-UG',
            USD: 'en-US'
        };

        return new Intl.NumberFormat(locales[currency] || 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'UGX' ? 0 : 2
        }).format(amount);
    };

    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getProgressPercentage = () => {
        return Math.min((totalRaised / campaignGoal) * 100, 100);
    };

    const paymentMethods = {
        mobile: { name: 'M-Pesa/Airtel Money', icon: <Smartphone size={18} />, popular: true },
        card: { name: 'Credit/Debit Card', icon: <CreditCard size={18} />, popular: false },
        bank: { name: 'Bank Transfer', icon: <Building size={18} />, popular: false }
    };

    return (
        <>
            {/* Donation Widget */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid var(--color-primary)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <Heart size={24} style={{ color: '#ff69b4' }} />
                        Support Our Ministry
                    </h3>
                    <p style={{
                        margin: 0,
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        Your generous giving helps spread the gospel
                    </p>
                </div>

                {/* Campaign Progress */}
                <div style={{
                    backgroundColor: 'var(--color-bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Campaign Goal
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {getProgressPercentage().toFixed(1)}%
                        </span>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '12px',
                        backgroundColor: 'var(--color-border)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{
                            width: `${getProgressPercentage()}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {formatCurrency(totalRaised, 'UGX')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                raised
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
                                {formatCurrency(campaignGoal, 'UGX')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                goal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donation Button */}
                <button
                    onClick={() => setShowDonationModal(true)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    <Gift size={20} />
                    Give Now
                </button>

                {/* Recent Donations */}
                <div>
                    <h4 style={{
                        margin: '0 0 0.75rem 0',
                        fontSize: '1rem',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Users size={16} />
                        Recent Donations
                    </h4>

                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {donations.slice(0, 5).map((donation) => (
                            <div
                                key={donation.id}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: donation.isOwn ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                                    borderRadius: '6px',
                                    border: donation.isOwn ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    position: 'relative'
                                }}
                            >
                                {donation.isOwn && (
                                    <Star size={12} style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        color: '#FFD700'
                                    }} />
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.25rem'
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        color: donation.anonymous ? 'var(--color-text-muted)' : 'var(--color-text)'
                                    }}>
                                        {donation.name}
                                    </span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: 'var(--color-primary)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {formatCurrency(donation.amount, donation.currency)}
                                    </span>
                                </div>

                                {donation.message && (
                                    <p style={{
                                        margin: '0 0 0.25rem 0',
                                        fontSize: '0.8rem',
                                        color: 'var(--color-text-muted)',
                                        fontStyle: 'italic'
                                    }}>
                                        "{donation.message}"
                                    </p>
                                )}

                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'right'
                                }}>
                                    {formatTime(donation.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Donation Modal */}
            {showDonationModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDonationModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            ×
                        </button>

                        <h3 style={{
                            margin: '0 0 1.5rem 0',
                            color: 'var(--color-primary)',
                            textAlign: 'center'
                        }}>
                            💝 Make a Donation
                        </h3>

                        {/* Currency Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Currency
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelectedCurrency('UGX')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: selectedCurrency === 'UGX' ? 'var(--color-primary)' : 'var(--color-bg)',
                                        color: selectedCurrency === 'UGX' ? 'white' : 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🇺🇬 UGX (Ugandan Shilling)
                                </button>
                                <button
                                    onClick={() => setSelectedCurrency('USD')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: selectedCurrency === 'USD' ? 'var(--color-primary)' : 'var(--color-bg)',
                                        color: selectedCurrency === 'USD' ? 'white' : 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🇺🇸 USD (US Dollar)
                                </button>
                            </div>
                        </div>

                        {/* Amount Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Select Amount ({selectedCurrency})
                            </label>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                {presetAmounts[selectedCurrency].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => handlePresetAmount(amount)}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: selectedAmount === amount ? 'var(--color-primary)' : 'var(--color-bg)',
                                            color: selectedAmount === amount ? 'white' : 'var(--color-text)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {formatCurrency(amount, selectedCurrency)}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="number"
                                placeholder="Enter custom amount"
                                value={donationAmount}
                                onChange={(e) => {
                                    setDonationAmount(e.target.value);
                                    setSelectedAmount(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Donor Information */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Message */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Message (Optional)
                            </label>
                            <textarea
                                placeholder="Share a message of encouragement..."
                                value={donorMessage}
                                onChange={(e) => setDonorMessage(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Payment Method */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Payment Method
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.entries(paymentMethods).map(([key, method]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPaymentMethod(key)}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: paymentMethod === key ? 'var(--color-primary)' : 'var(--color-bg)',
                                            color: paymentMethod === key ? 'white' : 'var(--color-text)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {method.icon}
                                            {method.name}
                                        </div>
                                        {method.popular && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                backgroundColor: '#00C851',
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '12px'
                                            }}>
                                                Popular
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleDonationSubmit}
                            disabled={!donationAmount || !donorName.trim() || isProcessing}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                opacity: (!donationAmount || !donorName.trim() || isProcessing) ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isProcessing ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid white',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <DollarSign size={20} />
                                    Donate {donationAmount && formatCurrency(parseInt(donationAmount), selectedCurrency)}
                                </>
                            )}
                        </button>

                        {/* Security Notice */}
                        <p style={{
                            marginTop: '1rem',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            textAlign: 'center'
                        }}>
                            🔒 Your payment is secure and encrypted. You will receive a confirmation receipt.
                        </p>
                    </div>
                </div>
            )}

            {/* Thank You Modal */}
            {showThankYou && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#00C851',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 200, 81, 0.4)',
                    zIndex: 1002,
                    maxWidth: '300px',
                    animation: 'slideIn 0.3s ease'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <Heart size={32} style={{ marginBottom: '0.5rem' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Thank You! 🙏</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            Your generous donation has been received. May God bless you abundantly!
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default DonationSystem;