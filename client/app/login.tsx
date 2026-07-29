import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.token, res.data.user);
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
      await login(res.data.token, res.data.user);
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
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image 
            source={require('../assets/ias_logo.png')} 
            style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }} 
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
            />
          </View>

          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Password</Text>
            <TextInput 
              style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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

        <View style={{ position: 'relative', alignItems: 'center', paddingVertical: 16 }}>
          <View style={{ position: 'absolute', top: '50%', width: '100%', borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }} />
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>OR</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleDevLogin}
          disabled={loading}
          style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}
        >
          <Ionicons name="code-slash" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginRight: 8 }} />
          <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold' }}>Quick Dev Login (Auto-seed)</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
