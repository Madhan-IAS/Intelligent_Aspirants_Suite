import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function PendingApprovalScreen() {
    const router = useRouter();
    const { user, logout, login } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [checking, setChecking] = useState(false);
    const [utr, setUtr] = useState('');
    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.8)).current;

    // Breathing pulse animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Fetch UTR on mount
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/subscription/my-status');
            if (res.data.latestProof?.utrNumber) {
                setUtr(res.data.latestProof.utrNumber);
            }
        } catch (e) {
            // Non-critical
        }
    };

    const checkStatus = async () => {
        setChecking(true);
        // Spin animation
        Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => {
            spinAnim.setValue(0);
        });

        try {
            const res = await api.get('/subscription/my-status');
            if (res.data.subscriptionStatus === 'active') {
                // Re-fetch profile to update auth context
                const profileRes = await api.get('/auth/profile');
                const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('token');
                if (token) {
                    await login(token, null, profileRes.data);
                }
                router.replace('/');
            } else if (res.data.subscriptionStatus === 'rejected') {
                router.replace('/subscription');
            }
        } catch (e) {
            // Continue showing pending
        } finally {
            setChecking(false);
        }
    };

    // Auto-check every 30 seconds
    useEffect(() => {
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{
                width: '100%', maxWidth: 448,
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                padding: 40, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                alignItems: 'center',
                elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10
            }}>
                {/* Pulsing Icon */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 24 }}>
                    <View style={{
                        width: 100, height: 100, borderRadius: 50,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: 3, borderColor: 'rgba(37, 99, 235, 0.3)'
                    }}>
                        <Ionicons name="hourglass-outline" size={44} color="#2563eb" />
                    </View>
                </Animated.View>

                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
                    Payment Under Review
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                    Your payment proof has been submitted successfully. Our admin will verify and approve your account shortly.
                </Text>

                {/* UTR Badge */}
                {utr ? (
                    <View style={{
                        backgroundColor: isDark ? '#111827' : '#f0f9ff',
                        paddingVertical: 10, paddingHorizontal: 20,
                        borderRadius: 24, marginTop: 20,
                        borderWidth: 1, borderColor: isDark ? '#1e3a5f' : '#bfdbfe'
                    }}>
                        <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: 13, fontWeight: '600' }}>
                            UTR: {utr}
                        </Text>
                    </View>
                ) : null}

                {/* Timeline */}
                <View style={{ marginTop: 32, width: '100%', gap: 16 }}>
                    {[
                        { icon: 'checkmark-circle', label: 'Account Created', done: true },
                        { icon: 'checkmark-circle', label: 'Payment Proof Submitted', done: true },
                        { icon: 'time', label: 'Admin Verification', done: false, active: true },
                        { icon: 'ellipse-outline', label: 'Full Access Granted', done: false },
                    ].map((step, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Ionicons
                                name={step.done ? 'checkmark-circle' : step.active ? 'time' : 'ellipse-outline'}
                                size={22}
                                color={step.done ? '#22c55e' : step.active ? '#f59e0b' : (isDark ? '#4b5563' : '#d1d5db')}
                            />
                            <Text style={{
                                color: step.done ? '#22c55e' : step.active ? '#f59e0b' : (isDark ? '#6b7280' : '#9ca3af'),
                                fontSize: 14,
                                fontWeight: step.active ? 'bold' : 'normal'
                            }}>
                                {step.label} {step.active ? '⏳' : ''}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Check Status Button */}
                <TouchableOpacity
                    onPress={checkStatus}
                    disabled={checking}
                    style={{
                        marginTop: 32, width: '100%',
                        backgroundColor: isDark ? '#1e3a5f' : '#eff6ff',
                        padding: 16, borderRadius: 12, alignItems: 'center',
                        flexDirection: 'row', justifyContent: 'center', gap: 8,
                        borderWidth: 1, borderColor: isDark ? '#2563eb40' : '#bfdbfe'
                    }}
                >
                    {checking ? (
                        <ActivityIndicator color="#2563eb" size="small" />
                    ) : (
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name="refresh" size={18} color="#2563eb" />
                        </Animated.View>
                    )}
                    <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 15 }}>
                        {checking ? 'Checking...' : 'Check Approval Status'}
                    </Text>
                </TouchableOpacity>

                <Text style={{ color: isDark ? '#4b5563' : '#9ca3af', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                    Auto-checking every 30 seconds
                </Text>
            </View>

            {/* Logout link */}
            <TouchableOpacity onPress={logout} style={{ marginTop: 24, padding: 12 }}>
                <Text style={{ color: '#ef4444', fontSize: 14 }}>← Sign out</Text>
            </TouchableOpacity>
        </View>
    );
}
