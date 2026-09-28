import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, TextInput, Platform, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { TIER_INFO } from '../src/services/tierConfig';
import { Ionicons } from '@expo/vector-icons';

type PendingUser = {
    _id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    createdAt: string;
    latestProof: {
        utrNumber: string;
        screenshot: string;
        amount: number;
        status: string;
        createdAt: string;
    } | null;
};

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    const [durationMonths, setDurationMonths] = useState('1');
    const [selectedTier, setSelectedTier] = useState('foundation');
    const [rejectReason, setRejectReason] = useState('');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            router.replace('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pendingRes, allRes] = await Promise.all([
                api.get('/admin/pending'),
                api.get('/admin/all-users')
            ]);
            setPendingUsers(pendingRes.data);
            setAllUsers(allRes.data);
        } catch (e) {
            console.error('Failed to fetch admin data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleApprove = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.post(`/admin/approve/${userId}`, {
                durationMonths: parseInt(durationMonths) || 1,
                tier: selectedTier
            });
            await fetchData();
            setExpandedUser(null);
        } catch (e: any) {
            console.error('Approve failed:', e.response?.data?.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.post(`/admin/reject/${userId}`, {
                reason: rejectReason || 'Payment could not be verified'
            });
            await fetchData();
            setExpandedUser(null);
            setRejectReason('');
        } catch (e: any) {
            console.error('Reject failed:', e.response?.data?.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevoke = async (userId: string) => {
        if (Platform.OS === 'web') {
            if (!window.confirm("Are you sure you want to revoke this user's subscription? They will immediately lose access.")) return;
        }
        setActionLoading(userId);
        try {
            await api.post(`/admin/revoke/${userId}`);
            await fetchData();
        } catch (e: any) {
            console.error('Revoke failed:', e.response?.data?.message);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            active: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: '✅ Active' },
            pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: '🔒 Pending Payment' },
            pending_review: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: '⏳ Awaiting Review' },
            rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: '❌ Rejected' },
            expired: { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af', label: '⏰ Expired' },
        };
        const c = config[status] || config.pending;
        return (
            <View style={{ backgroundColor: c.bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }}>
                <Text style={{ color: c.text, fontSize: 11, fontWeight: '600' }}>{c.label}</Text>
            </View>
        );
    };

    const handleRefreshCA = async () => {
        setActionLoading('refreshing-ca');
        try {
            const res = await api.post('/current-affairs/refresh');
            if (Platform.OS === 'web') {
                window.alert(`Success: Pulled ${res.data.newCount} new articles!`);
            }
        } catch (e: any) {
            console.error('Refresh CA failed:', e.response?.data?.message || e.message);
            if (Platform.OS === 'web') {
                window.alert('Failed to refresh Current Affairs. See console.');
            }
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}
            contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>
                        🛡️ Admin Panel
                    </Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 4 }}>
                        Manage user subscriptions and platform tools
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={handleRefreshCA}
                        disabled={actionLoading === 'refreshing-ca'}
                        style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                        {actionLoading === 'refreshing-ca' ? (
                            <ActivityIndicator size="small" color={isDark ? 'white' : '#374151'} />
                        ) : (
                            <>
                                <Ionicons name="refresh" size={18} color={isDark ? 'white' : '#374151'} />
                                <Text style={{ color: isDark ? 'white' : '#374151', fontWeight: 'bold', fontSize: 13 }}>Scrape News</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.replace('/')}
                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
                    >
                        <Ionicons name="home" size={20} color={isDark ? '#d1d5db' : '#374151'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Total Users', count: allUsers.length, color: '#2563eb', icon: '👥' },
                    { label: 'Pending', count: pendingUsers.length, color: '#f59e0b', icon: '⏳' },
                    { label: 'Active', count: allUsers.filter(u => u.subscriptionStatus === 'active').length, color: '#22c55e', icon: '✅' },
                ].map((stat, i) => (
                    <View key={i} style={{
                        flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        padding: 16, borderRadius: 14, alignItems: 'center',
                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
                    }}>
                        <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
                        <Text style={{ color: stat.color, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{stat.count}</Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 2 }}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Subscriber Tier Analytics */}
            <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>👑 Active Subscribers by Tier</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {[
                        { label: 'Foundation', tier: 'foundation', color: '#10b981' },
                        { label: 'Aspirant', tier: 'aspirant', color: '#8b5cf6' },
                        { label: 'Topper (Pro)', tier: 'topper', color: '#f59e0b' }
                    ].map((t, i) => {
                        const count = allUsers.filter(u => u.subscriptionTier === t.tier && u.subscriptionStatus === 'active').length;
                        return (
                            <View key={i} style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', alignItems: 'center' }}>
                                <Text style={{ color: t.color, fontSize: 20, fontWeight: 'bold' }}>{count}</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4, fontWeight: '600' }}>{t.label}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
                {(['pending', 'all'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: 12, borderRadius: 12, alignItems: 'center',
                            backgroundColor: activeTab === tab ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
                            borderWidth: 1, borderColor: activeTab === tab ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb')
                        }}
                    >
                        <Text style={{
                            color: activeTab === tab ? 'white' : (isDark ? '#d1d5db' : '#374151'),
                            fontWeight: '600', fontSize: 14
                        }}>
                            {tab === 'pending' ? `⏳ Pending (${pendingUsers.length})` : `👥 All Users (${allUsers.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Pending Users Tab */}
            {activeTab === 'pending' && (
                pendingUsers.length === 0 ? (
                    <View style={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        padding: 40, borderRadius: 16, alignItems: 'center',
                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
                    }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>All clear!</Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>No pending approvals</Text>
                    </View>
                ) : (
                    pendingUsers.map((u) => (
                        <View key={u._id} style={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderRadius: 16, marginBottom: 12, overflow: 'hidden',
                            borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
                        }}>
                            {/* User Header */}
                            <TouchableOpacity
                                onPress={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
                                style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>
                                            {u.name}
                                        </Text>
                                        {getStatusBadge(u.subscriptionStatus)}
                                    </View>
                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{u.email}</Text>
                                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, marginTop: 2 }}>
                                        Registered: {formatDate(u.createdAt)}
                                    </Text>
                                </View>
                                <Ionicons name={expandedUser === u._id ? 'chevron-up' : 'chevron-down'} size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>

                            {/* Expanded Details */}
                            {expandedUser === u._id && (
                                <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                                    {/* Payment Proof */}
                                    {u.latestProof ? (
                                        <View style={{
                                            backgroundColor: isDark ? '#111827' : '#f0f9ff',
                                            padding: 14, borderRadius: 12, marginBottom: 16,
                                            borderWidth: 1, borderColor: isDark ? '#1e3a5f' : '#bfdbfe'
                                        }}>
                                            <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                                                💳 Payment Proof
                                            </Text>
                                            <View style={{ gap: 6 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>UTR</Text>
                                                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: '600' }}>{u.latestProof.utrNumber}</Text>
                                                </View>
                                                {u.latestProof.amount ? (
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Amount</Text>
                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: '600' }}>₹{u.latestProof.amount}</Text>
                                                    </View>
                                                ) : null}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Submitted</Text>
                                                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 12 }}>{formatDate(u.latestProof.createdAt)}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{
                                            backgroundColor: isDark ? '#111827' : '#fef3cd',
                                            padding: 12, borderRadius: 12, marginBottom: 16
                                        }}>
                                            <Text style={{ color: '#f59e0b', fontSize: 13 }}>
                                                ⚠️ No payment proof submitted yet
                                            </Text>
                                        </View>
                                    )}

                                    {/* Duration Selector */}
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginBottom: 6 }}>
                                            Grant access for (months):
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {['1', '3', '6', '12'].map((m) => (
                                                <TouchableOpacity
                                                    key={m}
                                                    onPress={() => setDurationMonths(m)}
                                                    style={{
                                                        flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
                                                        backgroundColor: durationMonths === m ? '#2563eb' : (isDark ? '#111827' : '#f3f4f6'),
                                                        borderWidth: 1, borderColor: durationMonths === m ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb')
                                                    }}
                                                >
                                                    <Text style={{
                                                        color: durationMonths === m ? 'white' : (isDark ? '#d1d5db' : '#374151'),
                                                        fontWeight: '600', fontSize: 13
                                                    }}>
                                                        {m}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Tier Selector */}
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginBottom: 6 }}>
                                            Subscription tier:
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {(['foundation', 'aspirant', 'topper'] as const).map((t) => {
                                                const info = TIER_INFO[t];
                                                return (
                                                    <TouchableOpacity
                                                        key={t}
                                                        onPress={() => setSelectedTier(t)}
                                                        style={{
                                                            flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
                                                            backgroundColor: selectedTier === t ? info.color : (isDark ? '#111827' : '#f3f4f6'),
                                                            borderWidth: 1, borderColor: selectedTier === t ? info.color : (isDark ? '#374151' : '#e5e7eb')
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 14 }}>{info.icon}</Text>
                                                        <Text style={{
                                                            color: selectedTier === t ? 'white' : (isDark ? '#d1d5db' : '#374151'),
                                                            fontWeight: '600', fontSize: 10, marginTop: 2
                                                        }}>
                                                            {info.name}
                                                        </Text>
                                                        <Text style={{
                                                            color: selectedTier === t ? 'rgba(255,255,255,0.8)' : (isDark ? '#6b7280' : '#9ca3af'),
                                                            fontSize: 9, marginTop: 1
                                                        }}>
                                                            {info.price}/mo
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <TouchableOpacity
                                            onPress={() => handleApprove(u._id)}
                                            disabled={actionLoading === u._id}
                                            style={{
                                                flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
                                                backgroundColor: '#22c55e', flexDirection: 'row', justifyContent: 'center', gap: 6
                                            }}
                                        >
                                            {actionLoading === u._id ? (
                                                <ActivityIndicator color="white" size="small" />
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark-circle" size={18} color="white" />
                                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Approve</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleReject(u._id)}
                                            disabled={actionLoading === u._id}
                                            style={{
                                                flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
                                                backgroundColor: '#ef4444', flexDirection: 'row', justifyContent: 'center', gap: 6
                                            }}
                                        >
                                            {actionLoading === u._id ? (
                                                <ActivityIndicator color="white" size="small" />
                                            ) : (
                                                <>
                                                    <Ionicons name="close-circle" size={18} color="white" />
                                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Reject</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Reject Reason Input */}
                                    <TextInput
                                        style={{
                                            backgroundColor: isDark ? '#111827' : '#f9fafb',
                                            color: isDark ? 'white' : '#111827',
                                            padding: 12, borderRadius: 10, marginTop: 10,
                                            borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                                            fontSize: 13,
                                            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})
                                        } as any}
                                        placeholder="Rejection reason (optional)"
                                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                        value={rejectReason}
                                        onChangeText={setRejectReason}
                                    />
                                </View>
                            )}
                        </View>
                    ))
                )
            )}

            {/* All Users Tab */}
            {activeTab === 'all' && (
                allUsers.map((u) => (
                    <View key={u._id} style={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        padding: 16, borderRadius: 14, marginBottom: 8,
                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 15, fontWeight: '600' }}>
                                    {u.name}
                                </Text>
                                {u.role === 'admin' && (
                                    <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 }}>
                                        <Text style={{ color: '#a855f7', fontSize: 10, fontWeight: 'bold' }}>ADMIN</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, marginTop: 2 }}>{u.email}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {u.subscriptionTier && TIER_INFO[u.subscriptionTier] && (
                                <View style={{ backgroundColor: `${TIER_INFO[u.subscriptionTier].color}20`, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 }}>
                                    <Text style={{ color: TIER_INFO[u.subscriptionTier].color, fontSize: 10, fontWeight: 'bold' }}>
                                        {TIER_INFO[u.subscriptionTier].icon} {TIER_INFO[u.subscriptionTier].name}
                                    </Text>
                                </View>
                            )}
                            {getStatusBadge(u.subscriptionStatus || 'pending')}
                            {u.subscriptionStatus === 'active' && u.role !== 'admin' && (
                                <TouchableOpacity
                                    onPress={() => handleRevoke(u._id)}
                                    disabled={actionLoading === u._id}
                                    style={{ marginLeft: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 8 }}
                                >
                                    {actionLoading === u._id ? (
                                        <ActivityIndicator size="small" color="#ef4444" />
                                    ) : (
                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
