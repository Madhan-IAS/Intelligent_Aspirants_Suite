import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function HealthDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [healthData, setHealthData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.replace('/');
            return;
        }
        fetchHealth();
    }, [user]);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            // Bypassing normal interceptor logic just in case API is partly down
            const res = await api.get('/health', { baseURL: api.defaults.baseURL?.replace('/api', '') + '/api' });
            setHealthData(res.data);
        } catch (error) {
            console.error('Failed to fetch health check:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }} />;
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }} contentContainerStyle={{ padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 }}>
                <TouchableOpacity onPress={() => router.replace('/admin')} style={{ padding: 8, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 8 }}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>Server Health Dashboard</Text>
                <TouchableOpacity onPress={fetchHealth} style={{ marginLeft: 'auto', padding: 8, backgroundColor: '#2563eb', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {loading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="refresh" size={18} color="white" />}
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading && !healthData ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : healthData ? (
                <View style={{ gap: 20 }}>
                    {/* Status Card */}
                    <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: healthData.status === 'running' ? '#22c55e' : '#ef4444' }} />
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>API Status: {healthData.status.toUpperCase()}</Text>
                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Last Checked: {new Date(healthData.timestamp).toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Metrics Grid */}
                    <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16, flexWrap: 'wrap' }}>

                        {/* Database */}
                        <View style={{ flex: 1, minWidth: 280, backgroundColor: isDark ? '#1f2937' : 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Ionicons name="server" size={24} color="#3b82f6" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>Database</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14 }}>Connection: <Text style={{ color: healthData.database === 'connected' ? '#22c55e' : '#f59e0b', fontWeight: 'bold' }}>{healthData.database.toUpperCase()}</Text></Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>URI Configured: {healthData.uri_configured ? 'True' : 'False'}</Text>
                        </View>

                        {/* Server App Memory */}
                        <View style={{ flex: 1, minWidth: 280, backgroundColor: isDark ? '#1f2937' : 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Ionicons name="hardware-chip" size={24} color="#8b5cf6" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>Node.js Memory (V8)</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14 }}>RSS: <Text style={{ fontWeight: 'bold' }}>{healthData.memory.rss}</Text></Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>Heap Total: {healthData.memory.heapTotal}</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>Heap Used: {healthData.memory.heapUsed}</Text>
                        </View>

                        {/* System OS Resources */}
                        <View style={{ flex: 1, minWidth: 280, backgroundColor: isDark ? '#1f2937' : 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Ionicons name="speedometer" size={24} color="#ef4444" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>System OS (VM)</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14 }}>Total Mem: {healthData.system.totalMem}</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>Free Mem: {healthData.system.freeMem}</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>CPU Cores: {healthData.system.cpus}</Text>
                        </View>

                        {/* UPTIME */}
                        <View style={{ flex: 1, minWidth: 280, backgroundColor: isDark ? '#1f2937' : 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Ionicons name="time" size={24} color="#f59e0b" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : 'black' }}>Uptime Sync</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14 }}>Node Process: <Text style={{ fontWeight: 'bold' }}>{Math.floor(healthData.uptime_seconds / 60)} min</Text></Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, marginTop: 8 }}>VM Up: {Math.floor(healthData.system_uptime / 3600)} hours</Text>
                        </View>

                    </View>
                </View>
            ) : (
                <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Failed to load health check.</Text>
            )}
        </ScrollView>
    );
}
