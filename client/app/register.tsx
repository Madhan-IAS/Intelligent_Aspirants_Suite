import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/send-otp', { mobile });
      // If devOtp is provided via backend, we could console.log it or auto-fill for dev convenience.
      if (res.data.devOtp) {
        console.log("Dev OTP:", res.data.devOtp);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { mobile, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !username || !password || !mobile) {
      setError('Please fill in all fields');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to register.');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    if (!cleanUsername) {
      setError('Please enter a valid username');
      return;
    }

    const email = `${cleanUsername}@upsc.kms`;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        mobile
      });
      await login(res.data.token, res.data.refreshToken, res.data.user);
      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      <View style={{ width: '100%', maxWidth: 448, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 32, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 }}>

        {/* Header/Logo */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Image
            source={require('../assets/ias_logo.png')}
            style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 16 }}
          />
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>IAS</Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>Create Your Aspirant Account</Text>
        </View>

        {/* Error Notification */}
        {error ? (
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)' }}>
            <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}

        {/* Form Inputs & Stages */}
        <View style={{ gap: 16, marginBottom: 24 }}>

          {/* STEP 1: MOBILE NUMBER ENTRY */}
          {step === 1 && (
            <View>
              <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Mobile Number</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', paddingLeft: 16, fontSize: 16, fontWeight: 'bold' }}>+91</Text>
                <TextInput
                  style={{ flex: 1, color: isDark ? 'white' : '#111827', padding: 16, outlineStyle: Platform.OS === 'web' ? 'none' : undefined, fontSize: 16, letterSpacing: 2 } as any}
                  placeholder="9876543210"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={mobile}
                  onChangeText={(val) => setMobile(val.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <View>
              <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Enter 6-Digit OTP</Text>
              <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 12 }}>Sent securely to +91 {mobile}</Text>
              <TextInput
                style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: Platform.OS === 'web' ? 'none' : undefined, letterSpacing: 8, textAlign: 'center', fontSize: 24, fontWeight: 'bold' } as any}
                placeholder="••••••"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={otp}
                onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity onPress={() => { setStep(1); setOtp(''); }} style={{ marginTop: 12 }}>
                <Text style={{ color: '#2563eb', textAlign: 'center', fontSize: 12 }}>Change Mobile Number</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: FINAL ACCOUNT DETAILS */}
          {step === 3 && (
            <>
              {/* Full Name */}
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Full Name</Text>
                <TextInput
                  style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: Platform.OS === 'web' ? 'none' : undefined } as any}
                  placeholder="Madhan Mohan"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Username prefix with static @upsc.kms suffix */}
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Username</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#e5e7eb'
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      color: isDark ? 'white' : '#111827',
                      padding: 16,
                      outlineStyle: Platform.OS === 'web' ? 'none' : undefined
                    } as any}
                    placeholder="madhan"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    value={username}
                    onChangeText={(val) => setUsername(val.replace(/[^a-zA-Z0-9._-]/g, ''))}
                    autoCapitalize="none"
                  />
                  <Text style={{
                    color: isDark ? '#9ca3af' : '#4b5563',
                    fontWeight: 'bold',
                    fontSize: 14,
                    paddingRight: 16
                  }}>
                    @upsc.kms
                  </Text>
                </View>
              </View>

              {/* Password */}
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Password</Text>
                <TextInput
                  style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: Platform.OS === 'web' ? 'none' : undefined } as any}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Consent Toggle */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <Ionicons
                  name={acceptedTerms ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={acceptedTerms ? "#2563eb" : (isDark ? "#4b5563" : "#9ca3af")}
                />
                <Text style={{ marginLeft: 8, color: isDark ? '#9ca3af' : '#4b5563', flex: 1, lineHeight: 20 }}>
                  I agree to the <Link href="/terms" style={{ color: '#2563eb', fontWeight: 'bold' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: '#2563eb', fontWeight: 'bold' }}>Privacy Policy</Link>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Dynamic Action Button */}
        <TouchableOpacity
          onPress={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleRegister}
          disabled={loading || (step === 3 && !acceptedTerms)}
          style={{
            backgroundColor: (loading || (step === 3 && !acceptedTerms)) ? (isDark ? '#374151' : '#d1d5db') : '#2563eb',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: (step === 3 && !acceptedTerms) ? (isDark ? '#9ca3af' : '#6b7280') : 'white', fontWeight: 'bold', fontSize: 18 }}>
              {step === 1 ? 'Get OTP' : step === 2 ? 'Verify OTP' : 'Complete Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle to Login */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
