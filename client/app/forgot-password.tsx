import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function ForgotPassword() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [devOtp, setDevOtp] = useState('');

    const handleSendOtp = async () => {
        if (!email) {
            setErrorMsg('Please enter your email.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            // By pass auth interceptor by using base api
            const res = await api.post('/auth/forgot-password', { email });
            if (res.data.devOtp) {
                setDevOtp(res.data.devOtp);
            }
            setStep(2);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            setErrorMsg('Please enter both OTP and new password.');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            alert('Password reset successfully! You can now log in.');
            router.replace('/login');
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
            <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>

                <View style={{ position: 'absolute', top: 50, left: 24 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
                    </TouchableOpacity>
                </View>

                <View style={{ width: '100%', maxWidth: 400, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="lock-closed" size={32} color="#8b5cf6" />
                        </View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Reset Password</Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginTop: 8 }}>
                            {step === 1 ? 'Enter your registered email to receive an OTP.' : 'Enter the OTP and your new password.'}
                        </Text>
                    </View>

                    {errorMsg ? (
                        <View style={{ backgroundColor: '#ef444420', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                            <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>{errorMsg}</Text>
                        </View>
                    ) : null}

                    {step === 1 ? (
                        <>
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Email Address</Text>
                                <TextInput
                                    style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                                    placeholder="aspirant@example.com"
                                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSendOtp}
                                disabled={loading}
                                style={{ backgroundColor: '#8b5cf6', padding: 16, borderRadius: 12, alignItems: 'center' }}
                            >
                                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Send OTP</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {devOtp ? (
                                <View style={{ backgroundColor: '#10b98120', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#10b981' }}>
                                    <Text style={{ color: '#10b981', textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>Mock Dev OTP: {devOtp}</Text>
                                </View>
                            ) : null}

                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>OTP Code</Text>
                                <TextInput
                                    style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                                    placeholder="Enter 6-digit OTP"
                                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>New Password</Text>
                                <TextInput
                                    style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                                    placeholder="Enter new 6+ characters password"
                                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={loading}
                                style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' }}
                            >
                                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Confirm Reset</Text>}
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
