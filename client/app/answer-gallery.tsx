import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

const PAPERS = ['GS I', 'GS II', 'GS III', 'GS IV'];

const PAPER_CONFIG: Record<string, { color: string; bg: string }> = {
    'GS I': { color: '#3b82f6', bg: '#eff6ff' },
    'GS II': { color: '#10b981', bg: '#ecfdf5' },
    'GS III': { color: '#f59e0b', bg: '#fffbeb' },
    'GS IV': { color: '#ec4899', bg: '#fdf2f8' },
};

export default function AnswerGalleryPage() {
    const router = useRouter();
    const { mode } = useTheme();
    const { user } = useAuth();
    const isDark = mode === 'dark';
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<any[]>([]);
    const [activePaper, setActivePaper] = useState('GS I');
    const [followingCache, setFollowingCache] = useState<Record<string, { isFollowing: boolean, count: number }>>({});

    useEffect(() => {
        fetchGallery(activePaper);
    }, [activePaper]);

    const fetchGallery = async (paper: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/gallery?paper=${encodeURIComponent(paper)}`);
            setAnswers(res.data);

            // Initialize follow cache
            const cache: any = {};
            if (user) {
                res.data.forEach((ans: any) => {
                    if (ans.userId) {
                        cache[ans.userId._id] = {
                            isFollowing: ans.userId.followers?.includes(user._id),
                            count: ans.userId.followers?.length || 0,
                        };
                    }
                });
                setFollowingCache(cache);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFollow = async (targetUserId: string) => {
        if (!user) return; // Must be logged in

        // Optimistic UI Update
        const currentData = followingCache[targetUserId];
        const newIsFollowing = !currentData.isFollowing;
        const newCount = currentData.count + (newIsFollowing ? 1 : -1);

        setFollowingCache(prev => ({
            ...prev,
            [targetUserId]: {
                isFollowing: newIsFollowing,
                count: newCount
            }
        }));

        try {
            await api.post(`/auth/${targetUserId}/follow`);
        } catch (error) {
            // Revert on failure
            setFollowingCache(prev => ({
                ...prev,
                [targetUserId]: currentData
            }));
            console.error('Error toggling follow:', error);
        }
    };

    const themeColors = {
        bg: isDark ? '#111827' : '#f9fafb',
        cardBg: isDark ? '#1f2937' : '#ffffff',
        text: isDark ? '#f9fafb' : '#111827',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
    };

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.bg }}>
            {/* Header */}
            <View style={{ padding: 24, backgroundColor: themeColors.cardBg, borderBottomWidth: 1, borderBottomColor: themeColors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: themeColors.text, marginBottom: 4 }}>AI Hall of Fame</Text>
                    <Text style={{ fontSize: 14, color: themeColors.textMuted }}>Top Evaluated Answers by Aspirants</Text>
                </View>
                {isDesktop && (
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                        <Ionicons name="arrow-back" size={20} color={themeColors.textMuted} />
                        <Text style={{ marginLeft: 8, color: themeColors.textMuted, fontWeight: '500' }}>Back</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Paper Tabs */}
            <View style={{ backgroundColor: themeColors.cardBg, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {PAPERS.map(paper => {
                        const isActive = activePaper === paper;
                        const config = PAPER_CONFIG[paper];
                        return (
                            <TouchableOpacity
                                key={paper}
                                onPress={() => setActivePaper(paper)}
                                style={{
                                    paddingVertical: 16,
                                    paddingHorizontal: 24,
                                    borderBottomWidth: 3,
                                    borderBottomColor: isActive ? config.color : 'transparent',
                                }}
                            >
                                <Text style={{
                                    fontSize: 15,
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? config.color : themeColors.textMuted
                                }}>{paper}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={PAPER_CONFIG[activePaper].color} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {answers.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Ionicons name="document-text-outline" size={48} color={themeColors.textMuted} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <Text style={{ fontSize: 16, color: themeColors.textMuted }}>No top evaluated answers found for {activePaper}.</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: isDesktop ? 'row' : 'column', flexWrap: 'wrap', gap: 24 }}>
                            {answers.map(answer => {
                                const author = answer.userId;
                                const pyq = answer.pyqId || {};
                                const evalData = answer.aiEvaluation || {};
                                const authorNetwork = author ? followingCache[author._id] : { isFollowing: false, count: 0 };
                                const isSelf = user && author && user._id === author._id;

                                return (
                                    <View key={answer._id} style={{
                                        width: isDesktop ? 'calc(50% - 12px)' : '100%',
                                        backgroundColor: themeColors.cardBg,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: themeColors.border,
                                        overflow: 'hidden'
                                    }}>
                                        {/* Score Banner */}
                                        <View style={{
                                            backgroundColor: PAPER_CONFIG[activePaper].bg,
                                            padding: 16,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottomWidth: 1,
                                            borderBottomColor: PAPER_CONFIG[activePaper].color + '33'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="trophy" size={20} color={PAPER_CONFIG[activePaper].color} />
                                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: PAPER_CONFIG[activePaper].color, marginLeft: 8 }}>
                                                    {evalData.score} / {pyq.marks || 10}
                                                </Text>
                                            </View>
                                            <View style={{ backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: themeColors.border }}>
                                                <Text style={{ fontSize: 12, fontWeight: '600', color: themeColors.textMuted }}>{pyq.directive || 'Answer'}</Text>
                                            </View>
                                        </View>

                                        <View style={{ padding: 20 }}>
                                            {/* Question */}
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: themeColors.text, marginBottom: 16, lineHeight: 24 }}>
                                                Q. {pyq.question || 'Unknown Question'}
                                            </Text>

                                            {/* Top Strengths Snippet */}
                                            {evalData.strengths && evalData.strengths.length > 0 && (
                                                <View style={{ backgroundColor: isDark ? '#064e3b' : '#ecfdf5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#34d399' : '#059669', marginBottom: 4 }}>AI STRENGTHS</Text>
                                                    <Text style={{ fontSize: 13, color: isDark ? '#a7f3d0' : '#065f46', lineHeight: 20 }}>• {evalData.strengths[0]}</Text>
                                                </View>
                                            )}

                                            {/* Author Profile + Follow */}
                                            {author && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: themeColors.border }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: PAPER_CONFIG[activePaper].color, justifyContent: 'center', alignItems: 'center' }}>
                                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{author.name?.charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                        <View style={{ marginLeft: 12 }}>
                                                            <Text style={{ fontSize: 15, fontWeight: '600', color: themeColors.text }}>{author.name}</Text>
                                                            <Text style={{ fontSize: 12, color: themeColors.textMuted }}>{authorNetwork.count} Followers</Text>
                                                        </View>
                                                    </View>

                                                    {!isSelf && (
                                                        <TouchableOpacity
                                                            onPress={() => handleToggleFollow(author._id)}
                                                            style={{
                                                                backgroundColor: authorNetwork.isFollowing ? 'transparent' : PAPER_CONFIG[activePaper].color,
                                                                borderWidth: 1,
                                                                borderColor: authorNetwork.isFollowing ? themeColors.border : PAPER_CONFIG[activePaper].color,
                                                                paddingHorizontal: 16,
                                                                paddingVertical: 8,
                                                                borderRadius: 20
                                                            }}
                                                        >
                                                            <Text style={{
                                                                fontSize: 13,
                                                                fontWeight: '600',
                                                                color: authorNetwork.isFollowing ? themeColors.textMuted : 'white'
                                                            }}>{authorNetwork.isFollowing ? 'Following' : 'Follow'}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
