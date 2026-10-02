import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

export default function LeaderboardScreen() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/gamification/leaderboard');
                setLeaderboard(res.data.leaderboard || []);
            } catch (err) {
                console.error('Failed to load leaderboard', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankColor = (index: number) => {
        if (index === 0) return '#fbbf24'; // Gold
        if (index === 1) return '#94a3b8'; // Silver
        if (index === 2) return '#b45309'; // Bronze
        return isDark ? '#374151' : '#e5e7eb';
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#4f46e5', padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
                <Ionicons name="trophy" size={60} color="#fbbf24" style={{ marginBottom: 16 }} />
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>Global Leaderboard</Text>
                <Text style={{ color: '#e0e7ff', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
                    Compete with thousands of Aspirants globally. Every topic you master in the Mission Engine increases your Gamified XP rank.
                </Text>
            </View>

            <View style={{ padding: 24, maxWidth: 800, width: '100%', alignSelf: 'center', marginTop: -20 }}>
                <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 20, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
                    {loading ? (
                        <ActivityIndicator color="#4f46e5" size="large" style={{ padding: 40 }} />
                    ) : leaderboard.length === 0 ? (
                        <View style={{ alignItems: 'center', padding: 40 }}>
                            <Ionicons name="medal-outline" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 12 }}>No rankings calculated yet.</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 12 }}>
                            {leaderboard.map((user, index) => (
                                <View key={user._id} style={{
                                    flexDirection: 'row', alignItems: 'center', padding: 16,
                                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                                    borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#f3f4f6'
                                }}>
                                    {/* Rank Badge */}
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: getRankColor(index),
                                        alignItems: 'center', justifyContent: 'center', marginRight: 16
                                    }}>
                                        <Text style={{
                                            color: index <= 2 ? 'white' : (isDark ? 'white' : '#111827'),
                                            fontWeight: 'bold', fontSize: 16
                                        }}>
                                            #{index + 1}
                                        </Text>
                                    </View>

                                    {/* User Details */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>
                                            {user.name}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 10 }}>{user.optionalSubject || 'TBD'}</Text>
                                            </View>
                                            <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 10 }}>CSE {user.targetYear || 'TBD'}</Text>
                                            </View>
                                            {user.currentStreak > 0 && (
                                                <View style={{ backgroundColor: '#f97316', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                                    <Ionicons name="flame" size={10} color="white" />
                                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{user.currentStreak} Day</Text>
                                                </View>
                                            )}
                                            {user.streakMultiplier > 1 && (
                                                <View style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{user.streakMultiplier}x XP</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* XP Score */}
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: '#4f46e5', fontSize: 20, fontWeight: '900' }}>
                                            {user.score}
                                        </Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, fontWeight: 'bold' }}>XP</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
