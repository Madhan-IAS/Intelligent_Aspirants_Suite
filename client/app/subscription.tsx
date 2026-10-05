import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image, Animated, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { TIER_INFO, TIER_FEATURES } from '../src/services/tierConfig';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// UPI Payment details — update these with your real values
const UPI_ID = 'your-upi-id@paytm'; // TODO: Replace with your actual UPI ID
const UPI_MOBILE = '9XXXXXXXXX'; // TODO: Replace with your mobile number

// QR codes rotate every 10 seconds — replace with actual QR images
const QR_IMAGES = [
    require('../assets/ias_logo.png'), // Placeholder — replace with qr_payment_1.png
    require('../assets/ias_logo.png'), // Placeholder — replace with qr_payment_2.png
    require('../assets/ias_logo.png'), // Placeholder — replace with qr_payment_3.png
];

const TIERS = ['foundation', 'aspirant', 'topper'] as const;

export default function SubscriptionScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [isAnnual, setIsAnnual] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('foundation');
    const [currentQR, setCurrentQR] = useState(0);
    const [utrNumber, setUtrNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Check if this is a rejected/expired re-submission
    useEffect(() => {
        checkExistingStatus();
    }, []);

    const checkExistingStatus = async () => {
        try {
            const res = await api.get('/subscription/my-status');
            if (res.data.latestProof?.reviewNote &&
                (user?.subscriptionStatus === 'rejected' || user?.subscriptionStatus === 'expired')) {
                setRejectionNote(res.data.latestProof.reviewNote);
            }

            const histRes = await api.get('/subscription/history');
            if (histRes.data && Array.isArray(histRes.data)) {
                setHistory(histRes.data);
            }
        } catch (e) { /* Not critical */ }
    };

    // Rotate QR code
    useEffect(() => {
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setCurrentQR((prev) => (prev + 1) % QR_IMAGES.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (Platform.OS !== 'web') return resolve(false);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayCheckout = async () => {
        if (Platform.OS !== 'web') {
            setError('Payments are currently only supported via Desktop Web Browser.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

            const planAmount = isAnnual ? TIER_INFO[selectedTier].annualPrice : TIER_INFO[selectedTier].price;
            const durationMonths = isAnnual ? 12 : 1;
            // Extract numbers from "₹999" -> 999
            const numericAmount = parseInt(planAmount.replace(/[^0-9]/g, ''));

            // 1. Create order
            const orderRes = await api.post('/subscription/create-order', {
                amount: numericAmount,
                tier: selectedTier,
                durationMonths
            });

            // 2. Open Razorpay Interface
            const options = {
                key: 'rzp_test_123456789', // Match mock backend
                amount: orderRes.data.order.amount,
                currency: 'INR',
                name: 'IAS Suite',
                description: `${TIER_INFO[selectedTier].name} Subscription`,
                image: 'https://i.imgur.com/your-logo.png',
                order_id: orderRes.data.order.id,
                handler: async function (response: any) {
                    try {
                        await api.post('/subscription/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            tier: selectedTier,
                            durationMonths
                        });
                        setSuccess(true);
                        setTimeout(() => router.replace('/'), 1500);
                    } catch (e: any) {
                        alert(e.response?.data?.message || 'Payment Verification Failed');
                    }
                },
                theme: { color: TIER_INFO[selectedTier].color }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setError(response.error.description || 'Payment Failed');
            });
            rzp.open();

        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInstagramClick = async (tierName: string) => {
        const message = `Hi Spectrum IAS team! I'm interested in subscribing to the ${tierName || 'Premium'} plan. Please guide me with the steps!`;
        try {
            await Clipboard.setStringAsync(message);
            if (Platform.OS === 'web') {
                window.alert('✅ Message copied to clipboard! Paste it directly into the Instagram chat.');
            } else {
                alert('✅ Message copied to clipboard! Paste it directly into the Instagram chat.');
            }
        } catch (e) {
            console.error('Failed to copy to clipboard', e);
        }
        Linking.openURL('https://ig.me/m/spectrum_ias');
    };

    const statusLabel = user?.subscriptionStatus === 'rejected'
        ? '⚠️ Previous Payment Rejected'
        : user?.subscriptionStatus === 'expired'
            ? '⏰ Subscription Expired'
            : '🔒 Choose Your Plan';

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}
            contentContainerStyle={{ alignItems: 'center', padding: 24, paddingBottom: 60 }}
        >
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
                <Image
                    source={require('../assets/ias_logo.png')}
                    style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 12 }}
                />
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold' }}>
                    IAS — Intelligent Aspirant's Suite
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>
                    {statusLabel}
                </Text>
            </View>

            {/* Rejection Banner */}
            {rejectionNote ? (
                <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    padding: 14, borderRadius: 12, marginBottom: 16, width: '100%', maxWidth: 800,
                    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)'
                }}>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: 2 }}>⚠️ Previous submission rejected</Text>
                    <Text style={{ color: '#f87171', fontSize: 13 }}>Reason: {rejectionNote}</Text>
                </View>
            ) : null}

            {/* Current Plan Card (If Active) */}
            {user?.subscriptionStatus === 'active' && user?.subscriptionTier && (
                <View style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 16, padding: 24, marginBottom: 24, width: '100%', maxWidth: 800,
                    borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>My Active Plan</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 32, marginRight: 12 }}>{TIER_INFO[user.subscriptionTier as keyof typeof TIER_INFO]?.icon || '🛡️'}</Text>
                            <View>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>
                                    {TIER_INFO[user.subscriptionTier as keyof typeof TIER_INFO]?.name || user.subscriptionTier.toUpperCase()}
                                </Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>
                                    Valid until {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>ACTIVE</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Pricing Toggle */}
            {!showPayment && (
                <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 30, padding: 4, marginBottom: 24,
                    borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                }}>
                    <TouchableOpacity
                        onPress={() => setIsAnnual(false)}
                        style={{
                            paddingVertical: 10, paddingHorizontal: 24, borderRadius: 26,
                            backgroundColor: !isAnnual ? '#2563eb' : 'transparent',
                        }}
                    >
                        <Text style={{ color: !isAnnual ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold' }}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsAnnual(true)}
                        style={{
                            paddingVertical: 10, paddingHorizontal: 24, borderRadius: 26,
                            backgroundColor: isAnnual ? '#2563eb' : 'transparent',
                            flexDirection: 'row', alignItems: 'center', gap: 6
                        }}
                    >
                        <Text style={{ color: isAnnual ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold' }}>Annually</Text>
                        <View style={{ backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>SAVE</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* ====== TIER SELECTION ====== */}
            {!showPayment && (
                <>
                    <View style={{
                        width: '100%', maxWidth: 800,
                        flexDirection: 'row', flexWrap: 'wrap', gap: 14,
                        justifyContent: 'center',
                    }}>
                        {TIERS.map((tierKey) => {
                            const info = TIER_INFO[tierKey];
                            const features = TIER_FEATURES[tierKey];
                            const isSelected = selectedTier === tierKey;
                            return (
                                <TouchableOpacity
                                    key={tierKey}
                                    onPress={() => setSelectedTier(tierKey)}
                                    activeOpacity={0.85}
                                    style={{
                                        flex: 1, minWidth: 220, maxWidth: 260,
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        borderRadius: 20, overflow: 'hidden',
                                        borderWidth: 2,
                                        borderColor: isSelected ? info.color : (isDark ? '#374151' : '#e5e7eb'),
                                        elevation: isSelected ? 8 : 2,
                                        shadowColor: isSelected ? info.color : '#000',
                                        shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                                        shadowOpacity: isSelected ? 0.3 : 0.05,
                                        shadowRadius: isSelected ? 8 : 2,
                                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                                    }}
                                >
                                    {/* Tier Header */}
                                    <View style={{
                                        backgroundColor: isSelected ? info.color : (isDark ? '#374151' : '#f3f4f6'),
                                        paddingVertical: 16, alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 26 }}>{info.icon}</Text>
                                        <Text style={{
                                            color: isSelected ? 'white' : (isDark ? '#d1d5db' : '#374151'),
                                            fontSize: 16, fontWeight: 'bold', marginTop: 4,
                                        }}>
                                            {info.name}
                                        </Text>
                                        <Text style={{
                                            color: isSelected ? 'white' : info.color,
                                            fontSize: 28, fontWeight: 'bold', marginTop: 2,
                                        }}>
                                            {isAnnual ? info.annualPrice : info.price}
                                        </Text>
                                        <Text style={{
                                            color: isSelected ? 'rgba(255,255,255,0.7)' : (isDark ? '#9ca3af' : '#6b7280'),
                                            fontSize: 11,
                                        }}>
                                            {isAnnual ? 'per year' : 'per month'}
                                        </Text>
                                        {isAnnual && (
                                            <View style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${info.color}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 6 }}>
                                                <Text style={{ color: isSelected ? 'white' : info.color, fontSize: 10, fontWeight: 'bold' }}>{info.annualSavings}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Features */}
                                    <View style={{ padding: 16 }}>
                                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
                                            {info.tagline}
                                        </Text>
                                        {features.map((f, i) => (
                                            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7, gap: 8 }}>
                                                <Ionicons
                                                    name={i === 0 && tierKey !== 'foundation' ? 'arrow-up-circle' : 'checkmark-circle'}
                                                    size={15}
                                                    color={i === 0 && tierKey !== 'foundation' ? '#22c55e' : info.color}
                                                    style={{ marginTop: 1 }}
                                                />
                                                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, flex: 1 }}>{f}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Select Badge */}
                                    {isSelected && (
                                        <View style={{ backgroundColor: info.color, paddingVertical: 8, alignItems: 'center' }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>✓ SELECTED</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Continue / Request Button */}
                    <TouchableOpacity
                        onPress={handleRazorpayCheckout}
                        disabled={loading}
                        style={{
                            marginTop: 24, width: '100%', maxWidth: 400,
                            backgroundColor: loading ? '#6b7280' : TIER_INFO[selectedTier].color,
                            padding: 16, borderRadius: 14, alignItems: 'center',
                            flexDirection: 'row', justifyContent: 'center', gap: 8,
                        }}
                    >
                        {loading ? <ActivityIndicator color="white" /> : (
                            <>
                                <Ionicons name="flash" size={20} color="white" />
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                    Request {TIER_INFO[selectedTier].name} Plan
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Instagram DM Button */}
                    <TouchableOpacity
                        onPress={() => handleInstagramClick(TIER_INFO[selectedTier]?.name)}
                        style={{
                            marginTop: 16, width: '100%', maxWidth: 400,
                            backgroundColor: '#E1306C',
                            padding: 16, borderRadius: 14, alignItems: 'center',
                            flexDirection: 'row', justifyContent: 'center', gap: 8,
                        }}
                    >
                        <Ionicons name="logo-instagram" size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            Message us on Instagram to Subscribe
                        </Text>
                    </TouchableOpacity>

                    {/* Error / Success Overlay */}
                    {error ? (
                        <View style={{ marginTop: 16, backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                            <Text style={{ color: '#ef4444', textAlign: 'center', fontSize: 13 }}>{error}</Text>
                        </View>
                    ) : null}
                    {success ? (
                        <View style={{ marginTop: 16, backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.4)' }}>
                            <Ionicons name="checkmark-circle" size={30} color="#22c55e" />
                            <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 15, marginTop: 6 }}>Request Sent Successfully!</Text>
                            <Text style={{ color: '#86efac', fontSize: 13, marginTop: 2, textAlign: 'center' }}>You've been granted 3-day temporary access! Redirecting to Dashboard...</Text>
                        </View>
                    ) : null}
                </>
            )}


            {/* ====== INDEPENDENT ADD-ONS ====== */}
            {!showPayment && (
                <View style={{ width: '100%', maxWidth: 800, marginTop: 40, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 30, alignItems: 'center' }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Independent Add-Ons</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>Enhance your preparation with these standalone features</Text>

                    <View style={{
                        width: '100%', backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderRadius: 20, padding: 24, borderWidth: 1,
                        borderColor: TIER_INFO['notes-addon'].color, elevation: 4, shadowColor: TIER_INFO['notes-addon'].color, shadowOpacity: 0.15, shadowRadius: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20
                    }}>
                        <View style={{ flex: 1, minWidth: 200 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Text style={{ fontSize: 24 }}>{TIER_INFO['notes-addon'].icon}</Text>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>{TIER_INFO['notes-addon'].name}</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 13 }}>{TIER_INFO['notes-addon'].tagline}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                <Text style={{ color: TIER_INFO['notes-addon'].color, fontSize: 28, fontWeight: 'bold' }}>{isAnnual ? TIER_INFO['notes-addon'].annualPrice : TIER_INFO['notes-addon'].price}</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{isAnnual ? '/ year' : '/ month'}</Text>
                            </View>
                            {isAnnual && <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold', marginTop: 4 }}>{TIER_INFO['notes-addon'].annualSavings}</Text>}
                        </View>

                        <TouchableOpacity
                            onPress={() => setSelectedTier('notes-addon')}
                            style={{
                                width: '100%', backgroundColor: selectedTier === 'notes-addon' ? TIER_INFO['notes-addon'].color : 'transparent',
                                padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: TIER_INFO['notes-addon'].color,
                                marginTop: 10
                            }}>
                            <Text style={{ color: selectedTier === 'notes-addon' ? 'white' : TIER_INFO['notes-addon'].color, fontWeight: 'bold' }}>
                                {selectedTier === 'notes-addon' ? '✓ Selected' : 'Select Notes Plan'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ====== TRANSACTION HISTORY ====== */}
            {!showPayment && history.length > 0 && (
                <View style={{ width: '100%', maxWidth: 800, marginTop: 40, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 20 }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Transaction History</Text>
                    {history.map((tx, idx) => (
                        <View key={idx} style={{
                            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                            backgroundColor: isDark ? '#1f2937' : 'white', padding: 16, borderRadius: 12,
                            marginBottom: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
                        }}>
                            <View>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold' }}>Requested: {tx.requestedTier ? tx.requestedTier.toUpperCase() : 'Tier Upgrade'}</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 4 }}>
                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={{
                                    backgroundColor: tx.status === 'approved' ? 'rgba(34,197,94,0.1)' : tx.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
                                }}>
                                    <Text style={{
                                        color: tx.status === 'approved' ? '#22c55e' : tx.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                        fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize'
                                    }}>
                                        {tx.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Logout link */}
            <TouchableOpacity onPress={logout} style={{ marginTop: 24, padding: 12 }}>
                <Text style={{ color: '#ef4444', fontSize: 13 }}>← Sign out & use different account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
