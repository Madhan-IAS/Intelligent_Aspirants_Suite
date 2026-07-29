import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';

export default function Profile() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile, logout } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const [saving, setSaving] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    targetAttempt: '',
    optionalSubject: '',
    dailyTargetHours: '',
    preferredRevisionPattern: '3-5-7',
    preferredSession: 'Morning',
    answerWriting: 'Daily',
    mockTest: 'Sunday'
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        targetAttempt: user.targetAttempt?.toString() || '',
        optionalSubject: user.optionalSubject || '',
        dailyTargetHours: user.dailyTargetHours?.toString() || '',
        preferredRevisionPattern: user.preferredRevisionPattern || '3-5-7',
        preferredSession: user.studyPreferences?.preferredSession || 'Morning',
        answerWriting: user.studyPreferences?.answerWriting || 'Daily',
        mockTest: user.studyPreferences?.mockTest || 'Sunday',
      });
    } else if (!authLoading) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const res = await api.get('/backup/export');
      const jsonStr = JSON.stringify(res.data, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ias_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      alert('Backup JSON exported successfully!');
    } catch (error) {
      console.error('Export backup error:', error);
      alert('Failed to export backup data.');
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        targetAttempt: parseInt(formData.targetAttempt) || undefined,
        optionalSubject: formData.optionalSubject,
        dailyTargetHours: parseInt(formData.dailyTargetHours) || undefined,
        preferredRevisionPattern: formData.preferredRevisionPattern,
        studyPreferences: {
          preferredSession: formData.preferredSession,
          answerWriting: formData.answerWriting,
          mockTest: formData.mockTest,
        }
      };
      await updateProfile(payload);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Personalization</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>User Profile</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <TouchableOpacity 
            onPress={logout}
            style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
          >
            <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            <Text style={{ color: '#f87171', fontWeight: 'bold', marginLeft: 6 }}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: saving ? '#1e40af' : '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
          >
            {saving ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="save" size={16} color="white" />}
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>{saving ? 'Saving...' : 'Save Profile'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Identity Card */}
      <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32, elevation: 3 }}>
        <View style={{ width: 70, height: 70, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: 35, borderWidth: 2, borderColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#60a5fa', fontSize: 32, fontWeight: 'bold' }}>{formData.name ? formData.name.charAt(0) : 'U'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput 
            style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', marginBottom: 4, padding: 0, outlineStyle: 'none' } as any}
            value={formData.name}
            onChangeText={(t) => setFormData({...formData, name: t})}
            placeholder="Your Name"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          />
          <TextInput 
            style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, padding: 0, outlineStyle: 'none' } as any}
            value={formData.bio}
            onChangeText={(t) => setFormData({...formData, bio: t})}
            placeholder="UPSC CSE Aspirant"
            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
          />
        </View>
      </View>

      <View style={{ flexDirection: Platform.OS === 'web' && window.innerWidth > 768 ? 'row' : 'column', gap: 24, marginBottom: 40 }}>
        
        {/* Core Strategy (Left Column) */}
        <View style={{ flex: 1, gap: 24 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Ionicons name="flag" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Core Strategy</Text>
            </View>
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Target Attempt (Year)</Text>
                <TextInput 
                  style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                  value={formData.targetAttempt}
                  onChangeText={(t) => setFormData({...formData, targetAttempt: t})}
                  keyboardType="numeric"
                  placeholder="2027"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
              </View>
              
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Optional Subject</Text>
                <TextInput 
                  style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                  value={formData.optionalSubject}
                  onChangeText={(t) => setFormData({...formData, optionalSubject: t})}
                  placeholder="e.g. Sociology, PSIR"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
              </View>

              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 8, fontWeight: '500' }}>Daily Target Hours</Text>
                <TextInput 
                  style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                  value={formData.dailyTargetHours}
                  onChangeText={(t) => setFormData({...formData, dailyTargetHours: t})}
                  keyboardType="numeric"
                  placeholder="e.g. 10"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Study Preferences (Right Column) */}
        <View style={{ flex: 1, gap: 24 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Ionicons name="settings" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Study Preferences</Text>
            </View>
            
            <View style={{ gap: 24 }}>
              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 12, fontWeight: '500' }}>Revision Engine Pattern</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {['3-5-7', '1-7-30'].map(pattern => {
                    const isActive = formData.preferredRevisionPattern === pattern;
                    return (
                      <TouchableOpacity 
                        key={pattern}
                        onPress={() => setFormData({...formData, preferredRevisionPattern: pattern})}
                        style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : (isDark ? '#111827' : '#f9fafb'), borderColor: isActive ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb') }}
                      >
                        <Text style={{ color: isActive ? '#60a5fa' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: isActive ? 'bold' : 'normal' }}>{pattern}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 12, fontWeight: '500' }}>Preferred Focus Session</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {['Morning', 'Afternoon', 'Night'].map(session => {
                    const isActive = formData.preferredSession === session;
                    return (
                      <TouchableOpacity 
                        key={session}
                        onPress={() => setFormData({...formData, preferredSession: session})}
                        style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: isActive ? 'rgba(249, 115, 22, 0.2)' : (isDark ? '#111827' : '#f9fafb'), borderColor: isActive ? '#f97316' : (isDark ? '#374151' : '#e5e7eb') }}
                      >
                        <Text style={{ color: isActive ? '#fb923c' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: isActive ? 'bold' : 'normal' }}>{session}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', marginBottom: 12, fontWeight: '500' }}>Answer Writing Frequency</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {['Daily', 'Weekly'].map(freq => {
                    const isActive = formData.answerWriting === freq;
                    return (
                      <TouchableOpacity 
                        key={freq}
                        onPress={() => setFormData({...formData, answerWriting: freq})}
                        style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: isActive ? 'rgba(34, 197, 94, 0.2)' : (isDark ? '#111827' : '#f9fafb'), borderColor: isActive ? '#22c55e' : (isDark ? '#374151' : '#e5e7eb') }}
                      >
                        <Text style={{ color: isActive ? '#4ade80' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: isActive ? 'bold' : 'normal' }}>{freq}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

            </View>
          </View>
          
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Ionicons name="notifications" size={20} color="#8b5cf6" style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Notification Settings</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: '500', fontSize: 16 }}>Daily Study Reminders</Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 4 }}>Receive a morning alert with ringtone to start studying.</Text>
              </View>
              <TouchableOpacity style={{ width: 48, height: 24, backgroundColor: '#8b5cf6', borderRadius: 12, padding: 2, justifyContent: 'center', alignItems: 'flex-end' }}>
                <View style={{ width: 20, height: 20, backgroundColor: 'white', borderRadius: 10 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Backup & Export Card */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="download" size={20} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Data Sovereignty & Backup</Text>
            </View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
              Export a complete JSON snapshot of all your preparation data — including topics, notes, answer attempts, current affairs, PYQs, revisions, and planner timetable.
            </Text>
            <TouchableOpacity 
              onPress={handleExportBackup}
              disabled={exporting}
              style={{ backgroundColor: exporting ? (isDark ? '#374151' : '#d1d5db') : '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="cloud-download-outline" size={20} color="white" style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                {exporting ? 'Exporting JSON Dump...' : 'Export Full Data Backup (JSON)'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

      </View>
    </ScrollView>
  );
}
