import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const handleStandardLogin = async () => {
    if (!email || !password || !mobile) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password, mobile });
      await login(res.data.token, res.data.refreshToken, res.data.user);
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/dev-login');
      await login(res.data.token, res.data.refreshToken, res.data.user);
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Dev Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>

      <View style={{ width: '100%', maxWidth: 448, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 32, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 }}>
        {showBanner && (
          <View style={{ backgroundColor: '#2563eb', padding: 16, borderRadius: 12, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
              <Ionicons name="logo-android" size={28} color="white" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>IAS Android App (Beta) is here!</Text>
                <Text style={{ color: '#dbeafe', fontSize: 12, marginTop: 4 }}>Download the APK directly while we finalize our Play Store launch.</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://drive.google.com/file/d/1Bi1ZBjlV2MGeCoVMm7KU1pueompzQTKC/view?usp=drive_link')}
                style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 13 }}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowBanner(false)}>
                <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image
            source={require('../assets/ias_logo.png')}
            style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 16 }}
          />
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>IAS</Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>Intelligent Aspirant's Suite</Text>
        </View>

        {error ? (
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)' }}>
            <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ gap: 16, marginBottom: 24 }}>
          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Email Address</Text>
            <TextInput
              style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              placeholder="madhan@upsc.kms"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              id="email"
              autoComplete="email"
            />
          </View>

          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Mobile Number</Text>
            <TextInput
              style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              placeholder="9876543210"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={mobile}
              onChangeText={(val) => setMobile(val.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
              id="mobile"
              autoComplete="tel"
            />
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontWeight: '500' }}>Password</Text>
              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold' }}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              id="password"
              autoComplete="current-password"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStandardLogin}
          disabled={loading}
          style={{ backgroundColor: loading ? '#1e40af' : '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Login</Text>}
        </TouchableOpacity>

        {/* Toggle to Signup */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
