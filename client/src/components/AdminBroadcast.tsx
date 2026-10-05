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
    const [targetGroup, setTargetGroup] = useState<'all' | 'pending' | 'active' | 'optional'>('all');
    const [optionalSubject, setOptionalSubject] = useState('');
    const [template, setTemplate] = useState('custom');

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);

    const templates = [
        { id: 'custom', label: 'Custom', title: '', message: '' },
        { id: 'welcome', label: 'Welcome', title: 'Welcome to UPSC KMS!', message: 'Your subscription is active. Start your first GS topic.' },
        { id: 'payment', label: 'Payment Proof', title: 'Payment Verification', message: 'Please reply with your payment screenshot to avoid cancellation.' },
        { id: 'expiring', label: 'Expiring Soon', title: 'Subscription Expiring', message: 'Your premium access is expiring shortly. Please renew.' },
        { id: 'inactive', label: 'Inactive Warning', title: 'Are you falling behind?', message: 'Consistency is key! Log in now to keep your streak alive.' },
        { id: 'trial_start', label: 'Trial Started', title: 'Trial Active', message: 'Your 3-day premium trial is now active. Explore the dashboard.' },
        { id: 'trial_end', label: 'Trial Ends Soon', title: 'Trial Ending Tomorrow', message: 'Your trial ends tomorrow. Subscribe to keep full access.' },
        { id: 'doc_req', label: 'Doc Required', title: 'Document Verification', message: 'Please upload your ID proof or previous scorecards.' },
        { id: 'test_remind', label: 'Test Reminder', title: 'Weekly Test Due', message: 'Reminder: Complete your weekly topic test for evaluation.' },
        { id: 'mentor', label: 'Mentorship', title: 'Mentorship Scheduled', message: 'Your 1-on-1 mentoring session is coming up. Check your email.' },
        { id: 'optional', label: 'Optional Added', title: 'Optional Checklist Live 📚', message: 'Your Optional Paper breakdown and detailed syllabus checklist have been added to your planner. Start tracking your progress today!' }
    ];

    const handleTemplateChange = (tId: string) => {
        setTemplate(tId);
        const t = templates.find(x => x.id === tId);
        if (t && tId !== 'custom') {
            setTitle(t.title);
            setMessage(t.message);
        }
    };

    React.useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                const res = await api.get('/admin/audit-logs');
                const logs = res.data || [];
                setRecentBroadcasts(logs.filter((l: any) => l.action === 'BROADCAST').slice(0, 5));
            } catch (e) {
                console.error('Failed to fetch recent broadcasts for history', e);
            }
        };
        fetchBroadcasts();
    }, []);

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            setToast({ message: 'Title and message are required', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (Platform.OS === 'web') {
            let groupName = 'ALL users';
            if (targetGroup === 'active') groupName = 'ACTIVE users';
            else if (targetGroup === 'pending') groupName = 'PENDING users';
            else if (targetGroup === 'optional') groupName = `users assigned to ${optionalSubject || 'an unspecified'} optional`;

            if (!window.confirm(`Are you sure you want to broadcast this message to ${groupName}?\n\n"${title}"`)) return;
        }

        setLoading(true);
        try {
            const res = await api.post('/admin/broadcast', { title, message, type: 'system', targetGroup, optionalSubject });
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
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Bulk Broadcast</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 2 }}>Instantly push a notification to targeted user groups</Text>
                </View>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8 }}>Target Audience</Text>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: 'All Users' },
                        { id: 'active', label: 'Active Subscribers' },
                        { id: 'pending', label: 'Pending Approvals' },
                        { id: 'optional', label: 'Specific Optional' }
                    ].map(group => (
                        <TouchableOpacity
                            key={group.id}
                            onPress={() => setTargetGroup(group.id as any)}
                            style={{
                                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                                backgroundColor: targetGroup === group.id ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6'),
                                borderWidth: 1, borderColor: targetGroup === group.id ? '#3b82f6' : (isDark ? '#4b5563' : '#e5e7eb')
                            }}
                        >
                            <Text style={{ color: targetGroup === group.id ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold', fontSize: 13 }}>
                                {group.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {targetGroup === 'optional' && (
                    <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['Geography', 'PSIR', 'Sociology', 'Anthropology', 'Public Administration', 'History', 'Maths', 'Agriculture'].map(sub => (
                            <TouchableOpacity
                                key={sub}
                                onPress={() => setOptionalSubject(sub)}
                                style={{
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                                    backgroundColor: optionalSubject === sub ? 'rgba(16, 185, 129, 0.1)' : (isDark ? '#374151' : '#f3f4f6'),
                                    borderWidth: 1, borderColor: optionalSubject === sub ? '#10b981' : (isDark ? '#4b5563' : '#e5e7eb')
                                }}
                            >
                                <Text style={{ color: optionalSubject === sub ? '#10b981' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold', fontSize: 12 }}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8 }}>Message Template</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {templates.map(t => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => handleTemplateChange(t.id)}
                            style={{
                                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                                backgroundColor: template === t.id ? 'rgba(59, 130, 246, 0.1)' : (isDark ? '#374151' : '#f3f4f6'),
                                borderWidth: 1, borderColor: template === t.id ? '#3b82f6' : (isDark ? '#4b5563' : '#e5e7eb')
                            }}
                        >
                            <Text style={{ color: template === t.id ? '#3b82f6' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold', fontSize: 12 }}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold' }}>Message Body</Text>
                        <Text style={{ color: message.length > 500 ? '#ef4444' : (isDark ? '#6b7280' : '#9ca3af'), fontSize: 11, fontWeight: 'bold' }}>
                            {message.length} / 500
                        </Text>
                    </View>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type the full message payload..."
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        multiline
                        maxLength={500}
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

                {/* Recent Broadcasts */}
                {recentBroadcasts.length > 0 && (
                    <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 20 }}>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Recent Broadcasts</Text>
                        <View style={{ gap: 10 }}>
                            {recentBroadcasts.map((b, i) => (
                                <View key={i} style={{ backgroundColor: isDark ? '#374151' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', flex: 1 }}>{b.details?.split(' - ')?.[1] || 'Broadcast Message'}</Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>{new Date(b.timestamp).toLocaleDateString('en-IN')}</Text>
                                    </View>
                                    <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }} numberOfLines={2}>{b.details}</Text>
                                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, marginTop: 8, fontStyle: 'italic' }}>Sent by {b.adminName}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
