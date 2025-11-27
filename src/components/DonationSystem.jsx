import { useState, useEffect } from 'react';
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

    // Preset amounts in KES
    const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

    // Sample recent donations
    useEffect(() => {
        const sampleDonations = [
            { id: 1, name: 'John Mwangi', amount: 1000, message: 'God bless this ministry! 🙏', timestamp: Date.now() - 300000, anonymous: false },
            { id: 2, name: 'Anonymous', amount: 500, message: 'Praying for the church', timestamp: Date.now() - 240000, anonymous: true },
            { id: 3, name: 'Mary Grace', amount: 2500, message: 'Thank you for the blessing', timestamp: Date.now() - 180000, anonymous: false },
            { id: 4, name: 'Peter Kamau', amount: 750, message: 'Keep up the good work!', timestamp: Date.now() - 120000, anonymous: false },
            { id: 5, name: 'Anonymous', amount: 1500, message: '', timestamp: Date.now() - 60000, anonymous: true }
        ];
        setDonations(sampleDonations);
        setTotalRaised(sampleDonations.reduce((total, donation) => total + donation.amount, 0) + 15000);
    }, []);

    // Simulate live donations
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.85) { // 15% chance every 30 seconds
                const amounts = [100, 250, 500, 1000];
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
                    amount: amounts[Math.floor(Math.random() * amounts.length)],
                    message: messages[Math.floor(Math.random() * messages.length)],
                    timestamp: Date.now(),
                    anonymous: Math.random() > 0.6
                };

                setDonations(prev => [newDonation, ...prev.slice(0, 19)]); // Keep last 20
                setTotalRaised(prev => prev + newDonation.amount);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleDonationSubmit = async () => {
        if (!donationAmount || !donorName.trim()) return;

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            const newDonation = {
                id: Date.now(),
                name: donorName,
                amount: parseInt(donationAmount),
                message: donorMessage,
                timestamp: Date.now(),
                anonymous: false,
                isOwn: true
            };

            setDonations(prev => [newDonation, ...prev]);
            setTotalRaised(prev => prev + parseInt(donationAmount));
            
            // Trigger analytics
            if (window.trackStreamEvent) {
                window.trackStreamEvent('donation', {
                    amount: parseInt(donationAmount),
                    currency: 'KES',
                    method: paymentMethod
                });
            }

            setIsProcessing(false);
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
        }, 2000);
    };

    const handlePresetAmount = (amount) => {
        setSelectedAmount(amount);
        setDonationAmount(amount.toString());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
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
                                {formatCurrency(totalRaised)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                raised
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
                                {formatCurrency(campaignGoal)}
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
                                        {formatCurrency(donation.amount)}
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

                        {/* Amount Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text)'
                            }}>
                                Select Amount (KES)
                            </label>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                {presetAmounts.map((amount) => (
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
                                        {formatCurrency(amount)}
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
                                    Donate {donationAmount && formatCurrency(parseInt(donationAmount))}
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