import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

const GS_PAPERS = ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT'];

const PAPER_COLORS: Record<string, string> = {
    'GS I': '#3b82f6',
    'GS II': '#10b981',
    'GS III': '#f59e0b',
    'GS IV': '#8b5cf6',
    'CSAT': '#ec4899',
};

export default function TopicQuiz() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [activePaper, setActivePaper] = useState('GS I');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [topicsBySubject, setTopicsBySubject] = useState<Record<string, any[]>>({});
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [allTopicsBySubject, setAllTopicsBySubject] = useState<Record<string, any[]>>({});
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    // Fetch all subjects and topics once on mount for search
    useEffect(() => {
        fetchAllData();
    }, []);

    // When active paper changes (and no search is active), derive the visible subjects
    useEffect(() => {
        if (!searchQuery.trim() && allDataLoaded) {
            const paperSubjects = allSubjects.filter((s: any) =>
                s.name.startsWith(activePaper) || s.name.includes(activePaper)
            );
            setSubjects(paperSubjects);
            // Derive topicsBySubject for this paper from the master map
            const topicsMap: Record<string, any[]> = {};
            for (const subject of paperSubjects) {
                topicsMap[subject._id] = allTopicsBySubject[subject._id] || [];
            }
            setTopicsBySubject(topicsMap);
        }
    }, [activePaper, allDataLoaded, searchQuery]);

    const fetchAllData = async () => {
        try {
            setLoadingTopics(true);
            const res = await api.get('/subjects');
            const fetchedSubjects = res.data || [];
            setAllSubjects(fetchedSubjects);

            // Fetch topics for ALL subjects across all papers
            const topicsMap: Record<string, any[]> = {};
            for (const subject of fetchedSubjects) {
                const topicRes = await api.get(`/topics/subject/${subject._id}`);
                topicsMap[subject._id] = topicRes.data || [];
            }
            setAllTopicsBySubject(topicsMap);

            // Set initial paper view
            const paperSubjects = fetchedSubjects.filter((s: any) =>
                s.name.startsWith('GS I') || s.name.includes('GS I')
            );
            setSubjects(paperSubjects);
            const initialTopicsMap: Record<string, any[]> = {};
            for (const subject of paperSubjects) {
                initialTopicsMap[subject._id] = topicsMap[subject._id] || [];
            }
            setTopicsBySubject(initialTopicsMap);
            setAllDataLoaded(true);
        } catch (error) {
            console.error('Error fetching subjects/topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    };

    const toggleTopic = (topicId: string) => {
        setSelectedTopicIds(prev => {
            const next = new Set(prev);
            if (next.has(topicId)) {
                next.delete(topicId);
            } else {
                if (next.size >= 20) {
                    alert('Maximum 20 topics allowed.');
                    return prev;
                }
                next.add(topicId);
            }
            return next;
        });
    };

    const toggleSubject = (subjectId: string) => {
        setExpandedSubjects(prev => {
            const next = new Set(prev);
            if (next.has(subjectId)) next.delete(subjectId);
            else next.add(subjectId);
            return next;
        });
    };

    const selectAllInSubject = (subjectId: string) => {
        const topics = topicsBySubject[subjectId] || [];
        setSelectedTopicIds(prev => {
            const next = new Set(prev);
            const allSelected = topics.every(t => next.has(t._id));
            if (allSelected) {
                topics.forEach(t => next.delete(t._id));
            } else {
                topics.forEach(t => {
                    if (next.size < 20) next.add(t._id);
                });
            }
            return next;
        });
    };

    // Search filtering logic
    const getFilteredData = () => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return { filteredSubjects: subjects, filteredTopicsBySubject: topicsBySubject };

        // Search across ALL papers
        const matchingSubjects: any[] = [];
        const matchingTopicsMap: Record<string, any[]> = {};

        for (const subject of allSubjects) {
            const subjectTopics = allTopicsBySubject[subject._id] || [];
            const matchedTopics = subjectTopics.filter((t: any) =>
                t.title?.toLowerCase().includes(q) ||
                t.chapter?.toLowerCase().includes(q) ||
                subject.name?.toLowerCase().includes(q)
            );
            if (matchedTopics.length > 0) {
                matchingSubjects.push(subject);
                matchingTopicsMap[subject._id] = matchedTopics;
            }
        }

        return { filteredSubjects: matchingSubjects, filteredTopicsBySubject: matchingTopicsMap };
    };

    const { filteredSubjects, filteredTopicsBySubject } = getFilteredData();
    const isSearching = searchQuery.trim().length > 0;

    const handleGenerate = async () => {
        if (selectedTopicIds.size < 5) {
            alert('Please select at least 5 topics.');
            return;
        }
        try {
            setGenerating(true);
            const res = await api.post('/quiz/generate-topic', { topicIds: Array.from(selectedTopicIds) });
            router.replace(`/quiz?id=${res.data._id}`);
        } catch (error: any) {
            console.error('Error generating topic quiz:', error);
            alert(error.response?.data?.message || 'Failed to generate quiz.');
        } finally {
            setGenerating(false);
        }
    };

    const selectedCount = selectedTopicIds.size;
    const canGenerate = selectedCount >= 5 && selectedCount <= 20;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            {/* Header */}
            <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Custom Quiz</Text>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Topic Quiz Generator</Text>
                    </View>
                    <View style={{ backgroundColor: canGenerate ? '#10b98120' : (isDark ? '#374151' : '#e5e7eb'), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                        <Text style={{ color: canGenerate ? '#10b981' : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold', fontSize: 14 }}>{selectedCount} selected</Text>
                    </View>
                </View>

                {/* GS Paper Tabs */}
                {!isSearching && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {GS_PAPERS.map(paper => {
                                const isActive = activePaper === paper;
                                const color = PAPER_COLORS[paper];
                                return (
                                    <TouchableOpacity
                                        key={paper}
                                        onPress={() => setActivePaper(paper)}
                                        style={{
                                            paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
                                            backgroundColor: isActive ? color : (isDark ? '#1f2937' : '#f3f4f6'),
                                            borderWidth: 1, borderColor: isActive ? color : (isDark ? '#374151' : '#e5e7eb')
                                        }}
                                    >
                                        <Text style={{ color: isActive ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold', fontSize: 14 }}>{paper}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}

                {/* Search Bar */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 14, borderWidth: 1,
                    borderColor: isSearching ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb'),
                    paddingHorizontal: 14, paddingVertical: Platform.OS === 'web' ? 10 : 4,
                }}>
                    <Ionicons name="search" size={18} color={isSearching ? '#8b5cf6' : (isDark ? '#6b7280' : '#9ca3af')} />
                    <TextInput
                        ref={searchInputRef}
                        style={{
                            flex: 1, marginLeft: 10, fontSize: 14,
                            color: isDark ? 'white' : '#111827',
                            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
                            paddingVertical: 6,
                        }}
                        placeholder="Search topics across all papers..."
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {isSearching && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); searchInputRef.current?.blur(); }} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    )}
                </View>
                {isSearching && (
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 8 }}>
                        Found {filteredSubjects.reduce((acc, s) => acc + (filteredTopicsBySubject[s._id]?.length || 0), 0)} topics across {filteredSubjects.length} subjects
                    </Text>
                )}
            </View>

            {/* Topics List */}
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                {loadingTopics ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 12 }}>Loading topics...</Text>
                    </View>
                ) : filteredSubjects.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Ionicons name={isSearching ? 'search-outline' : 'folder-open-outline'} size={48} color={isDark ? '#4b5563' : '#d1d5db'} />
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 12 }}>
                            {isSearching ? `No topics matching "${searchQuery}"` : `No subjects found for ${activePaper}`}
                        </Text>
                        {isSearching && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#8b5cf620', borderRadius: 20 }}>
                                <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>Clear Search</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredSubjects.map(subject => {
                        const topics = filteredTopicsBySubject[subject._id] || [];
                        const isExpanded = isSearching || expandedSubjects.has(subject._id);
                        const allSubjectTopics = allTopicsBySubject[subject._id] || [];
                        const selectedInSubject = allSubjectTopics.filter(t => selectedTopicIds.has(t._id)).length;
                        const allSelectedInSubject = allSubjectTopics.length > 0 && selectedInSubject === allSubjectTopics.length;

                        return (
                            <View key={subject._id} style={{ marginBottom: 16, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden' }}>
                                {/* Subject Header */}
                                <TouchableOpacity
                                    onPress={() => toggleSubject(subject._id)}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>{subject.name}</Text>
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>
                                            {isSearching ? `${topics.length} matches` : `${topics.length} topics`} • {selectedInSubject} selected
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        {!isSearching && (
                                            <TouchableOpacity
                                                onPress={(e) => { e.stopPropagation(); selectAllInSubject(subject._id); }}
                                                style={{ backgroundColor: allSelectedInSubject ? '#10b98120' : (isDark ? '#374151' : '#f3f4f6'), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                            >
                                                <Text style={{ color: allSelectedInSubject ? '#10b981' : (isDark ? '#d1d5db' : '#6b7280'), fontSize: 12, fontWeight: 'bold' }}>
                                                    {allSelectedInSubject ? 'Deselect All' : 'Select All'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                                    </View>
                                </TouchableOpacity>

                                {/* Topic Checkboxes */}
                                {isExpanded && (
                                    <View style={{ borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 16, paddingBottom: 12 }}>
                                        {topics.map((topic: any) => {
                                            const isSelected = selectedTopicIds.has(topic._id);
                                            return (
                                                <TouchableOpacity
                                                    key={topic._id}
                                                    onPress={() => toggleTopic(topic._id)}
                                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#1f293780' : '#f3f4f6' }}
                                                >
                                                    <View style={{
                                                        width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                                                        borderColor: isSelected ? '#8b5cf6' : (isDark ? '#4b5563' : '#d1d5db'),
                                                        backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: '500' }}>{topic.title}</Text>
                                                        {topic.chapter && <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, marginTop: 2 }}>{topic.chapter}</Text>}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Sticky Generate Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: isDark ? '#111827' : '#f9fafb', borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                <TouchableOpacity
                    onPress={handleGenerate}
                    disabled={!canGenerate || generating}
                    style={{
                        backgroundColor: canGenerate ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb'),
                        paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        opacity: canGenerate ? 1 : 0.5
                    }}
                >
                    {generating ? <ActivityIndicator color="white" /> : <Ionicons name="sparkles" size={20} color={canGenerate ? 'white' : (isDark ? '#9ca3af' : '#6b7280')} />}
                    <Text style={{ color: canGenerate ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
                        {generating ? 'Generating 25 Questions...' : `Generate Quiz (${selectedCount} topics)`}
                    </Text>
                </TouchableOpacity>
                {selectedCount < 5 && (
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                        Select at least 5 topics to generate a quiz (max 20)
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
}
