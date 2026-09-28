import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { hasAccess, getRequiredTier, TIER_INFO, TIER_FEATURES } from '../services/tierConfig';
import { Ionicons } from '@expo/vector-icons';

export default function FeatureGate({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const pathname = usePathname();
    const router = useRouter();

    // Admins bypass all gates
    if (user?.role === 'admin') return <>{children}</>;

    // If user has access to the current route, render children
    const userTier = user?.subscriptionTier || 'foundation';
    if (hasAccess(userTier, pathname)) return <>{children}</>;

    // User doesn't have access — show upgrade card
    const requiredTier = getRequiredTier(pathname);
    const tierInfo = TIER_INFO[requiredTier];
    const features = TIER_FEATURES[requiredTier] || [];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 60, minHeight: '100%' }}
        >
            {/* Lock Icon */}
            <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: `${tierInfo.color}20`,
                justifyContent: 'center', alignItems: 'center', marginBottom: 20,
                borderWidth: 2, borderColor: `${tierInfo.color}40`
            }}>
                <Ionicons name="lock-closed" size={36} color={tierInfo.color} />
            </View>

            {/* Title */}
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
                {tierInfo.icon} {tierInfo.name} Feature
            </Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 22, maxWidth: 360 }}>
                This feature requires the <Text style={{ color: tierInfo.color, fontWeight: 'bold' }}>{tierInfo.name}</Text> plan or higher. Upgrade to unlock full access.
            </Text>

            {/* Pricing Card */}
            <View style={{
                width: '100%', maxWidth: 380, marginTop: 28,
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderRadius: 20, overflow: 'hidden',
                borderWidth: 2, borderColor: tierInfo.color,
                elevation: 6, shadowColor: tierInfo.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
            }}>
                {/* Header */}
                <View style={{ backgroundColor: tierInfo.color, paddingVertical: 16, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', opacity: 0.9 }}>
                        {tierInfo.icon} {tierInfo.name.toUpperCase()} PLAN
                    </Text>
                    <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 }}>
                        {tierInfo.price}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>per month</Text>
                </View>

                {/* Features */}
                <View style={{ padding: 20 }}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, fontWeight: '600', marginBottom: 14 }}>
                        What you'll unlock:
                    </Text>
                    {features.map((feat, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                            <Ionicons
                                name={i === 0 && requiredTier !== 'foundation' ? 'arrow-up-circle' : 'checkmark-circle'}
                                size={18}
                                color={i === 0 && requiredTier !== 'foundation' ? '#22c55e' : tierInfo.color}
                            />
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, flex: 1 }}>
                                {feat}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Upgrade Button */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => router.push('/subscription' as any)}
                        style={{
                            backgroundColor: tierInfo.color,
                            padding: 16, borderRadius: 14, alignItems: 'center',
                            flexDirection: 'row', justifyContent: 'center', gap: 8
                        }}
                    >
                        <Ionicons name="rocket" size={18} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            Upgrade to {tierInfo.name}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Current Plan Badge */}
            <View style={{
                marginTop: 20,
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
                borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
            }}>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                    Your current plan: <Text style={{ color: TIER_INFO[userTier]?.color || '#9ca3af', fontWeight: 'bold' }}>
                        {TIER_INFO[userTier]?.icon} {TIER_INFO[userTier]?.name || 'Foundation'}
                    </Text>
                </Text>
            </View>
        </ScrollView>
    );
}
