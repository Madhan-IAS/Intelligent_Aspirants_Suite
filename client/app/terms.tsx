import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

export default function TermsOfService() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: isDark ? '#1f2937' : 'white', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : '#111827'} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#111827' }}>Terms of Service</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: isDark ? 'white' : '#111827', marginBottom: 8 }}>
                    Intelligent Aspirant's Suite (IAS)
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 32 }}>
                    Last Updated: October 3, 2026
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    1. Acceptance of Terms
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    By creating an account, subscribing, or using the IASuite platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please refrain from using the Service.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    2. Educational Purpose & Account Usage
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    IASuite is designed exclusively for UPSC CSE aspirants. Your account is strictly personal. Sharing login credentials, scraping curated Notes/PYQs, or redistributing AI-generated insights for commercial coaching purposes is strictly prohibited and will result in immediate termination of access without refund.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    3. Subscriptions, Payments & IASuite Notes Add-on
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    The platform operates on a tiered subscription model (Foundation, Aspirant, Topper). The "IASuite Notes" plan operates as an independent add-on. Due to the digital and instantly consumable nature of our curated study materials, all subscription payments (including the Notes Add-on) are **strictly non-refundable** once the payment successfully clears and the account is upgraded.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    4. AI-Generated Content Constraints
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    Features like "Mission Engine", "AI Notes", and "Answer Evaluation" utilize external LLM APIs (e.g., OpenAI, Gemini). While we aggressively prompt these engines to strictly adhere to the UPSC syllabus, the AI may occasionally hallucinate or provide slightly inaccurate data. It is the aspirant's responsibility to verify critical statistics or constitutional articles before relying on them for the actual Mains examination.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    5. Intellectual Property
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    All static materials, including GS/Sociology Notes, Timetable Architectures, custom SVG Mind Maps, and platform code are the exclusive intellectual property of the Intelligent Aspirant's Suite.
                </Text>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
