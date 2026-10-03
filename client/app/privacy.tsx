import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

export default function PrivacyPolicy() {
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
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#111827' }}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: isDark ? 'white' : '#111827', marginBottom: 8 }}>
                    Privacy Policy
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 32 }}>
                    Last Updated: October 3, 2026
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    1. Data We Collect
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    We collect standard account information needed to provide the service: Full Name, email address, mobile number (exclusively for OTP verification and secure account recovery), and encrypted passwords. We also store your UPSC-specific study metadata: target attempt year, optional subjects, daily study hours, and submitted essays/answers.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    2. How Your Data is Used
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    Your metadata is strictly utilized to power the platform's features, specifically: tailoring the Timetable generation, tracking syllabus completion via the 'Mission Engine', and supplying our AI models with sufficient context to accurately evaluate your uploaded Answer Writing practice.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    3. AI Telemetry & Third Parties
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    When requesting AI text evaluations or flashcard generation, the text of your query is securely transmitted to our backend and temporarily routed to our LLM partners (e.g. OpenAI/Google Gemini). Personally Identifying Information (PII) like your mobile number or passwords are never sent to these engines. We **never** sell your data or attempt history to third-party UPSC coaching conglomerates.
                </Text>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? 'white' : '#1f2937', marginTop: 24, marginBottom: 12 }}>
                    4. Security & Encryption
                </Text>
                <Text style={{ fontSize: 16, color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>
                    All user passwords and OTP authentication tokens are salted and hashed utilizing bcrypt. All internal traffic is encrypted. You grant the platform administrators the right to view your raw metadata strictly for Customer Support troubleshooting or subscription administration.
                </Text>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
