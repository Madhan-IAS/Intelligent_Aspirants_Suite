import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

const CATEGORIES = ['All', 'Philosophical', 'Social', 'Political', 'Economic', 'Science & Tech', 'Environment', 'Ethics', 'Abstract'];

const DIMENSION_COLORS: Record<string, string> = {
    'Society': '#f43f5e', 'Polity & Governance': '#8b5cf6', 'Economy': '#f59e0b',
    'Culture & History': '#ec4899', 'Technology & Science': '#06b6d4',
    'International Relations': '#3b82f6', 'Environment & Geography': '#10b981',
    'Ethics & Integrity': '#6366f1',
};

const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444',
};

export default function EssaysPage() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const router = useRouter();
    const [themes, setThemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [gallery, setGallery] = useState<any[]>([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const isDesktop = Platform.OS === 'web' && window.innerWidth > 768;

    const [writingEssayId, setWritingEssayId] = useState<string | null>(null);
    const [essayContent, setEssayContent] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<any>(null);

    useEffect(() => {
        fetchThemes();
        fetchGallery();
    }, []);

    const fetchThemes = async () => {
        try {
            const res = await api.get('/essays');
            setThemes(res.data);
        } catch (err) {
            console.error('Failed to fetch essay themes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGallery = async () => {
        setLoadingGallery(true);
        try {
            const res = await api.get('/answers/gallery');
            setGallery(res.data);
        } catch (err) {
            console.error('Failed to fetch gallery:', err);
        } finally {
            setLoadingGallery(false);
        }
    };

    const handleEvaluate = async (themeId: string) => {
        if (essayContent.length < 50) return alert('Please write a slightly longer essay to get a meaningful evaluation.');

        setEvaluating(true);
        try {
            const res = await api.post('/ai/evaluate-essay', { essayId: themeId, content: essayContent });
            setEvaluationResult({ ...res.data, themeId });
        } catch (err) {
            console.error('Evaluation failed:', err);
            alert('Evaluation failed. Please try again.');
        } finally {
            setEvaluating(false);
        }
    };

    const handleUpvote = async (answerId: string) => {
        try {
            const res = await api.post(`/answers/${answerId}/upvote`);
            alert('+10 Reputation to Author! Answer upvoted.');
            fetchGallery();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to upvote');
        }
    };

    const filtered = activeCategory === 'All' ? themes : themes.filter(t => t.category === activeCategory);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ padding: isDesktop ? 40 : 20, paddingBottom: 100 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>✍️ SPECTRUM Essay Lab</Text>
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 13, marginTop: 2 }}>Multi-dimensional essay themes • Answer Gallery • Critical thinking</Text>
                </View>
                <TouchableOpacity onPress={() => setShowGallery(!showGallery)} style={{ backgroundColor: showGallery ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb'), paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="trophy" size={16} color={showGallery ? 'white' : (isDark ? '#d1d5db' : '#374151')} />
                    <Text style={{ color: showGallery ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: 'bold', fontSize: 13 }}>{showGallery ? 'Show Themes' : 'Answer Gallery'}</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter */}
            {!showGallery && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            style={{
                                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                                backgroundColor: activeCategory === cat ? '#8b5cf6' : (isDark ? '#1f2937' : '#ffffff'),
                                borderWidth: 1, borderColor: activeCategory === cat ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb')
                            }}
                        >
                            <Text style={{ color: activeCategory === cat ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: activeCategory === cat ? 'bold' : '500', fontSize: 13 }}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Answer Gallery View */}
            {showGallery && (
                <View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>🏆 Top Evaluated Answers</Text>
                    {loadingGallery ? (
                        <ActivityIndicator size="small" color="#8b5cf6" />
                    ) : gallery.length > 0 ? (
                        gallery.map((answer, idx) => (
                            <View key={answer._id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
                                        <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>Score: {answer.score}/{answer.pyqId?.marks || 10}</Text>
                                    </View>
                                    {answer.pyqId?.year && (
                                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>UPSC {answer.pyqId.year}</Text>
                                    )}
                                </View>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 14, lineHeight: 20, marginBottom: 6 }}>{answer.pyqId?.question}</Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, lineHeight: 18 }} numberOfLines={3}>{answer.content}</Text>
                                {answer.aiEvaluation?.feedback && (
                                    <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 10, borderRadius: 8, marginTop: 8 }}>
                                        <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>AI Feedback:</Text>
                                        <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 11, lineHeight: 16 }} numberOfLines={2}>{answer.aiEvaluation.feedback}</Text>
                                    </View>
                                )}

                                {/* Upvote Gamification */}
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => handleUpvote(answer._id)}
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#374151' : 'white', borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 }}
                                    >
                                        <Ionicons name="heart" size={16} color="#ef4444" />
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold' }}>{answer.upvotes || 0}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{ padding: 32, alignItems: 'center' }}>
                            <Ionicons name="trophy-outline" size={44} color={isDark ? '#4b5563' : '#9ca3af'} />
                            <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16, marginTop: 12 }}>No Evaluated Answers Yet</Text>
                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, marginTop: 4, textAlign: 'center' }}>Write and get your answers evaluated via PYQs to appear here.</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Essay Themes Grid */}
            {!showGallery && (
                <View style={{ flexDirection: isDesktop ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
                    {filtered.length > 0 ? filtered.map(theme => (
                        <View key={theme._id} style={{ width: isDesktop ? '48%' : '100%', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            {/* Category + Difficulty */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
                                    <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 11, fontWeight: 'bold' }}>{theme.category}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    {theme.year && (
                                        <View style={{ backgroundColor: 'rgba(59,130,246,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}>PYQ {theme.year}</Text>
                                        </View>
                                    )}
                                    <View style={{ backgroundColor: `${DIFFICULTY_COLORS[theme.difficulty]}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: DIFFICULTY_COLORS[theme.difficulty], fontSize: 10, fontWeight: 'bold' }}>{theme.difficulty}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', lineHeight: 22, marginBottom: 10 }}>"{theme.title}"</Text>

                            {/* SPECTRUM Dimension Tags */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                {theme.spectrumDimensions?.map((dim: string) => (
                                    <View key={dim} style={{ backgroundColor: `${DIMENSION_COLORS[dim] || '#6b7280'}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: `${DIMENSION_COLORS[dim] || '#6b7280'}30` }}>
                                        <Text style={{ color: DIMENSION_COLORS[dim] || '#6b7280', fontSize: 10, fontWeight: 'bold' }}>{dim}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Expand/Collapse Angles */}
                            <TouchableOpacity onPress={() => setExpandedId(expandedId === theme._id ? null : theme._id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name={expandedId === theme._id ? 'chevron-up' : 'chevron-down'} size={14} color="#8b5cf6" />
                                <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 'bold' }}>{expandedId === theme._id ? 'Hide' : 'Show'} Sample Angles ({theme.sampleAngles?.length || 0})</Text>
                            </TouchableOpacity>

                            {expandedId === theme._id && theme.sampleAngles?.length > 0 && (
                                <View style={{ marginTop: 10, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 8 }}>
                                    {theme.sampleAngles.map((angle: string, idx: number) => (
                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                                            <Text style={{ color: '#8b5cf6', fontSize: 12, marginTop: 1 }}>•</Text>
                                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, lineHeight: 18, flex: 1 }}>{angle}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Write & Evaluate Action */}
                            <TouchableOpacity onPress={() => { setWritingEssayId(writingEssayId === theme._id ? null : theme._id); setEvaluationResult(null); }} style={{ marginTop: 12, backgroundColor: writingEssayId === theme._id ? (isDark ? '#374151' : '#e5e7eb') : '#10b981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}>
                                <Text style={{ color: writingEssayId === theme._id ? (isDark ? '#d1d5db' : '#374151') : 'white', fontWeight: 'bold' }}>{writingEssayId === theme._id ? 'Cancel Writing' : 'Write & Evaluate AI'}</Text>
                            </TouchableOpacity>

                            {/* Editor Area */}
                            {writingEssayId === theme._id && !evaluationResult && (
                                <View style={{ marginTop: 16 }}>
                                    <TextInput
                                        multiline
                                        numberOfLines={10}
                                        placeholder="Start typing your essay here... AI will evaluate it out of 125 marks based on the SPECTRUM dimensions above."
                                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                        style={{ height: 250, textAlignVertical: 'top', backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? 'white' : '#111827', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                                        value={essayContent}
                                        onChangeText={setEssayContent}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleEvaluate(theme._id)}
                                        disabled={evaluating}
                                        style={{ marginTop: 12, backgroundColor: '#8b5cf6', paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                    >
                                        {evaluating ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="sparkles" size={16} color="white" />}
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{evaluating ? 'Evaluating...' : 'Submit for AI Evaluation'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Evaluation Result */}
                            {evaluationResult && evaluationResult.themeId === theme._id && (
                                <View style={{ marginTop: 16, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#10b981' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>AI Evaluation Scorecard</Text>
                                        <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                                            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>{evaluationResult.marks}/125</Text>
                                        </View>
                                    </View>

                                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: 4, fontSize: 13 }}>Strengths:</Text>
                                    {evaluationResult.strengths?.map((s: string, i: number) => (
                                        <Text key={i} style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 2 }}>✓ {s}</Text>
                                    ))}

                                    <Text style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 12, marginBottom: 4, fontSize: 13 }}>Missing Dimensions:</Text>
                                    {evaluationResult.missingDimensions?.map((m: string, i: number) => (
                                        <Text key={i} style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 2 }}>◦ {m}</Text>
                                    ))}

                                    <Text style={{ color: '#f59e0b', fontWeight: 'bold', marginTop: 12, marginBottom: 4, fontSize: 13 }}>Feedback:</Text>
                                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, lineHeight: 18 }}>{evaluationResult.feedback}</Text>

                                    <Text style={{ color: '#8b5cf6', fontWeight: 'bold', marginTop: 12, marginBottom: 4, fontSize: 13 }}>Model Paragraph Example:</Text>
                                    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontStyle: 'italic', fontSize: 12, lineHeight: 18 }}>"{evaluationResult.modelParagraph}"</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )) : (
                        <View style={{ padding: 32, alignItems: 'center', width: '100%' }}>
                            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 14 }}>No essay themes found for "{activeCategory}".</Text>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}
