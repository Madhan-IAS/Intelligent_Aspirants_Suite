import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function GSModule() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('');

  useEffect(() => {
    fetchTopics();
  }, [id]);

  const fetchTopics = async () => {
    try {
      const response = await api.get(`/topics/subject/${id}`);
      setTopics(response.data);

      if (response.data.length > 0) {
        const firstSubj = response.data[0].subjectName || 'General';
        setSelectedSubject(firstSubj);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckbox = async (topicId: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.nativeEvent && e.nativeEvent.stopPropagation) e.nativeEvent.stopPropagation();

    const topic = topics.find(t => t._id === topicId);
    if (!topic) return;

    const nextCompleted = !(topic.completed || topic.status === 'Completed');
    const nextStatus = nextCompleted ? 'Completed' : 'Pending';

    try {
      // Optimistic update
      setTopics(prev => prev.map(t => {
        if (t._id === topicId) {
          return {
            ...t,
            completed: nextCompleted,
            status: nextStatus
          };
        }
        return t;
      }));

      try {
        await api.put(`/topics/${topicId}`, {
          completed: nextCompleted,
          status: nextStatus
        });
      } catch (err) {
        await api.patch(`/topics/${topicId}/status`, {
          status: nextStatus
        });
      }
    } catch (error) {
      console.error('Error toggling topic completion:', error);
      fetchTopics();
    }
  };

  const toggleChapter = (chapterName: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterName]: !prev[chapterName] }));
  };

  const handleAddTopic = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/topics', {
        title: newTitle,
        subjectId: id,
        paper: id,
        subjectName: selectedSubject === 'All' ? 'General' : selectedSubject,
        chapter: newChapter.trim() || 'General Topics',
        heading: newChapter.trim() || 'General Topics',
        topicCode: `CUSTOM-${Date.now().toString().slice(-4)}`,
        difficulty: 'Medium',
        tags: [selectedSubject]
      });
      setNewTitle('');
      setNewChapter('');
      setShowAddForm(false);
      fetchTopics();
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#60a5fa" />
    </View>
  );

  // Level 1 Subjects List
  const subjectsList = Array.from(new Set(topics.map(t => t.subjectName || 'General'))).filter(Boolean);

  const activeSubjectName = selectedSubject === 'All' && subjectsList.length > 0 ? subjectsList[0] : selectedSubject;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTopics = topics.filter(t => {
    const matchesSubject = activeSubjectName === 'All' || (t.subjectName || 'General') === activeSubjectName;
    if (!matchesSubject) return false;

    if (!normalizedQuery) return true;

    const titleMatch = (t.title || '').toLowerCase().includes(normalizedQuery);
    const codeMatch = (t.topicCode || '').toLowerCase().includes(normalizedQuery);
    const chapterMatch = (t.chapter || '').toLowerCase().includes(normalizedQuery);
    const subjectMatch = (t.subjectName || '').toLowerCase().includes(normalizedQuery);

    return titleMatch || codeMatch || chapterMatch || subjectMatch;
  });

  // Level 2 Chapters Map: { ChapterName: Topic[] }
  const chaptersMap: { [chapter: string]: any[] } = {};
  filteredTopics.forEach(t => {
    const chap = t.chapter || 'General Topics';
    if (!chaptersMap[chap]) chaptersMap[chap] = [];
    chaptersMap[chap].push(t);
  });

  const totalCount = topics.length;
  const completedCount = topics.filter(t => t.completed || t.status === 'Completed').length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const progressColor = overallProgress >= 70 ? '#10b981' : (overallProgress >= 30 ? '#f59e0b' : '#ef4444');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 80 }}>
      
      {/* Paper Header */}
      <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>AIS Syllabus Framework</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase' }}>{id}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name={showAddForm ? "close" : "add"} size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>
            {showAddForm ? 'Cancel' : 'Add Topic'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Syllabus Completion Tracker */}
      <View style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.6)' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 20, borderRadius: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', fontSize: 16 }}>Paper Completion Tracker</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>
              {completedCount} of {totalCount} Checkbox Topics Completed
            </Text>
          </View>
          <Text style={{ color: progressColor, fontWeight: 'bold', fontSize: 22 }}>
            {overallProgress}%
          </Text>
        </View>
        <View style={{ height: 10, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
          <View style={{ width: `${overallProgress}%`, height: '100%', backgroundColor: progressColor, borderRadius: 5 }} />
        </View>
      </View>

      {/* Real-Time Topic Search Bar */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#ffffff', 
        borderRadius: 16, 
        borderWidth: 1.5, 
        borderColor: searchQuery ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'), 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        marginBottom: 20, 
        flexDirection: 'row', 
        alignItems: 'center' 
      }}>
        <Ionicons name="search" size={20} color={searchQuery ? '#3b82f6' : (isDark ? '#9ca3af' : '#6b7280')} style={{ marginRight: 12 }} />
        <TextInput 
          placeholder="Search subtopics by title, topic code (e.g. GS1-ART-001), or chapter..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ 
            flex: 1, 
            color: isDark ? 'white' : '#111827', 
            fontSize: 15, 
            fontWeight: '500', 
            outlineStyle: 'none' 
          } as any}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Result Summary Badge */}
      {normalizedQuery.length > 0 && (
        <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>
            Found {filteredTopics.length} matching subtopic{filteredTopics.length === 1 ? '' : 's'} for "{searchQuery}"
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Level 1: Subject Tabs (Horizontal Scrollable, Scrollbar Hidden) */}
      {subjectsList.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
              Level 1: Subjects ({subjectsList.length} Subjects Active)
            </Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>
              Showing: <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{activeSubjectName}</Text>
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
            {subjectsList.map(subj => {
              const subjTopics = topics.filter(t => t.subjectName === subj);
              const subjCompleted = subjTopics.filter(t => t.completed || t.status === 'Completed').length;
              const isSel = activeSubjectName === subj;
              return (
                <TouchableOpacity 
                  key={subj}
                  onPress={() => setSelectedSubject(subj)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: isSel ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
                    borderWidth: 1.5,
                    borderColor: isSel ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Text style={{ color: isSel ? 'white' : (isDark ? '#e5e7eb' : '#374151'), fontWeight: isSel ? 'bold' : '600', fontSize: 13 }}>
                    {subj}
                  </Text>
                  <View style={{
                    backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : (isDark ? '#374151' : '#f3f4f6'),
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8
                  }}>
                    <Text style={{ color: isSel ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontSize: 11, fontWeight: 'bold' }}>
                      {subjCompleted}/{subjTopics.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Add Custom Topic Form */}
      {showAddForm && (
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f6', marginBottom: 24, gap: 12 }}>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>Add Custom Subtopic under {activeSubjectName}</Text>
          <TextInput 
            placeholder="Subtopic Title (e.g. Sources of Pre History)"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput 
            placeholder="Chapter Folder (e.g. 1. Pre Historic Cultures in India)"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
            value={newChapter}
            onChangeText={setNewChapter}
          />
          <TouchableOpacity onPress={handleAddTopic} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Checkbox Topic</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Level 2: Chapters & Level 3: Checkbox Subtopics */}
      <View style={{ gap: 16 }}>
        {Object.keys(chaptersMap).map((chapterName, chapIdx) => {
          const topicList = chaptersMap[chapterName];
          const isChapExpanded = normalizedQuery.length > 0 ? true : expandedChapters[chapterName] !== false;

          const chapCompleted = topicList.filter(t => t.completed || t.status === 'Completed').length;
          const chapPercent = topicList.length > 0 ? Math.round((chapCompleted / topicList.length) * 100) : 0;

          return (
            <View 
              key={chapterName} 
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff', 
                borderRadius: 16, 
                borderWidth: 1, 
                borderColor: isChapExpanded ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                overflow: 'hidden'
              }}
            >
              {/* Level 2: Chapter Folder Header */}
              <TouchableOpacity 
                onPress={() => toggleChapter(chapterName)}
                style={{ 
                  padding: 18, 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: isChapExpanded ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)') : undefined
                }}
              >
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="folder" size={18} color="#3b82f6" />
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Level 2: Chapter Folder
                    </Text>
                  </View>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 17, fontWeight: 'bold', marginTop: 4 }}>
                    {chapIdx + 1}. {chapterName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <View style={{ width: 70, height: 5, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: `${chapPercent}%`, height: '100%', backgroundColor: chapPercent === 100 ? '#10b981' : '#3b82f6' }} />
                    </View>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>
                      Total Topics: {topicList.length} ({chapCompleted} Completed)
                    </Text>
                  </View>
                </View>
                
                <Ionicons 
                  name={isChapExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={isChapExpanded ? '#3b82f6' : (isDark ? '#9ca3af' : '#6b7280')} 
                />
              </TouchableOpacity>

              {/* Level 3: Checkbox Subtopics List */}
              {isChapExpanded && (
                <View style={{ padding: 14, gap: 10, backgroundColor: isDark ? 'rgba(17, 24, 39, 0.4)' : '#f9fafb' }}>
                  {topicList.map(t => {
                    const isDone = t.completed || t.status === 'Completed';
                    return (
                      <View 
                        key={t._id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDone ? (isDark ? '#166534' : '#bbf7d0') : (isDark ? '#374151' : '#e5e7eb')
                        }}
                      >
                        {/* Checkbox & Permanent Topic Code + Subtopic Title */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
                          <TouchableOpacity 
                            onPress={(e) => handleToggleCheckbox(t._id, e)}
                            style={{ marginRight: 12 }}
                          >
                            <Ionicons 
                              name={isDone ? "checkbox" : "square-outline"} 
                              size={22} 
                              color={isDone ? "#10b981" : (isDark ? "#6b7280" : "#9ca3af")} 
                            />
                          </TouchableOpacity>

                          {/* Topic ID Badge */}
                          {t.topicCode && (
                            <View style={{ backgroundColor: isDark ? '#374151' : '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 }}>
                              <Text style={{ color: isDark ? '#93c5fd' : '#3730a3', fontSize: 11, fontWeight: 'bold', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
                                {t.topicCode}
                              </Text>
                            </View>
                          )}

                          {/* Topic Title -> Navigate to Level 6 Knowledge Hub */}
                          <TouchableOpacity 
                            onPress={() => router.push(`/topic/${t._id}`)}
                            style={{ flex: 1 }}
                          >
                            <Text style={{ 
                              color: isDone ? (isDark ? '#9ca3af' : '#6b7280') : (isDark ? 'white' : '#111827'),
                              fontSize: 14,
                              fontWeight: '500',
                              textDecorationLine: isDone ? 'line-through' : 'none'
                            }}>
                              {t.title}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Open Knowledge Hub Chevron */}
                        <TouchableOpacity 
                          onPress={() => router.push(`/topic/${t._id}`)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                        >
                          <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>Knowledge Hub</Text>
                          <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}
