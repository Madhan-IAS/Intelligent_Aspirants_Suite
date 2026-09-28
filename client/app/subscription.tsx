import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { TIER_INFO, TIER_FEATURES } from '../src/services/tierConfig';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';

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

    const handleSubmitProof = async () => {
        if (!utrNumber.trim()) {
            setError('Please enter your UTR / Transaction ID');
            return;
        }
        if (utrNumber.trim().length < 6) {
            setError('UTR number seems too short. Please check again.');
            return;
        }

        setLoading(true);
        setError('');
        const info = TIER_INFO[selectedTier];
        const amount = isAnnual ? info?.annualPriceNum : info?.priceNum;

        try {
            await api.post('/subscription/submit-proof', {
                utrNumber: utrNumber.trim(),
                amount: amount || 99,
            });
            setSuccess(true);
            setTimeout(() => router.replace('/pending-approval'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit payment proof');
        } finally {
            setLoading(false);
        }
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
            {!showPayment ? (
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

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={() => setShowPayment(true)}
                        style={{
                            marginTop: 24, width: '100%', maxWidth: 400,
                            backgroundColor: TIER_INFO[selectedTier].color,
                            padding: 16, borderRadius: 14, alignItems: 'center',
                            flexDirection: 'row', justifyContent: 'center', gap: 8,
                        }}
                    >
                        <Ionicons name="card" size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            Continue with {TIER_INFO[selectedTier].name} — {isAnnual ? TIER_INFO[selectedTier].annualPrice : TIER_INFO[selectedTier].price}/{isAnnual ? 'yr' : 'mo'}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                /* ====== PAYMENT SCREEN ====== */
                <View style={{
                    width: '100%', maxWidth: 448,
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 20, overflow: 'hidden',
                    borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                    elevation: 8,
                }}>
                    {/* Amount Banner */}
                    <View style={{
                        backgroundColor: TIER_INFO[selectedTier].color,
                        paddingVertical: 18, alignItems: 'center',
                    }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 1 }}>
                            {TIER_INFO[selectedTier].icon} {TIER_INFO[selectedTier].name.toUpperCase()} PLAN
                        </Text>
                        <Text style={{ color: 'white', fontSize: 34, fontWeight: 'bold', marginTop: 4 }}>
                            {isAnnual ? TIER_INFO[selectedTier].annualPrice : TIER_INFO[selectedTier].price}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>{isAnnual ? 'per year' : 'per month'}</Text>
                        <TouchableOpacity onPress={() => setShowPayment(false)} style={{ marginTop: 8 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, textDecorationLine: 'underline' }}>
                                ← Change plan
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 24 }}>
                        {/* QR Code */}
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, fontWeight: '600', marginBottom: 14 }}>
                                📱 Scan QR to Pay via UPI
                            </Text>
                            <Animated.View style={{
                                opacity: fadeAnim,
                                backgroundColor: 'white', padding: 10, borderRadius: 14,
                                elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
                            }}>
                                <Image
                                    source={QR_IMAGES[currentQR]}
                                    style={{ width: 180, height: 180, borderRadius: 8 }}
                                    resizeMode="contain"
                                />
                            </Animated.View>
                            <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
                                {QR_IMAGES.map((_, i) => (
                                    <View key={i} style={{
                                        width: 7, height: 7, borderRadius: 4,
                                        backgroundColor: i === currentQR ? TIER_INFO[selectedTier].color : (isDark ? '#4b5563' : '#d1d5db'),
                                    }} />
                                ))}
                            </View>
                        </View>

                        {/* UPI Details */}
                        <View style={{
                            backgroundColor: isDark ? '#111827' : '#f0f9ff',
                            padding: 14, borderRadius: 12, marginBottom: 20,
                            borderWidth: 1, borderColor: isDark ? '#1e3a5f' : '#bfdbfe',
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>UPI ID</Text>
                                <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 'bold', fontSize: 12 }}>{UPI_ID}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Mobile</Text>
                                <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 'bold', fontSize: 12 }}>{UPI_MOBILE}</Text>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', marginHorizontal: 12, fontSize: 11 }}>AFTER PAYMENT</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                        </View>

                        {/* Error */}
                        {error ? (
                            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 10, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                                <Text style={{ color: '#ef4444', textAlign: 'center', fontSize: 13 }}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Success */}
                        {success ? (
                            <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.4)' }}>
                                <Ionicons name="checkmark-circle" size={30} color="#22c55e" />
                                <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 15, marginTop: 6 }}>Payment Proof Submitted!</Text>
                                <Text style={{ color: '#86efac', fontSize: 12, marginTop: 2 }}>Redirecting...</Text>
                            </View>
                        ) : (
                            <>
                                {/* UTR Input */}
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 6, fontWeight: '500', fontSize: 13 }}>
                                        UTR / Transaction Reference Number
                                    </Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: isDark ? '#111827' : '#f9fafb',
                                            color: isDark ? 'white' : '#111827',
                                            padding: 14, borderRadius: 12,
                                            borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                                            fontSize: 14, letterSpacing: 0.5,
                                            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                                        } as any}
                                        placeholder="Enter 12-digit UTR number"
                                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                        value={utrNumber}
                                        onChangeText={setUtrNumber}
                                        autoCapitalize="characters"
                                    />
                                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, marginTop: 4 }}>
                                        💡 Find UTR in your UPI app's transaction history
                                    </Text>
                                </View>

                                {/* Submit */}
                                <TouchableOpacity
                                    onPress={handleSubmitProof}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: loading ? '#6b7280' : TIER_INFO[selectedTier].color,
                                        padding: 15, borderRadius: 12, alignItems: 'center',
                                        flexDirection: 'row', justifyContent: 'center', gap: 8,
                                    }}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : (
                                        <>
                                            <Ionicons name="send" size={17} color="white" />
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Submit Payment Proof</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
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
                                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold' }}>UTR: {tx.utrNumber}</Text>
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
