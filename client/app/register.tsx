import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !username || !password) {
      setError('Please fill in all fields');
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
        password 
      });
      await login(res.data.token, res.data.user);
      router.replace('/');
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

        {/* Form Inputs */}
        <View style={{ gap: 16, marginBottom: 24 }}>
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
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleRegister}
          disabled={loading}
          style={{ backgroundColor: loading ? '#1e40af' : '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Sign Up</Text>}
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
