import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, TextInput, Platform, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { TIER_INFO } from '../src/services/tierConfig';
import { Ionicons } from '@expo/vector-icons';

import AdminCMS from '../src/components/AdminCMS';
import AdminBroadcast from '../src/components/AdminBroadcast';
import AdminNotes from '../src/components/AdminNotes';

type PendingUser = {
    _id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    createdAt: string;
    latestProof: {
        utrNumber?: string;
        requestedTier?: string;
        isAnnual?: boolean;
        screenshot?: string;
        amount?: number;
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
    const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'history'>('pending');
    const [durationMonths, setDurationMonths] = useState('1');
    const [selectedTier, setSelectedTier] = useState('foundation');
    const [rejectReason, setRejectReason] = useState('');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const [customExpiryDate, setCustomExpiryDate] = useState('');
    const [customAiLimit, setCustomAiLimit] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [approvedAmount, setApprovedAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('manual');

    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [editUserName, setEditUserName] = useState('');
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserMobile, setEditUserMobile] = useState('');
    const [editUserPassword, setEditUserPassword] = useState('');
    const [editUserAttempt, setEditUserAttempt] = useState('');
    const [editUserOnboarding, setEditUserOnboarding] = useState(false);

    const [revenueData, setRevenueData] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<any>(null);
    const [trafficData, setTrafficData] = useState<any>(null);
    const [demographicsData, setDemographicsData] = useState<any>(null);

    // Phase 9 Tabs
    const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'cms' | 'broadcast' | 'ai-notes' | 'audit-logs'>('overview');
    const [headerExpanded, setHeaderExpanded] = useState(false);

    // Audit Logs
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Direct Message State
    const [dmModalUser, setDmModalUser] = useState<{ id: string, name: string } | null>(null);
    const [dmTitle, setDmTitle] = useState('');
    const [dmMessage, setDmMessage] = useState('');
    const [dmLoading, setDmLoading] = useState(false);

    // Admin Progress Tracker State
    const [progressModalVisible, setProgressModalVisible] = useState(false);
    const [progressData, setProgressData] = useState<any>(null);
    const [progressLoading, setProgressLoading] = useState(false);
    const [progressUser, setProgressUser] = useState<{ id: string, name: string } | null>(null);

    const handleLoadProgress = async (id: string, name: string) => {
        setProgressUser({ id, name });
        setProgressModalVisible(true);
        setProgressLoading(true);
        try {
            const res = await api.get(`/admin/user-progress/${id}`);
            setProgressData(res.data);
        } catch (e: any) {
            console.error('Failed to load progress', e);
            showToast('Failed to load user progress', 'error');
            setProgressModalVisible(false);
        } finally {
            setProgressLoading(false);
        }
    };

    const handleSendDM = async () => {
        if (!dmModalUser) return;
        if (!dmTitle.trim() || !dmMessage.trim()) {
            return showToast('Please enter both title and message', 'error');
        }
        setDmLoading(true);
        try {
            await api.post(`/admin/notify-user/${dmModalUser.id}`, {
                title: dmTitle.trim(),
                message: dmMessage.trim(),
                type: 'admin_message'
            });
            showToast('✅ Direct message sent successfully!');
            setDmModalUser(null);
            setDmTitle('');
            setDmMessage('');
        } catch (error: any) {
            console.error('Failed to send DM:', error);
            showToast(`Error: ${error.response?.data?.message || 'Failed to send direct message'}`, 'error');
        } finally {
            setDmLoading(false);
        }
    };

    // Toast notification state (#2)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Search/Filter state (#8)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // History date filter state (#9)
    const [historyFilter, setHistoryFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

    // #3 + #1: Auto-fill from request & reset form when switching users
    const handleExpandUser = (userId: string, userObj?: any) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }
        // Reset all form fields to defaults first (#1)
        setDurationMonths('1');
        setSelectedTier('foundation');
        setCustomExpiryDate('');
        setCustomAiLimit('');
        setAdminNote('');
        setApprovedAmount('');
        setPaymentMethod('manual');
        setRejectReason('');

        // Auto-fill from user's request if available (#3)
        if (userObj?.latestProof) {
            const proof = userObj.latestProof;
            if (proof.requestedTier) setSelectedTier(proof.requestedTier);
            if (proof.isAnnual) setDurationMonths('12');
        }
        setExpandedUser(userId);
    };

    const handleBulkApprove = async () => {
        if (!selectedUsers.length) return;
        if (Platform.OS === 'web' && !window.confirm(`Bulk Approve ${selectedUsers.length} selected users?\nThey will be approved with 1 month Foundation tier unless they requested otherwise.`)) return;

        setLoading(true);
        try {
            await Promise.all(selectedUsers.map(id => api.post(`/admin/approve/${id}`, {
                durationMonths: 1,
                tier: 'foundation'
            })));
            showToast(`Bulk approved ${selectedUsers.length} users!`, 'success');
            setSelectedUsers([]);
            fetchData();
        } catch (error) {
            showToast('Some bulk approvals failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkReject = async () => {
        if (!selectedUsers.length) return;
        const reason = Platform.OS === 'web' ? window.prompt('Enter rejection reason for all selected:') : 'Bulk rejected';
        if (reason === null) return;

        setLoading(true);
        try {
            await Promise.all(selectedUsers.map(id => api.post(`/admin/reject/${id}`, { reason })));
            showToast(`Bulk rejected ${selectedUsers.length} users!`, 'success');
            setSelectedUsers([]);
            fetchData();
        } catch (error) {
            showToast('Some bulk rejections failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter helpers (#8)
    const filterUsers = (users: any[]) => {
        let filtered = users;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.mobile?.includes(q)
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(u => u.subscriptionStatus === statusFilter);
        }
        return filtered;
    };

    // History date filter helper (#9)
    const filterHistory = (records: any[]) => {
        if (historyFilter === 'all') return records;
        const now = new Date();
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const cutoff = new Date(now.getTime() - daysMap[historyFilter] * 24 * 60 * 60 * 1000);
        return records.filter((r: any) => new Date(r.reviewedAt || r.createdAt) >= cutoff);
    };

    // Days until expiry helper (#5)
    const getDaysUntilExpiry = (expiry: string) => {
        if (!expiry) return null;
        const diff = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Auto-calculate Custom Expiry Date when duration changes
    useEffect(() => {
        const months = parseInt(durationMonths) || 1;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + months);
        setCustomExpiryDate(expiry.toISOString().split('T')[0]);
    }, [durationMonths]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            router.replace('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const results = await Promise.allSettled([
                api.get('/admin/pending'),
                api.get('/admin/all-users'),
                api.get('/admin/revenue'),
                api.get('/admin/payment-history'),
                api.get('/admin/traffic'),
                api.get('/admin/demographics')
            ]);

            if (results[0].status === 'fulfilled') setPendingUsers(results[0].value.data);
            if (results[1].status === 'fulfilled') setAllUsers(results[1].value.data);
            if (results[2].status === 'fulfilled') setRevenueData(results[2].value.data);
            if (results[3].status === 'fulfilled') setPaymentHistory(results[3].value.data);
            if (results[4].status === 'fulfilled') setTrafficData(results[4].value.data);
            if (results[5].status === 'fulfilled') setDemographicsData(results[5].value.data);

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
        // #10: Confirmation dialog before approve
        if (Platform.OS === 'web') {
            const tierLabel = (selectedTier || 'foundation').charAt(0).toUpperCase() + (selectedTier || 'foundation').slice(1);
            if (!window.confirm(`Approve this user?\n\nTier: ${tierLabel}\nDuration: ${durationMonths} month(s)\nMethod: ${paymentMethod}\n\nThis will grant immediate access.`)) return;
        }
        setActionLoading(userId);
        try {
            await api.post(`/admin/approve/${userId}`, {
                durationMonths: parseInt(durationMonths) || 1,
                tier: selectedTier,
                customExpiryDate: customExpiryDate || undefined,
                aiEssayLimitOverride: parseInt(customAiLimit) || undefined,
                adminNote: adminNote || undefined,
                approvedAmount: approvedAmount || undefined,
                paymentMethod: paymentMethod
            });
            await fetchData();
            setExpandedUser(null);
            setCustomExpiryDate('');
            setCustomAiLimit('');
            setAdminNote('');
            setApprovedAmount('');
            setPaymentMethod('manual');
            showToast(`✅ User approved for ${durationMonths} month(s) on ${selectedTier} tier`);
        } catch (e: any) {
            console.error('Approve failed:', e.response?.data?.message);
            showToast(`❌ Approve failed: ${e.response?.data?.message || 'Unknown error'}`, 'error');
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
            showToast('❌ User rejected successfully');
        } catch (e: any) {
            console.error('Reject failed:', e.response?.data?.message);
            showToast(`Failed to reject: ${e.response?.data?.message || 'Unknown error'}`, 'error');
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
            showToast('⚠️ User subscription revoked');
        } catch (e: any) {
            console.error('Revoke failed:', e.response?.data?.message);
            showToast(`Failed to revoke: ${e.response?.data?.message || 'Unknown error'}`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateUserDetails = async (userId: string) => {
        if (!editUserName.trim()) return;
        setActionLoading(userId);
        try {
            await api.put(`/admin/update-user/${userId}`, {
                name: editUserName.trim(),
                email: editUserEmail.trim() || undefined,
                mobile: editUserMobile.trim() || undefined,
                password: editUserPassword || undefined,
                attemptNumber: editUserAttempt ? parseInt(editUserAttempt) : undefined,
                onboardingComplete: editUserOnboarding
            });
            setEditUserId(null);
            setEditUserName('');
            setEditUserEmail('');
            setEditUserMobile('');
            setEditUserPassword('');
            setEditUserAttempt('');
            setEditUserOnboarding(false);
            await fetchData();
            showToast('✏️ User details updated');
        } catch (e: any) {
            console.error('Update details failed:', e);
            showToast(`Failed to update: ${e.response?.data?.message || 'Unknown error'}`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (Platform.OS === 'web') {
            if (!window.confirm("CRITICAL WARNING: This will permanently EXTERMINATE this user and all data. Are you absolutely sure?")) return;
        }
        setActionLoading(userId);
        try {
            await api.delete(`/admin/user/${userId}`);
            await fetchData();
            showToast('🗑️ User deleted permanently');
        } catch (e: any) {
            console.error('Delete User failed:', e.response?.data?.message);
            showToast(`Failed to delete: ${e.response?.data?.message || 'Unknown error'}`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExpireSubscription = async (userId: string) => {
        if (Platform.OS === 'web') {
            if (!window.confirm("Are you sure you want to manually end this user's current trial/subscription?")) return;
        }
        setActionLoading(userId);
        try {
            await api.post(`/admin/expire-subscription/${userId}`);
            await fetchData();
            showToast('⏰ Subscription/Trial manually expired');
        } catch (e: any) {
            console.error('Expire failed:', e.response?.data?.message);
            showToast(`Failed to expire: ${e.response?.data?.message || 'Unknown error'}`, 'error');
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

    const handleExportCSV = async () => {
        if (Platform.OS !== 'web') {
            showToast('Export only available on Desktop web browser', 'error');
            return;
        }
        setActionLoading('export-csv');
        try {
            const res = await api.get('/admin/export-users');
            // Assuming res.data is the CSV string (from text/csv header)
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "users_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('✅ Downloaded Users Export');
        } catch (e) {
            console.error('Export failed:', e);
            showToast('Failed to export CSV', 'error');
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
        <View style={{ flex: 1 }}>
            {/* Toast Overlay (#2) */}
            {toast && (
                <View style={{
                    position: 'absolute', top: Platform.OS === 'web' ? 24 : 60, left: 0, right: 0, zIndex: 9999,
                    alignItems: 'center', pointerEvents: 'none'
                }}>
                    <View style={{
                        backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30,
                        flexDirection: 'row', alignItems: 'center', gap: 8,
                        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
                    }}>
                        <Ionicons name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{toast.message}</Text>
                    </View>
                </View>
            )}

            {/* Admin Progress Tracker Modal Overlay */}
            {progressModalVisible && (
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center', alignItems: 'center', zIndex: 9999
                }}>
                    <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 20, padding: 24, width: '90%', maxWidth: 500, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Academic Profile</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 2 }}>{progressUser?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setProgressModalVisible(false)} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 8, borderRadius: 20 }}>
                                <Ionicons name="close" size={20} color={isDark ? '#d1d5db' : '#4b5563'} />
                            </TouchableOpacity>
                        </View>

                        {progressLoading ? (
                            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', marginTop: 12 }}>Aggregating Live Data...</Text>
                            </View>
                        ) : progressData ? (
                            <View>
                                {/* Gamification Profile */}
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                                        <Text style={{ color: '#d97706', fontSize: 24, fontWeight: 'bold' }}>{progressData.score} <Text style={{ fontSize: 12 }}>XP</Text></Text>
                                        <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '600' }}>Power Score</Text>
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                        <Text style={{ color: '#ef4444', fontSize: 24, fontWeight: 'bold' }}>{progressData.streak} 🔥</Text>
                                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Active Streak</Text>
                                    </View>
                                </View>

                                {/* Raw Metrics */}
                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Topics Mastered', val: progressData.topicsCompleted, color: '#10b981', icon: '✅' },
                                        { label: 'Deep Focus Mins', val: progressData.totalFocusMinutes, color: '#3b82f6', icon: '⏳' },
                                        { label: 'Evaluated Answers', val: progressData.answersEvaluated, color: '#8b5cf6', icon: '📝' },
                                        { label: 'Featured Submissions', val: progressData.answersFeatured, color: '#ec4899', icon: '⭐' }
                                    ].map((metric, i) => (
                                        <View key={i} style={{ width: '48%', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 8 }}>
                                            <Text style={{ fontSize: 16, marginBottom: 4 }}>{metric.icon}</Text>
                                            <Text style={{ color: metric.color, fontSize: 18, fontWeight: 'bold' }}>{metric.val}</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, marginTop: 2 }}>{metric.label}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Paper Breakdown Analytics */}
                                {progressData.paperBreakdown && progressData.paperBreakdown.length > 0 && (
                                    <View style={{ marginTop: 8, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Paper-Wise Topic Mastery</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {progressData.paperBreakdown.sort((a: any, b: any) => b.count - a.count).map((item: any, index: number) => (
                                                <View key={index} style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: 'bold', marginRight: 6 }}>{item.paper}</Text>
                                                    <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{item.count}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text style={{ color: '#ef4444', textAlign: 'center', padding: 20 }}>No records found.</Text>
                        )}
                    </View>
                </View>
            )}

            {/* Direct Message Modal */}
            {dmModalUser && (
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center', alignItems: 'center', zIndex: 9999
                }}>
                    <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 20, padding: 24, width: '90%', maxWidth: 450, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Send Message</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 2 }}>To: {dmModalUser.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setDmModalUser(null)} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 8, borderRadius: 20 }}>
                                <Ionicons name="close" size={20} color={isDark ? '#d1d5db' : '#4b5563'} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 6, fontWeight: '600' }}>Message Title</Text>
                        <TextInput
                            style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 } as any}
                            placeholder="e.g. Account Notice"
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={dmTitle}
                            onChangeText={setDmTitle}
                        />

                        <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 6, fontWeight: '600' }}>Message Body</Text>
                        <TextInput
                            style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 24, minHeight: 100, textAlignVertical: 'top' } as any}
                            placeholder="Type your private message here..."
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            value={dmMessage}
                            onChangeText={setDmMessage}
                            multiline={true}
                            numberOfLines={4}
                        />

                        <TouchableOpacity
                            onPress={handleSendDM}
                            disabled={dmLoading}
                            style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 12, alignItems: 'center', opacity: dmLoading ? 0.7 : 1 }}
                        >
                            {dmLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Send Secure Message</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
                {/* Left Sidebar (Desktop Only) */}
                {Platform.OS === 'web' && (
                    <View style={{ width: 260, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRightWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 24, paddingRight: 16 }}>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5, marginBottom: 32 }}>
                            🛡️ Workspace
                        </Text>
                        <View style={{ gap: 8 }}>
                            {[
                                { key: 'overview', icon: 'grid', label: 'Overview' },
                                { key: 'users', icon: 'people', label: 'Users' },
                                { key: 'cms', icon: 'server', label: 'CMS' },
                                { key: 'broadcast', icon: 'megaphone', label: 'Broadcast' },
                                { key: 'ai-notes', icon: 'document-text', label: 'Notes' },
                                { key: 'audit-logs', icon: 'time', label: 'Audit Logs' },
                            ].map(tab => (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setAdminTab(tab.key as any)}
                                    style={{
                                        paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
                                        backgroundColor: adminTab === tab.key ? '#2563eb' : 'transparent',
                                        flexDirection: 'row', alignItems: 'center', gap: 12
                                    }}
                                >
                                    <Ionicons name={tab.icon as any} size={18} color={adminTab === tab.key ? 'white' : (isDark ? '#9ca3af' : '#6b7280')} />
                                    <Text style={{ color: adminTab === tab.key ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: adminTab === tab.key ? 'bold' : '500', fontSize: 13 }}>{tab.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ marginTop: 'auto', gap: 8 }}>
                            <TouchableOpacity onPress={() => router.push('/health')} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                                <Ionicons name="pulse" size={18} color="#22c55e" />
                                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: '500', fontSize: 13 }}>Health Status</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.replace('/')} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                                <Ionicons name="home" size={18} color={isDark ? '#d1d5db' : '#4b5563'} />
                                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: '500', fontSize: 13 }}>Exit Admin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Right Workspace Area */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: Platform.OS === 'web' ? 32 : 20, paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                >
                    {/* Mobile Navigation Tabs */}
                    {Platform.OS !== 'web' && (
                        <View style={{ marginBottom: 20 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
                                {[
                                    { key: 'overview', icon: 'grid', label: 'Overview' },
                                    { key: 'users', icon: 'people', label: 'Users' },
                                    { key: 'cms', icon: 'server', label: 'CMS' },
                                    { key: 'broadcast', icon: 'megaphone', label: 'Broadcast' },
                                    { key: 'ai-notes', icon: 'document-text', label: 'Notes' },
                                    { key: 'audit-logs', icon: 'time', label: 'Audit Logs' },
                                ].map(tab => (
                                    <TouchableOpacity
                                        key={tab.key}
                                        onPress={() => setAdminTab(tab.key as any)}
                                        style={{
                                            paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20,
                                            backgroundColor: adminTab === tab.key ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
                                            flexDirection: 'row', alignItems: 'center', gap: 6,
                                            borderWidth: 1, borderColor: adminTab === tab.key ? '#2563eb' : (isDark ? '#4b5563' : '#d1d5db')
                                        }}
                                    >
                                        <Ionicons name={tab.icon as any} size={16} color={adminTab === tab.key ? 'white' : (isDark ? '#d1d5db' : '#4b5563')} />
                                        <Text style={{ color: adminTab === tab.key ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold', fontSize: 13 }}>{tab.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Workspace Header */}
                    <View style={{ marginBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 26, fontWeight: 'bold', letterSpacing: -0.5 }}>
                                {adminTab === 'overview' ? 'Dashboard Overview' :
                                    adminTab === 'users' ? 'User Accounts' :
                                        adminTab === 'cms' ? 'Content Management' :
                                            adminTab === 'broadcast' ? 'Broadcast Platform' :
                                                adminTab === 'ai-notes' ? 'IASuite Notes' : 'Audit Logs'}
                            </Text>
                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 4 }}>
                                {adminTab === 'overview' ? 'Track platform analytics, revenue, and perform quick actions.' :
                                    adminTab === 'users' ? 'Manage user accounts, subscriptions, and access profiles.' :
                                        'System administration and content control.'}
                            </Text>
                        </View>

                        {Platform.OS !== 'web' && (
                            /* Mobile Fallback Tab Navigation */
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, width: '100%', marginTop: 16 }}>
                                {['overview', 'users', 'cms', 'broadcast', 'ai-notes'].map(t => (
                                    <TouchableOpacity key={t} onPress={() => setAdminTab(t as any)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: adminTab === t ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb') }}>
                                        <Text style={{ color: adminTab === t ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontSize: 11, fontWeight: 'bold' }}>{t.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {adminTab === 'overview' && (
                        <View>
                            {/* Quick Actions Bar */}
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 24, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                <TouchableOpacity onPress={handleExportCSV} disabled={actionLoading === 'export-csv'} style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                    {actionLoading === 'export-csv' ? <ActivityIndicator size="small" color="#10b981" /> : <><Ionicons name="download" size={18} color="#10b981" /><Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 13 }}>Export CSV</Text></>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleRefreshCA} disabled={actionLoading === 'refreshing-ca'} style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                    {actionLoading === 'refreshing-ca' ? <ActivityIndicator size="small" color="#3b82f6" /> : <><Ionicons name="newspaper" size={18} color="#3b82f6" /><Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>Scrape News</Text></>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setAdminTab('broadcast')} style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="megaphone" size={18} color="#f59e0b" /><Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 13 }}>Broadcast</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onRefresh} style={{ flex: 1, minWidth: 120, backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="refresh" size={18} color={isDark ? '#d1d5db' : '#4b5563'} /><Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: 'bold', fontSize: 13 }}>Refresh</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Stats */}
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Total Users', count: allUsers.length, color: '#2563eb', icon: '👥', glow: 'rgba(37, 99, 235, 0.1)' },
                                    { label: 'Pending', count: pendingUsers.length, color: '#f59e0b', icon: '⏳', glow: 'rgba(245, 158, 11, 0.1)' },
                                    { label: 'Active Plans', count: allUsers.filter(u => u.subscriptionStatus === 'active').length, color: '#22c55e', icon: '✅', glow: 'rgba(34, 197, 94, 0.1)' },
                                    { label: 'Notes Access', count: allUsers.filter(u => u.hasNotesAccess).length, color: '#a855f7', icon: '📝', glow: 'rgba(168, 85, 247, 0.1)' },
                                ].map((stat, i) => (
                                    <View key={i} style={{
                                        flex: 1, minWidth: '45%', backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        padding: 16, borderRadius: 16, alignItems: 'center',
                                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                                        shadowColor: stat.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2
                                    }}>
                                        <View style={{ backgroundColor: stat.glow, padding: 12, borderRadius: 20, marginBottom: 12 }}>
                                            <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
                                        </View>
                                        <Text style={{ color: stat.color, fontSize: 26, fontWeight: 'bold' }}>{stat.count}</Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{stat.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* 📈 Traffic & Growth Dashboard Card */}
                            {trafficData && (
                                <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>📈 Traffic & Growth</Text>
                                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
                                        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f5f3ff', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#ddd6fe' }}>
                                            <Text style={{ color: '#8b5cf6', fontSize: 22, fontWeight: 'bold' }}>{trafficData.summary?.visitsToday || 0}</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>Visits Today</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fdf4ff', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#fbcfe8' }}>
                                            <Text style={{ color: '#d946ef', fontSize: 22, fontWeight: 'bold' }}>{trafficData.summary?.registrationsToday || 0}</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>Signups Today</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff7ed', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#fed7aa' }}>
                                            <Text style={{ color: '#f97316', fontSize: 22, fontWeight: 'bold' }}>{trafficData.summary?.conversionRateToday || 0}%</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>Conversion Rate</Text>
                                        </View>
                                    </View>

                                    {trafficData.todayHourlyMap && (
                                        <View style={{ marginTop: 24, paddingBottom: 8 }}>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 'bold', marginBottom: 16, textTransform: 'uppercase' }}>24-Hour Traffic Heatmap</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                                                <View style={{ flexDirection: 'row', gap: 6, height: 75, alignItems: 'flex-end' }}>
                                                    {Array.from({ length: 24 }, (_, i) => i.toString()).map(hour => {
                                                        const count = trafficData.todayHourlyMap[hour] || 0;
                                                        const maxCount = Math.max(1, ...(Object.values(trafficData.todayHourlyMap).filter(v => typeof v === 'number') as number[]));
                                                        const heightPercent = count === 0 ? 0 : (count / maxCount) * 100;

                                                        return (
                                                            <View key={hour} style={{ alignItems: 'center', width: 26 }}>
                                                                <View style={{
                                                                    width: 16,
                                                                    height: count === 0 ? 4 : `${heightPercent}%`,
                                                                    minHeight: 4,
                                                                    backgroundColor: count > 0 ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6'),
                                                                    borderRadius: 4,
                                                                    opacity: count > 0 ? Math.max(0.4, count / maxCount) : 1
                                                                }} />
                                                                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 9, marginTop: 6, fontWeight: 'bold' }}>
                                                                    {hour}h
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </ScrollView>
                                        </View>
                                    )}

                                    {demographicsData && (
                                        <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 16 }}>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Demographics: Subject Distribution</Text>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                {demographicsData.optionals?.map((opt: any, i: number) => (
                                                    <View key={i} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 }}>
                                                        <Text style={{ color: isDark ? 'white' : '#374151', fontSize: 12 }}>{opt.subject} : <Text style={{ fontWeight: 'bold', color: isDark ? '#10b981' : '#059669' }}>{opt.count}</Text></Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}


                            {/* 💰 Revenue Dashboard Card */}
                            {revenueData && (
                                <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>💰 Revenue Overview</Text>
                                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f0fdf4', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#bbf7d0' }}>
                                            <Text style={{ color: '#22c55e', fontSize: 22, fontWeight: 'bold' }}>₹{revenueData.totalRevenue?.toLocaleString('en-IN')}</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>Total Revenue</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#eff6ff', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#bfdbfe' }}>
                                            <Text style={{ color: '#3b82f6', fontSize: 22, fontWeight: 'bold' }}>₹{revenueData.thisMonthRevenue?.toLocaleString('en-IN')}</Text>
                                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>This Month</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {[
                                            { label: 'Foundation', amount: revenueData.revenueByTier?.foundation || 0, color: '#f59e0b' },
                                            { label: 'Aspirant', amount: revenueData.revenueByTier?.aspirant || 0, color: '#3b82f6' },
                                            { label: 'Topper', amount: revenueData.revenueByTier?.topper || 0, color: '#8b5cf6' },
                                        ].map((t, i) => (
                                            <View key={i} style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                                <Text style={{ color: t.color, fontSize: 14, fontWeight: 'bold' }}>₹{t.amount.toLocaleString('en-IN')}</Text>
                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, marginTop: 2 }}>{t.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    {revenueData.revenueByMethod && (
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                                            {[
                                                { label: 'Manual', amount: revenueData.revenueByMethod?.manual || 0, icon: '💵' },
                                                { label: 'Gateway', amount: revenueData.revenueByMethod?.gateway || 0, icon: '🔗' },
                                                { label: 'Scholarship', amount: revenueData.revenueByMethod?.scholarship || 0, icon: '🎓' },
                                            ].map((m, i) => (
                                                <View key={i} style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                                    <Text style={{ fontSize: 12 }}>{m.icon} ₹{m.amount.toLocaleString('en-IN')}</Text>
                                                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 9, marginTop: 2 }}>{m.label}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

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
                        </View>
                    )}

                    {adminTab === 'users' && (
                        <View>
                            {/* Tabs */}
                            <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
                                {(['pending', 'all', 'history'] as const).map((tab) => (
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
                                            fontWeight: '600', fontSize: 13
                                        }}>
                                            {tab === 'pending' ? `⏳ Pending (${pendingUsers.length})` : tab === 'all' ? `👥 All (${allUsers.length})` : `📋 History`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Search & Filter Bar (#8 & #9) */}
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                {(activeTab === 'all' || activeTab === 'pending') ? (
                                    <>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 12 }}>
                                            <Ionicons name="search" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                                            <TextInput
                                                style={{ flex: 1, padding: 10, color: isDark ? 'white' : '#111827', fontSize: 13 }}
                                                placeholder="Search name, email, or mobile..."
                                                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                            />
                                            {searchQuery !== '' && (
                                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                                    <Ionicons name="close-circle" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {activeTab === 'all' && (
                                            <View style={{ width: 140 }}>
                                                <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden' }}>
                                                    {/* Simplified filter button since standard <select> is web-only. For native, we can render buttons or rely on a simple toggle for this MVP admin panel */}
                                                    <TouchableOpacity
                                                        onPress={() => setStatusFilter(prev => prev === 'all' ? 'active' : prev === 'active' ? 'expired' : 'all')}
                                                        style={{ padding: 12, alignItems: 'center' }}
                                                    >
                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13 }}>
                                                            Filter: {statusFilter.toUpperCase()}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                                        {(['all', '7d', '30d', '90d'] as const).map(d => (
                                            <TouchableOpacity
                                                key={d} onPress={() => setHistoryFilter(d)}
                                                style={{
                                                    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
                                                    backgroundColor: historyFilter === d ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
                                                    borderWidth: 1, borderColor: historyFilter === d ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb')
                                                }}
                                            >
                                                <Text style={{ color: historyFilter === d ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontSize: 12, fontWeight: 'bold' }}>
                                                    {d === 'all' ? 'All Time' : d === '7d' ? 'Last 7 Days' : d === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Pending Users Tab */}
                            {activeTab === 'pending' && (
                                filterUsers(pendingUsers).length === 0 ? (
                                    <View style={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        padding: 40, borderRadius: 16, alignItems: 'center',
                                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb'
                                    }}>
                                        <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>All clear!</Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>No pending approvals matching filter</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* Bulk Actions Banner */}
                                        {selectedUsers.length > 0 && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? '#374151' : '#e0e7ff', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                                                <Text style={{ color: isDark ? 'white' : '#1e40af', fontWeight: 'bold' }}>{selectedUsers.length} selected</Text>
                                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                                    <TouchableOpacity onPress={handleBulkReject} style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Reject All</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={handleBulkApprove} style={{ backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Approve All</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Pending List Data Grid */}
                                        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
                                            <View style={{ minWidth: 900, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 }}>
                                                {/* Table Header */}
                                                <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#374151' : '#f9fafb', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                                                    <View style={{ width: 40 }} />
                                                    <Text style={{ flex: 2, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>USER DETAILS</Text>
                                                    <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>CONTACT</Text>
                                                    <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>REGISTERED</Text>
                                                    <Text style={{ width: 100, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>ACTIONS</Text>
                                                </View>

                                                {/* Records */}
                                                {filterUsers(pendingUsers).map((u, index) => {
                                                    const rowBgColor = index % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent';
                                                    return (
                                                        <View key={u._id}>
                                                            <View style={{
                                                                flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16,
                                                                backgroundColor: expandedUser === u._id ? (isDark ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6') : rowBgColor,
                                                                borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                                                                alignItems: 'center'
                                                            }}>
                                                                {/* CHECKBOX COL */}
                                                                <View style={{ width: 40, justifyContent: 'center' }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => setSelectedUsers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                                                                        style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#6b7280', backgroundColor: selectedUsers.includes(u._id) ? '#3b82f6' : 'transparent', alignItems: 'center', justifyContent: 'center' }}
                                                                    >
                                                                        {selectedUsers.includes(u._id) && <Ionicons name="checkmark" size={14} color="white" />}
                                                                    </TouchableOpacity>
                                                                </View>

                                                                {/* USER DETAILS COL */}
                                                                <View style={{ flex: 2 }}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: 'bold' }}>{u.name}</Text>
                                                                        {getStatusBadge(u.subscriptionStatus)}
                                                                    </View>
                                                                </View>

                                                                {/* CONTACT COL */}
                                                                <View style={{ flex: 1.5 }}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                        <Ionicons name="mail" size={12} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}>{u.email}</Text>
                                                                    </View>
                                                                </View>

                                                                {/* REGISTERED COL */}
                                                                <View style={{ flex: 1.5 }}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                        <Ionicons name="calendar-outline" size={12} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}>{formatDate(u.createdAt)}</Text>
                                                                    </View>
                                                                </View>

                                                                {/* ACTIONS COL */}
                                                                <View style={{ width: 100, alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => setDmModalUser({ id: u._id, name: u.name })}
                                                                        style={{ padding: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 6 }}
                                                                    >
                                                                        <Ionicons name="mail" size={14} color={isDark ? '#d1d5db' : '#4b5563'} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        onPress={() => handleLoadProgress(u._id, u.name)}
                                                                        style={{ padding: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 6 }}
                                                                    >
                                                                        <Ionicons name="bar-chart" size={14} color={isDark ? '#d1d5db' : '#4b5563'} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        onPress={() => handleExpandUser(u._id, u)}
                                                                        style={{ padding: 6, backgroundColor: expandedUser === u._id ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'), borderRadius: 6 }}
                                                                    >
                                                                        <Ionicons name={expandedUser === u._id ? 'chevron-up' : 'chevron-down'} size={14} color={expandedUser === u._id ? 'white' : (isDark ? '#d1d5db' : '#4b5563')} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>

                                                            {/* Expanded Details */}
                                                            {expandedUser === u._id && (
                                                                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
                                                                    {/* Request Details */}
                                                                    {u.latestProof ? (
                                                                        <View style={{
                                                                            backgroundColor: isDark ? '#111827' : '#f0f9ff',
                                                                            padding: 14, borderRadius: 12, marginBottom: 16,
                                                                            borderWidth: 1, borderColor: isDark ? '#1e3a5f' : '#bfdbfe'
                                                                        }}>
                                                                            <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                                                                                📝 Subscription Request Details
                                                                            </Text>
                                                                            <View style={{ gap: 6 }}>
                                                                                {u.latestProof.requestedTier && (
                                                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Requested Tier</Text>
                                                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                                                            {u.latestProof.requestedTier} {u.latestProof.isAnnual ? '(Annual)' : '(Monthly)'}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                                {u.latestProof.utrNumber && (
                                                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>UTR (Legacy)</Text>
                                                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: '600' }}>{u.latestProof.utrNumber}</Text>
                                                                                    </View>
                                                                                )}
                                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Requested On</Text>
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
                                                                                ⚠️ No formal request log found. Setting manual plan.
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
                                                                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                                                            {(['foundation', 'aspirant', 'topper', 'notes-addon'] as const).map((t) => {
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

                                                                    {/* CUSTOM APPROVAL SECTION */}
                                                                    <View style={{ padding: 16, backgroundColor: isDark ? '#111827' : '#f8fafc', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#475569', fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>⚙️ Custom Approval Overrides</Text>

                                                                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Custom Expiry Date</Text>
                                                                                <TextInput
                                                                                    style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 }}
                                                                                    placeholder="YYYY-MM-DD (e.g. 2027-05-25)"
                                                                                    placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                                                                                    value={customExpiryDate}
                                                                                    onChangeText={setCustomExpiryDate}
                                                                                />
                                                                            </View>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Bonus AI Essay Credits</Text>
                                                                                <TextInput
                                                                                    style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 }}
                                                                                    placeholder="e.g. 50"
                                                                                    placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                                                                                    value={customAiLimit}
                                                                                    onChangeText={setCustomAiLimit}
                                                                                    keyboardType="numeric"
                                                                                />
                                                                            </View>
                                                                        </View>
                                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Private Admin Note</Text>
                                                                        <TextInput
                                                                            style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 }}
                                                                            placeholder="Reason for custom plan or 100% scholarship..."
                                                                            placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                                                                            value={adminNote}
                                                                            onChangeText={setAdminNote}
                                                                        />

                                                                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Amount (₹)</Text>
                                                                                <TextInput
                                                                                    style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 }}
                                                                                    placeholder="Auto from tier"
                                                                                    placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                                                                                    value={approvedAmount}
                                                                                    onChangeText={setApprovedAmount}
                                                                                    keyboardType="numeric"
                                                                                />
                                                                            </View>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Payment Method</Text>
                                                                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                                                                    {(['manual', 'gateway', 'scholarship'] as const).map((m) => (
                                                                                        <TouchableOpacity
                                                                                            key={m}
                                                                                            onPress={() => setPaymentMethod(m)}
                                                                                            style={{
                                                                                                flex: 1, padding: 6, borderRadius: 6, alignItems: 'center',
                                                                                                backgroundColor: paymentMethod === m ? '#2563eb' : (isDark ? '#1f2937' : '#f3f4f6'),
                                                                                                borderWidth: 1, borderColor: paymentMethod === m ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb')
                                                                                            }}
                                                                                        >
                                                                                            <Text style={{ color: paymentMethod === m ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontSize: 9, fontWeight: '600' }}>
                                                                                                {m === 'manual' ? '💵' : m === 'gateway' ? '🔗' : '🎓'} {m.charAt(0).toUpperCase() + m.slice(1)}
                                                                                            </Text>
                                                                                        </TouchableOpacity>
                                                                                    ))}
                                                                                </View>
                                                                            </View>
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
                                                                        <TouchableOpacity
                                                                            onPress={() => handleExpireSubscription(u._id)}
                                                                            disabled={actionLoading === u._id}
                                                                            style={{
                                                                                flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
                                                                                backgroundColor: '#f59e0b', flexDirection: 'row', justifyContent: 'center', gap: 6
                                                                            }}
                                                                        >
                                                                            {actionLoading === u._id ? (
                                                                                <ActivityIndicator color="white" size="small" />
                                                                            ) : (
                                                                                <>
                                                                                    <Ionicons name="hourglass" size={18} color="white" />
                                                                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>End Trial</Text>
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
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
                                    </>
                                )
                            )}

                            {/* All Users Tab */}
                            {/* All Users Tab (Data Grid) */}
                            {activeTab === 'all' && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
                                    <View style={{ minWidth: 950, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 }}>
                                        {/* Table Header */}
                                        <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#374151' : '#f9fafb', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                                            <Text style={{ flex: 2, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>USER</Text>
                                            <Text style={{ flex: 2, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>CONTACT</Text>
                                            <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>TIER & STATUS</Text>
                                            <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>ACCESS EXPIRY</Text>
                                            <Text style={{ width: 140, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>ACTIONS</Text>
                                        </View>

                                        {/* Table Rows */}
                                        {filterUsers(allUsers).map((u, index) => {
                                            const daysLeft = getDaysUntilExpiry(u.subscriptionExpiry);
                                            const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

                                            const rowBgColor = u.subscriptionStatus === 'active'
                                                ? (isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.05)')
                                                : u.subscriptionStatus === 'expired'
                                                    ? (isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.05)')
                                                    : (index % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent');

                                            return (
                                                <View key={u._id}>
                                                    <View style={{
                                                        flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16,
                                                        backgroundColor: rowBgColor, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                                                        alignItems: 'center'
                                                    }}>
                                                        {/* USER COL */}
                                                        <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold' }}>{u.name}</Text>
                                                            {u.role === 'admin' && (
                                                                <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 }}>
                                                                    <Text style={{ color: '#a855f7', fontSize: 9, fontWeight: 'bold' }}>ADMIN</Text>
                                                                </View>
                                                            )}
                                                        </View>

                                                        {/* CONTACT COL */}
                                                        <View style={{ flex: 2, gap: 4 }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                <Ionicons name="mail" size={12} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}>{u.email}</Text>
                                                            </View>
                                                            {u.mobile && (
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                    <Ionicons name="call" size={12} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>{u.mobile}</Text>
                                                                </View>
                                                            )}
                                                        </View>

                                                        {/* TIER & STATUS COL */}
                                                        <View style={{ flex: 1.5, gap: 6, alignItems: 'flex-start' }}>
                                                            {u.subscriptionTier && TIER_INFO[u.subscriptionTier] ? (
                                                                <View style={{ backgroundColor: `${TIER_INFO[u.subscriptionTier].color}20`, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 }}>
                                                                    <Text style={{ color: TIER_INFO[u.subscriptionTier].color, fontSize: 10, fontWeight: 'bold' }}>
                                                                        {TIER_INFO[u.subscriptionTier].icon} {TIER_INFO[u.subscriptionTier].name}
                                                                    </Text>
                                                                </View>
                                                            ) : <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>No Tier</Text>}
                                                            {getStatusBadge(u.subscriptionStatus || 'pending')}
                                                        </View>

                                                        {/* ACCESS COL */}
                                                        <View style={{ flex: 1.5, gap: 6 }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                <Ionicons name={isExpiringSoon ? "warning" : "calendar"} size={12} color={isExpiringSoon ? "#f59e0b" : (isDark ? '#6b7280' : '#9ca3af')} />
                                                                <Text style={{ color: isExpiringSoon ? "#f59e0b" : (isDark ? '#d1d5db' : '#4b5563'), fontSize: 11, fontWeight: isExpiringSoon ? 'bold' : 'normal' }}>
                                                                    {isExpiringSoon ? `${daysLeft}d left` : u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                                                                </Text>
                                                            </View>
                                                            {u.hasNotesAccess && (
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                    <Text style={{ fontSize: 10 }}>📝</Text>
                                                                    <Text style={{ color: '#0284c7', fontSize: 10, fontWeight: 'bold' }}>
                                                                        {u.notesAccessExpiry ? new Date(u.notesAccessExpiry).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : 'Lifetime'}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>

                                                        {/* ACTIONS COL */}
                                                        <View style={{ width: 140, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
                                                            <TouchableOpacity onPress={() => setDmModalUser({ id: u._id, name: u.name })} style={{ padding: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 6 }}>
                                                                <Ionicons name="mail" size={14} color={isDark ? '#d1d5db' : '#4b5563'} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => handleLoadProgress(u._id, u.name)} style={{ padding: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 6 }}>
                                                                <Ionicons name="bar-chart" size={14} color={isDark ? '#d1d5db' : '#4b5563'} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => {
                                                                if (editUserId === u._id) {
                                                                    setEditUserId(null); // Toggle off
                                                                } else {
                                                                    setEditUserId(u._id);
                                                                    setEditUserName(u.name);
                                                                    setEditUserEmail(u.email);
                                                                    setEditUserMobile(u.mobile || '');
                                                                    setEditUserPassword('');
                                                                    setEditUserAttempt(u.attemptNumber?.toString() || '');
                                                                    setEditUserOnboarding(u.onboardingComplete || false);
                                                                }
                                                            }} style={{ padding: 6, backgroundColor: editUserId === u._id ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'), borderRadius: 6 }}>
                                                                <Ionicons name="pencil" size={14} color={editUserId === u._id ? 'white' : (isDark ? '#d1d5db' : '#4b5563')} />
                                                            </TouchableOpacity>

                                                            {u.subscriptionStatus === 'active' && u.role !== 'admin' && (
                                                                <TouchableOpacity onPress={() => handleRevoke(u._id)} disabled={actionLoading === u._id} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 6, borderRadius: 6 }}>
                                                                    {actionLoading === u._id ? <ActivityIndicator size="small" color="#f59e0b" /> : <Ionicons name="close-circle" size={14} color="#f59e0b" />}
                                                                </TouchableOpacity>
                                                            )}
                                                            {(u.subscriptionStatus === 'pending' || u.subscriptionStatus === 'pending_review') && u.role !== 'admin' && (
                                                                <TouchableOpacity onPress={() => handleReject(u._id)} disabled={actionLoading === u._id} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 6 }}>
                                                                    {actionLoading === u._id ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="close-circle" size={14} color="#ef4444" />}
                                                                </TouchableOpacity>
                                                            )}
                                                            {u.role !== 'admin' && u.subscriptionStatus === 'active' && (
                                                                <TouchableOpacity onPress={() => handleExpireSubscription(u._id)} disabled={actionLoading === u._id} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 6 }}>
                                                                    {actionLoading === u._id ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="hourglass" size={14} color="#ef4444" />}
                                                                </TouchableOpacity>
                                                            )}
                                                            {u.role !== 'admin' && (
                                                                <TouchableOpacity onPress={() => handleDeleteUser(u._id)} disabled={actionLoading === u._id} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 6 }}>
                                                                    {actionLoading === u._id ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="trash-outline" size={14} color="#ef4444" />}
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </View>

                                                    {/* Edit Inline Row */}
                                                    {editUserId === u._id && (
                                                        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
                                                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>Edit User Details</Text>

                                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                                                <View style={{ minWidth: '30%', flex: 1 }}>
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Name</Text>
                                                                    <TextInput
                                                                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 } as any}
                                                                        value={editUserName}
                                                                        onChangeText={setEditUserName}
                                                                    />
                                                                </View>
                                                                <View style={{ minWidth: '30%', flex: 1 }}>
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Email</Text>
                                                                    <TextInput
                                                                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 } as any}
                                                                        value={editUserEmail}
                                                                        onChangeText={setEditUserEmail}
                                                                        autoCapitalize="none"
                                                                        keyboardType="email-address"
                                                                    />
                                                                </View>
                                                                <View style={{ minWidth: '30%', flex: 1 }}>
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Mobile</Text>
                                                                    <TextInput
                                                                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 } as any}
                                                                        value={editUserMobile}
                                                                        onChangeText={setEditUserMobile}
                                                                        keyboardType="numeric"
                                                                    />
                                                                </View>
                                                                <View style={{ minWidth: '30%', flex: 1 }}>
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Change Password (Optional)</Text>
                                                                    <TextInput
                                                                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 } as any}
                                                                        placeholder="New password"
                                                                        placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                                                                        value={editUserPassword}
                                                                        onChangeText={setEditUserPassword}
                                                                        secureTextEntry
                                                                    />
                                                                </View>
                                                                <View style={{ minWidth: '15%', flex: 0.5 }}>
                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Attempt</Text>
                                                                    <TextInput
                                                                        style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#cbd5e1', fontSize: 12 } as any}
                                                                        value={editUserAttempt}
                                                                        onChangeText={setEditUserAttempt}
                                                                        keyboardType="numeric"
                                                                    />
                                                                </View>
                                                                <View style={{ minWidth: '15%', flex: 1, justifyContent: 'center' }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => setEditUserOnboarding(!editUserOnboarding)}
                                                                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
                                                                    >
                                                                        <Ionicons name={editUserOnboarding ? "checkmark-circle" : "ellipse-outline"} size={16} color={editUserOnboarding ? "#10b981" : (isDark ? '#6b7280' : '#9ca3af')} />
                                                                        <Text style={{ marginLeft: 6, color: isDark ? 'white' : '#111827', fontWeight: '500', fontSize: 11 }}>Setup Done</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>

                                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                                                                <TouchableOpacity onPress={() => handleUpdateUserDetails(u._id)} disabled={actionLoading === u._id} style={{ flex: 1, maxWidth: 150, padding: 10, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center' }}>
                                                                    {actionLoading === u._id ? <ActivityIndicator size="small" color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Save Changes</Text>}
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => setEditUserId(null)} style={{ flex: 1, maxWidth: 100, padding: 10, borderRadius: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', alignItems: 'center' }}>
                                                                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            )}

                            {/* Payment History Tab */}
                            {
                                activeTab === 'history' && paymentHistory && (
                                    <>
                                        {/* Summary Bar */}
                                        <View style={{
                                            backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 14, marginBottom: 16,
                                            borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', gap: 12
                                        }}>
                                            {[
                                                { label: 'Total', value: paymentHistory.summary?.total || 0, color: '#2563eb' },
                                                { label: 'Approved', value: paymentHistory.summary?.approved || 0, color: '#22c55e' },
                                                { label: 'Rejected', value: paymentHistory.summary?.rejected || 0, color: '#ef4444' },
                                                { label: 'Collected', value: `₹${(paymentHistory.summary?.collected || 0).toLocaleString('en-IN')}`, color: '#f59e0b' },
                                            ].map((s, i) => (
                                                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                                                    <Text style={{ color: s.color, fontSize: 18, fontWeight: 'bold' }}>{s.value}</Text>
                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, marginTop: 2 }}>{s.label}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Records */}
                                        {filterHistory(paymentHistory.records || []).length === 0 ? (
                                            <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                                                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>No history found</Text>
                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4 }}>Adjust the date filter to see more</Text>
                                            </View>
                                        ) : (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
                                                <View style={{ minWidth: 900, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 }}>
                                                    {/* Table Header */}
                                                    <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#374151' : '#f9fafb', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                                                        <Text style={{ flex: 2, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>USER</Text>
                                                        <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>APPROVED TIER</Text>
                                                        <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>AMOUNT & STATUS</Text>
                                                        <Text style={{ flex: 1.5, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>REVIEWED</Text>
                                                        <Text style={{ width: 100, color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>DETAILS</Text>
                                                    </View>

                                                    {filterHistory(paymentHistory.records || []).map((r: any, index: number) => {
                                                        const rowBgColor = index % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent';
                                                        return (
                                                            <View key={r._id}>
                                                                <View style={{
                                                                    flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16,
                                                                    backgroundColor: expandedUser === r._id ? (isDark ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6') : rowBgColor,
                                                                    borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {/* USER COL */}
                                                                    <View style={{ flex: 2, gap: 4 }}>
                                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold' }}>{r.userName}</Text>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                            <Ionicons name="mail" size={12} color={isDark ? '#6b7280' : '#9ca3af'} />
                                                                            <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 11 }}>{r.userEmail}</Text>
                                                                        </View>
                                                                    </View>

                                                                    {/* TIER COL */}
                                                                    <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                                                                        {r.approvedTier && TIER_INFO[r.approvedTier] ? (
                                                                            <View style={{ backgroundColor: `${TIER_INFO[r.approvedTier].color}20`, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 }}>
                                                                                <Text style={{ color: TIER_INFO[r.approvedTier].color, fontSize: 10, fontWeight: 'bold' }}>
                                                                                    {TIER_INFO[r.approvedTier].icon} {TIER_INFO[r.approvedTier].name}
                                                                                </Text>
                                                                            </View>
                                                                        ) : <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>—</Text>}
                                                                    </View>

                                                                    {/* AMOUNT COL */}
                                                                    <View style={{ flex: 1.5, gap: 4, alignItems: 'flex-start' }}>
                                                                        <Text style={{ color: r.status === 'approved' ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 'bold' }}>
                                                                            {r.status === 'approved' ? `₹${r.approvedAmount?.toLocaleString('en-IN')}` : '—'}
                                                                        </Text>
                                                                        <View style={{ backgroundColor: r.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 }}>
                                                                            <Text style={{ color: r.status === 'approved' ? '#22c55e' : '#ef4444', fontSize: 9, fontWeight: 'bold', textTransform: 'capitalize' }}>
                                                                                {r.status}
                                                                            </Text>
                                                                        </View>
                                                                    </View>

                                                                    {/* DATE COL */}
                                                                    <View style={{ flex: 1.5, gap: 4 }}>
                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 11 }}>
                                                                            {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                                        </Text>
                                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>By {r.reviewedBy}</Text>
                                                                    </View>

                                                                    {/* DETAILS COL */}
                                                                    <View style={{ width: 100, alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                        <TouchableOpacity
                                                                            onPress={() => setExpandedUser(expandedUser === r._id ? null : r._id)}
                                                                            style={{ padding: 6, backgroundColor: expandedUser === r._id ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'), borderRadius: 6 }}
                                                                        >
                                                                            <Ionicons name={expandedUser === r._id ? 'chevron-up' : 'chevron-down'} size={14} color={expandedUser === r._id ? 'white' : (isDark ? '#d1d5db' : '#4b5563')} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>

                                                                {/* Expanded Details section */}
                                                                {expandedUser === r._id && (
                                                                    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
                                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                                                                            {r.requestedTier && (
                                                                                <View style={{ flex: 1, minWidth: 120 }}>
                                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Requested</Text>
                                                                                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>
                                                                                        {r.requestedTier} {r.isAnnual ? '(Annual)' : '(Monthly)'}
                                                                                    </Text>
                                                                                </View>
                                                                            )}
                                                                            {r.approvedDuration && (
                                                                                <View style={{ flex: 1, minWidth: 120 }}>
                                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Duration</Text>
                                                                                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600' }}>{r.approvedDuration} month(s)</Text>
                                                                                </View>
                                                                            )}
                                                                            {r.approvedExpiry && (
                                                                                <View style={{ flex: 1, minWidth: 120 }}>
                                                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Expiry</Text>
                                                                                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600' }}>
                                                                                        {new Date(r.approvedExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                    </Text>
                                                                                </View>
                                                                            )}
                                                                            <View style={{ flex: 1, minWidth: 120 }}>
                                                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Method</Text>
                                                                                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                                                                                    {r.paymentMethod === 'manual' ? '💵' : r.paymentMethod === 'gateway' ? '🔗' : '🎓'} {r.paymentMethod}
                                                                                </Text>
                                                                            </View>
                                                                        </View>

                                                                        {(r.reviewNote || r.adminNote) && (
                                                                            <View style={{ marginTop: 16 }}>
                                                                                {r.reviewNote && (
                                                                                    <View style={{ marginBottom: 6 }}>
                                                                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginBottom: 4 }}>Note to user</Text>
                                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12 }}>{r.reviewNote}</Text>
                                                                                    </View>
                                                                                )}
                                                                                {r.adminNote && (
                                                                                    <View style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3cd', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fde68a' }}>
                                                                                        <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>🔒 Admin Note (Private)</Text>
                                                                                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12 }}>{r.adminNote}</Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </ScrollView>
                                        )}
                                    </>
                                )
                            }
                        </View>
                    )
                    }

                    {
                        adminTab === 'cms' && (
                            <AdminCMS />
                        )
                    }

                    {
                        adminTab === 'broadcast' && (
                            <AdminBroadcast />
                        )
                    }

                    {
                        adminTab === 'ai-notes' && (
                            <AdminNotes />
                        )
                    }

                    {
                        adminTab === 'audit-logs' && (
                            <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 12 }}>
                                        <Ionicons name="time" size={24} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Audit Logs</Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 2 }}>System-wide record of all administrative actions</Text>
                                    </View>
                                </View>

                                {auditLogs.length === 0 ? (
                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', padding: 40 }}>No audit logs recorded yet.</Text>
                                ) : (
                                    <View style={{ gap: 16 }}>
                                        {auditLogs.map((log, i) => (
                                            <View key={i} style={{ flexDirection: 'row', gap: 16 }}>
                                                <View style={{ width: 2, backgroundColor: isDark ? '#374151' : '#e5e7eb', position: 'absolute', top: 20, bottom: -16, left: 19 }} />
                                                <View style={{
                                                    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: log.action === 'APPROVE' ? 'rgba(16, 185, 129, 0.1)' :
                                                        log.action === 'REJECT' ? 'rgba(239, 68, 68, 0.1)' :
                                                            log.action === 'REVOKE' ? 'rgba(245, 158, 11, 0.1)' :
                                                                log.action === 'BROADCAST' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)'
                                                }}>
                                                    <Ionicons
                                                        name={
                                                            log.action === 'APPROVE' ? 'checkmark' :
                                                                log.action === 'REJECT' ? 'close' :
                                                                    log.action === 'REVOKE' ? 'warning' :
                                                                        log.action === 'BROADCAST' ? 'megaphone' : 'construct'
                                                        }
                                                        size={20}
                                                        color={
                                                            log.action === 'APPROVE' ? '#10b981' :
                                                                log.action === 'REJECT' ? '#ef4444' :
                                                                    log.action === 'REVOKE' ? '#f59e0b' :
                                                                        log.action === 'BROADCAST' ? '#3b82f6' : '#6b7280'
                                                        }
                                                    />
                                                </View>
                                                <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                            <Text style={{ fontWeight: 'bold', color: isDark ? 'white' : '#111827' }}>{log.adminName}</Text>
                                                            <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDark ? '#d1d5db' : '#4b5563' }}>{log.action}</Text>
                                                            </View>
                                                        </View>
                                                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>
                                                            {new Date(log.timestamp).toLocaleString('en-IN')}
                                                        </Text>
                                                    </View>

                                                    {log.targetUserName && (
                                                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, marginBottom: 4 }}>
                                                            Target: <Text style={{ fontWeight: '600' }}>{log.targetUserName}</Text> ({log.targetUserEmail})
                                                        </Text>
                                                    )}

                                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>
                                                        {log.details}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )
                    }
                </ScrollView>
            </View>
        </View>
    );
}
