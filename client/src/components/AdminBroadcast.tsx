import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AdminBroadcast() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            setToast({ message: 'Title and message are required', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (Platform.OS === 'web') {
            if (!window.confirm(`Are you sure you want to broadcast this message to ALL active users?\n\n"${title}"`)) return;
        }

        setLoading(true);
        try {
            const res = await api.post('/admin/broadcast', { title, message, type: 'system' });
            setToast({ message: `✅ ${res.data.message}`, type: 'success' });
            setTitle('');
            setMessage('');
        } catch (e: any) {
            console.error('Broadcast error:', e);
            setToast({ message: `❌ Error: ${e.response?.data?.message || e.message}`, type: 'error' });
        }
        setLoading(false);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            {toast && (
                <View style={{
                    position: 'absolute', top: -10, left: 0, right: 0, zIndex: 10,
                    alignItems: 'center'
                }}>
                    <View style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <Ionicons name={toast.type === 'success' ? "checkmark-circle" : "alert-circle"} size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>{toast.message}</Text>
                    </View>
                </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 12 }}>
                    <Ionicons name="megaphone" size={24} color="#3b82f6" />
                </View>
                <View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Global Broadcast</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 2 }}>Instantly push a notification to every user's dashboard</Text>
                </View>
            </View>

            <View style={{ gap: 16 }}>
                <View>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8 }}>Notification Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., Target CSE 2026 Batch Started"
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        style={{
                            backgroundColor: isDark ? '#374151' : '#f9fafb',
                            color: isDark ? 'white' : '#111827',
                            padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb'
                        }}
                    />
                </View>

                <View>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8 }}>Message Body</Text>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type the full message payload..."
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        multiline
                        style={{
                            backgroundColor: isDark ? '#374151' : '#f9fafb',
                            color: isDark ? 'white' : '#111827',
                            padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb',
                            minHeight: 120, textAlignVertical: 'top'
                        }}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleBroadcast}
                    disabled={loading}
                    style={{
                        backgroundColor: '#3b82f6',
                        paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                        marginTop: 10
                    }}
                >
                    {loading ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="send" size={18} color="white" />}
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>DISPATCH BROADCAST</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
