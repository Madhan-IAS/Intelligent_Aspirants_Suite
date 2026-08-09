import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';
import PomodoroTimer from '../../src/components/Dashboard/PomodoroTimer';

const TABS = [
  { key: 'knowledge', label: 'Knowledge', icon: 'book' },
  { key: 'pyqs', label: 'PYQs', icon: 'document-text' },
  { key: 'currentAffairs', label: 'Current Affairs', icon: 'newspaper' },
  { key: 'mcqs', label: 'MCQs', icon: 'help-circle' },
  { key: 'notes', label: 'Notes', icon: 'create' },
  { key: 'mindMaps', label: 'Mind Maps', icon: 'git-network' },
  { key: 'revision', label: 'Revision', icon: 'repeat' },
  { key: 'tests', label: 'Tests', icon: 'shield-checkmark' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart' }
];

export default function TopicKnowledgeHub() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [topic, setTopic] = useState<any>(null);
  const [relatedPYQs, setRelatedPYQs] = useState<any[]>([]);
  const [relatedCurrentAffairs, setRelatedCurrentAffairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [hubData, setHubData] = useState<Record<string, string>>({});

  // Flashcards state for Revision tab
  const [topicFlashcards, setTopicFlashcards] = useState<any[]>([]);
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  const [showAddFlashcard, setShowAddFlashcard] = useState(false);

  // MCQ state for MCQs tab
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  const [generatingNotes, setGeneratingNotes] = useState(false);

  useEffect(() => {
    fetchTopicData();
    fetchTopicFlashcards();
  }, [id]);

  const fetchTopicData = async () => {
    try {
      const res = await api.get(`/topics/${id}`);
      const data = res.data.topic ? res.data : { topic: res.data, relatedPYQs: [], relatedCurrentAffairs: [] };
      
      if (data && data.topic) {
        setTopic(data.topic);
        setRelatedPYQs(data.relatedPYQs || []);
        setRelatedCurrentAffairs(data.relatedCurrentAffairs || []);

        const loaded: Record<string, string> = {};
        TABS.forEach(t => {
          loaded[t.key] = data.topic.hubData?.[t.key] || data.topic.notes?.theory || '';
        });
        setHubData(loaded);
      } else {
        setTopic(null);
      }
    } catch (error) {
      console.error('Error fetching topic data:', error);
      setTopic(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicFlashcards = async () => {
    try {
      const res = await api.get(`/flashcards/topic/${id}`);
      setTopicFlashcards(res.data || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const handleSaveHub = async () => {
    setSaving(true);
    try {
      await api.put(`/topics/${id}`, { hubData });
      alert('Knowledge Hub saved successfully!');
    } catch (error) {
      console.error('Error saving hub:', error);
      alert('Failed to save Knowledge Hub');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!id) return;
    setGeneratingNotes(true);
    try {
      const res = await api.post('/ai/generate-topic-notes', { topicId: id });
      const newNotes = res.data.notes || {};
      setHubData(prev => ({
        ...prev,
        knowledge: newNotes.theory || prev.knowledge,
        notes: newNotes.definitions ? `${newNotes.definitions}\n\n${newNotes.examples || ''}` : prev.notes,
        mindMaps: newNotes.diagrams || prev.mindMaps
      }));
      alert('AI Knowledge Content Generated successfully!');
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      alert(error.response?.data?.message || 'Failed to generate AI notes.');
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleAddFlashcard = async () => {
    if (!flashcardFront.trim() || !flashcardBack.trim()) return;
    try {
      await api.post('/flashcards', {
        subject: topic?.paper || 'GS I',
        topic: topic?.title,
        topicId: topic?._id,
        front: flashcardFront,
        back: flashcardBack
      });
      setFlashcardFront('');
      setFlashcardBack('');
      setShowAddFlashcard(false);
      fetchTopicFlashcards();
    } catch (error) {
      console.error('Error saving flashcard:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  if (!topic || !topic._id) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>Topic Not Found</Text>
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginTop: 4, textAlign: 'center' }}>The requested topic could not be loaded.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Back to Syllabus</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}
    >
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 24 }}>
        
        {/* Header Breadcrumbs & Title */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                {topic.paper} • {topic.subjectName} • {topic.chapter}
              </Text>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold', marginTop: 2 }} numberOfLines={1}>
                {topic.title}
              </Text>
              {topic.completed && (topic.completedAt || topic.updatedAt) && (
                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                  ✅ Checked on {(() => {
                    const d = new Date(topic.completedAt || topic.updatedAt);
                    if (isNaN(d.getTime())) return '';
                    const isToday = d.toDateString() === new Date().toDateString();
                    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return isToday ? `Today at ${timeStr}` : `${d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} at ${timeStr}`;
                  })()}
                </Text>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity 
              onPress={handleGenerateAI} 
              disabled={generatingNotes} 
              style={{ backgroundColor: generatingNotes ? (isDark ? '#374151' : '#d1d5db') : '#8b5cf6', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              {generatingNotes ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="sparkles" size={16} color="white" />}
              {(Platform.OS === 'web' && window.innerWidth > 640) && (
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>{generatingNotes ? 'Generating AI...' : 'AI Topic Summarizer'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveHub} disabled={saving} style={{ backgroundColor: saving ? '#1e40af' : '#2563eb', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              {saving ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="save" size={16} color="white" />}
              {(Platform.OS === 'web' && window.innerWidth > 768) && (
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>{saving ? 'Saving...' : 'Save Hub'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 360° Topic Hub Integration Banner */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(59, 130, 246, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="compass" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 14 }}>360° Topic Intelligence Hub</Text>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Unified Syllabus, PYQs, and Daily Current Affairs linkage</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setActiveTab('pyqs')} style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <Ionicons name="document-text" size={14} color="#3b82f6" />
              <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: 'bold' }}>{relatedPYQs.length} PYQs</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('currentAffairs')} style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <Ionicons name="newspaper" size={14} color="#8b5cf6" />
              <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: 'bold' }}>{relatedCurrentAffairs.length} Current Affairs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Knowledge Hub Tabs Header */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              let badgeCount: number | null = null;
              if (tab.key === 'pyqs') badgeCount = relatedPYQs.length;
              if (tab.key === 'currentAffairs') badgeCount = relatedCurrentAffairs.length;

              return (
                <TouchableOpacity 
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    borderBottomWidth: 3,
                    borderBottomColor: isActive ? '#3b82f6' : 'transparent',
                    backgroundColor: isActive ? (isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}
                >
                  <Ionicons name={tab.icon as any} size={18} color={isActive ? '#3b82f6' : (isDark ? '#9ca3af' : '#6b7280')} />
                  <Text style={{ fontWeight: isActive ? 'bold' : '500', color: isActive ? '#3b82f6' : (isDark ? '#d1d5db' : '#374151'), fontSize: 14 }}>
                    {tab.label}
                  </Text>
                  {badgeCount !== null && badgeCount > 0 && (
                    <View style={{ backgroundColor: isActive ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ color: isActive ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontSize: 10, fontWeight: 'bold' }}>{badgeCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Body Workspace */}
        <View style={{ flex: 1, flexDirection: Platform.OS === 'web' && window.innerWidth > 768 ? 'row' : 'column', gap: 20 }}>
          
          {/* Main Content Area */}
          <View style={{ flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 20 }}>
            
            {/* Tab 1: Knowledge */}
            {activeTab === 'knowledge' && (
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Core Knowledge & Concepts</Text>
                <TextInput
                  style={{ flex: 1, color: isDark ? '#e5e7eb' : '#374151', fontSize: 16, textAlignVertical: 'top', lineHeight: 26, outlineStyle: 'none' } as any}
                  multiline
                  placeholder="Draft core theoretical concepts, definitions, and key syllabus points here..."
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                  value={hubData.knowledge || ''}
                  onChangeText={(text) => setHubData({ ...hubData, knowledge: text })}
                />
              </View>
            )}

            {/* Tab 2: PYQs */}
            {activeTab === 'pyqs' && (
              <ScrollView style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Linked Previous Year Questions (PYQs)</Text>
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{relatedPYQs.length} Questions Found</Text>
                </View>

                {relatedPYQs.length > 0 ? (
                  relatedPYQs.map((pyq, idx) => (
                    <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>UPSC Mains {pyq.year || 'Practice'} • {pyq.marks || 15} Marks</Text>
                        </View>
                        {pyq.directive && (
                          <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                            <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 11, fontWeight: 'bold' }}>{pyq.directive}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', lineHeight: 24, marginBottom: 12 }}>{pyq.question}</Text>

                      <TouchableOpacity 
                        onPress={() => router.push(`/answers?pyqId=${pyq._id}` as any)} 
                        style={{ backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                      >
                        <Ionicons name="create-outline" size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Write Answer in Workspace →</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 32, alignItems: 'center' }}>
                    <Ionicons name="document-text-outline" size={44} color={isDark ? '#4b5563' : '#9ca3af'} />
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', marginTop: 12, fontSize: 16 }}>No Direct PYQs Tagged Yet</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4, textAlign: 'center', fontSize: 13 }}>
                      You can add PYQs from the PYQ Bank module and link them to "{topic.title}".
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Tab 3: Current Affairs */}
            {activeTab === 'currentAffairs' && (
              <ScrollView style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Linked Current Affairs Articles</Text>
                  <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>{relatedCurrentAffairs.length} News Articles</Text>
                </View>

                {relatedCurrentAffairs.length > 0 ? (
                  relatedCurrentAffairs.map((ca, idx) => (
                    <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 12 }}>{ca.source || 'Daily News'}</Text>
                        </View>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{new Date(ca.date).toLocaleDateString()}</Text>
                      </View>

                      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', lineHeight: 24, marginBottom: 8 }}>{ca.title}</Text>

                      {ca.content ? (
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, lineHeight: 20, marginBottom: 12 }} numberOfLines={3}>
                          {ca.content}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {ca.tags?.map((t: string) => (
                            <View key={t} style={{ backgroundColor: isDark ? '#1f2937' : '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 11 }}>{t}</Text>
                            </View>
                          ))}
                        </View>

                        {ca.link ? (
                          <TouchableOpacity onPress={() => Linking.openURL(ca.link)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>Read Article</Text>
                            <Ionicons name="open-outline" size={14} color="#3b82f6" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 32, alignItems: 'center' }}>
                    <Ionicons name="newspaper-outline" size={44} color={isDark ? '#4b5563' : '#9ca3af'} />
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', marginTop: 12, fontSize: 16 }}>No Related News Articles Yet</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4, textAlign: 'center', fontSize: 13 }}>
                      Articles matching "{topic.title}" or paper "{topic.paper}" will automatically appear here as daily news is scraped.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Tab 4: MCQs */}
            {activeTab === 'mcqs' && (
              <ScrollView style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Topic MCQs Practice</Text>
                <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold' }}>Q1. Sample UPSC Prelims MCQ</Text>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginTop: 6, marginBottom: 12 }}>
                    Which of the following statements regarding {topic.title} is/are correct?
                  </Text>
                  {['1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2'].map((opt, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      onPress={() => { setMcqSelected(idx); setMcqSubmitted(true); }}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: mcqSelected === idx ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
                        borderWidth: 1,
                        borderColor: isDark ? '#374151' : '#e5e7eb'
                      }}
                    >
                      <Text style={{ color: mcqSelected === idx ? 'white' : (isDark ? '#e5e7eb' : '#374151'), fontWeight: '500' }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                  {mcqSubmitted && (
                    <View style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(34, 197, 94, 0.15)', borderRadius: 8, borderWidth: 1, borderColor: '#22c55e' }}>
                      <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>Correct Answer: Both 1 and 2</Text>
                      <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, marginTop: 4 }}>Detailed Explanation: {topic.title} has documented historical evidence supporting both analytical statements.</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Tab 5: Notes */}
            {activeTab === 'notes' && (
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Personal & AI Notes</Text>
                <TextInput
                  style={{ flex: 1, color: isDark ? '#e5e7eb' : '#374151', fontSize: 16, textAlignVertical: 'top', lineHeight: 26, outlineStyle: 'none' } as any}
                  multiline
                  placeholder="Type your notes, mnemonic devices, key bullet points, and AI summaries here..."
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                  value={hubData.notes || ''}
                  onChangeText={(text) => setHubData({ ...hubData, notes: text })}
                />
              </View>
            )}

            {/* Tab 6: Mind Maps */}
            {activeTab === 'mindMaps' && (
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Mind Maps & Flowcharts</Text>
                <TextInput
                  style={{ flex: 1, color: isDark ? '#e5e7eb' : '#374151', fontSize: 15, fontFamily: 'monospace', textAlignVertical: 'top', lineHeight: 24, outlineStyle: 'none' } as any}
                  multiline
                  placeholder="Outline key flowchart steps or Mermaid markdown for this topic..."
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                  value={hubData.mindMaps || ''}
                  onChangeText={(text) => setHubData({ ...hubData, mindMaps: text })}
                />
              </View>
            )}

            {/* Tab 7: Revision */}
            {activeTab === 'revision' && (
              <ScrollView style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Spaced Repetition Flashcards</Text>
                
                {/* Add Flashcard Form */}
                <TouchableOpacity onPress={() => setShowAddFlashcard(!showAddFlashcard)} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{showAddFlashcard ? 'Close Form' : '+ Add New Flashcard'}</Text>
                </TouchableOpacity>

                {showAddFlashcard && (
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, marginBottom: 16, gap: 10 }}>
                    <TextInput placeholder="Front (Question)" placeholderTextColor="#9ca3af" value={flashcardFront} onChangeText={setFlashcardFront} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }} />
                    <TextInput placeholder="Back (Answer)" placeholderTextColor="#9ca3af" value={flashcardBack} onChangeText={setFlashcardBack} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? 'white' : '#111827', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }} />
                    <TouchableOpacity onPress={handleAddFlashcard} style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Flashcard</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {topicFlashcards.map((fc, idx) => (
                  <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Q: {fc.front}</Text>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', marginTop: 4 }}>A: {fc.back}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Tab 8: Tests */}
            {activeTab === 'tests' && (
              <ScrollView style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Topic Mock Tests & Score Log</Text>
                <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold' }}>TEST EVALUATION</Text>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>Mains Speed Test #1</Text>
                  <Text style={{ color: '#10b981', fontWeight: 'bold', marginTop: 6 }}>Score: 12.5 / 15 Marks (High Yield Answer)</Text>
                </View>
              </ScrollView>
            )}

            {/* Tab 9: Analytics */}
            {activeTab === 'analytics' && (
              <ScrollView style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Topic Mastery Analytics</Text>
                <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold' }}>Mastery Index</Text>
                    <Text style={{ color: '#10b981', fontWeight: 'bold' }}>85 / 100</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold' }}>Status</Text>
                    <Text style={{ color: topic.completed ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{topic.completed ? 'Completed' : 'Pending'}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

          </View>

          {/* Right Column: Deep Work Timer */}
          <View style={{ width: Platform.OS === 'web' && window.innerWidth > 768 ? 300 : '100%' }}>
            <PomodoroTimer 
              defaultSubject={topic.paper} 
              activeTopicId={topic._id}
              activeTopicName={topic.title}
              onTopicComplete={async () => {
                try {
                  await api.patch(`/topics/${topic._id}/toggle`);
                  fetchTopicData();
                } catch (err) {
                  console.error('Failed to toggle topic completed status:', err);
                }
              }}
            />
          </View>

        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
