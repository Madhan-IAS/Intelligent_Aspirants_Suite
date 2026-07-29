import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function PYQDatabase() {
  const router = useRouter();
  const { search: searchParam } = useLocalSearchParams();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [search, setSearch] = useState((searchParam as string) || '');
  const [activeFilter, setActiveFilter] = useState('All');
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newDirective, setNewDirective] = useState('');
  const [newMarks, setNewMarks] = useState<number>(10);
  const [newWordLimit, setNewWordLimit] = useState<number>(150);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    fetchPYQs();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (showAddForm) {
      const matchingSubject = subjects.find(s => s.name === activeFilter);
      if (matchingSubject) {
        setSelectedSubjectId(matchingSubject._id);
      } else {
        setSelectedSubjectId('');
      }
      setSelectedTopicId('');
      setTopicSearch('');
    }
  }, [showAddForm, activeFilter, subjects]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopicsForSubject(selectedSubjectId);
    } else {
      setTopics([]);
    }
    setSelectedTopicId('');
    setTopicSearch('');
  }, [selectedSubjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTopicsForSubject = async (subjId: string) => {
    try {
      const res = await api.get(`/topics/subject/${subjId}`);
      setTopics(res.data);
    } catch (error) {
      console.error('Error fetching topics for subject:', error);
    }
  };

  const fetchPYQs = async () => {
    try {
      const res = await api.get('/pyqs');
      setPyqs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPYQ = async () => {
    if (!newQuestion.trim()) return;
    try {
      await api.post('/pyqs', {
        question: newQuestion,
        year: parseInt(newYear) || new Date().getFullYear(),
        directive: newDirective,
        difficulty: 'Medium',
        subjectId: selectedSubjectId || undefined,
        topicId: selectedTopicId || undefined,
        marks: newMarks,
        wordLimit: newWordLimit
      });
      setNewQuestion('');
      setNewYear('');
      setNewDirective('');
      setNewMarks(10);
      setNewWordLimit(150);
      setSelectedSubjectId('');
      setSelectedTopicId('');
      setTopicSearch('');
      setShowAddForm(false);
      fetchPYQs(); // Refresh list
    } catch (error) {
      console.error('Error saving PYQ:', error);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState('');

  const handleDeletePYQ = async (id: string) => {
    try {
      await api.delete(`/pyqs/${id}`);
      setDeleteConfirmId('');
      fetchPYQs(); // Refresh list
    } catch (error) {
      console.error('Error deleting PYQ:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingHorizontal: 24, paddingVertical: 24 }}>
      
      {/* Header */}
      <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View style={{ flexShrink: 1 }}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Database</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Previous Year Questions</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name={showAddForm ? "close" : "add"} size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>
            {showAddForm ? 'Cancel' : 'Add PYQ'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add PYQ Form */}
      {showAddForm && (
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f6', marginBottom: 24, gap: 16 }}>
          <TextInput 
            placeholder="Full Question Text..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ color: isDark ? 'white' : '#111827', fontSize: 16, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', minHeight: 100, textAlignVertical: 'top', outlineStyle: 'none' } as any}
            multiline
            value={newQuestion}
            onChangeText={setNewQuestion}
          />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TextInput 
              placeholder="Year (e.g. 2023)"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{ flex: 1, color: isDark ? 'white' : '#111827', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              value={newYear}
              onChangeText={setNewYear}
              keyboardType="numeric"
            />
            <TextInput 
              placeholder="Directive (e.g. Evaluate)"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{ flex: 1, color: isDark ? 'white' : '#111827', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              value={newDirective}
              onChangeText={setNewDirective}
            />
          </View>

          {/* Marks & Word Limit Selection */}
          <View>
            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Marks & Word Limit</Text>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: '10 Marks (150 words)', marks: 10, limit: 150 },
                { label: '15 Marks (250 words)', marks: 15, limit: 250 },
                { label: '20 Marks (250 words)', marks: 20, limit: 250 }
              ].map(opt => {
                const isSelected = newMarks === opt.marks && newWordLimit === opt.limit;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => {
                      setNewMarks(opt.marks);
                      setNewWordLimit(opt.limit);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      alignItems: 'center',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : (isDark ? '#111827' : '#f9fafb'),
                      borderColor: isSelected ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                    }}
                  >
                    <Text style={{ color: isSelected ? '#3b82f6' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 12 }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Subject Selection */}
          <View>
            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Subject Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {subjects.map((sub: any) => {
                const isSelected = selectedSubjectId === sub._id;
                return (
                  <TouchableOpacity
                    key={sub._id}
                    onPress={() => setSelectedSubjectId(sub._id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      backgroundColor: isSelected ? '#3b82f6' : (isDark ? '#1f2937' : '#f3f4f6'),
                      borderColor: isSelected ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                    }}
                  >
                    <Text style={{ color: isSelected ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: '500', fontSize: 12 }}>{sub.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Topic Selection */}
          {selectedSubjectId && topics.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', fontSize: 14 }}>Link to Syllabus Topic (Optional)</Text>
              <TextInput
                placeholder="Search topics..."
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                style={{ color: isDark ? 'white' : '#111827', fontSize: 14, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                value={topicSearch}
                onChangeText={setTopicSearch}
              />
              <ScrollView style={{ maxHeight: 150, backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 8 }}>
                {topics
                  .filter((t: any) => !topicSearch || t.title.toLowerCase().includes(topicSearch.toLowerCase()))
                  .map((t: any) => {
                    const isSelected = selectedTopicId === t._id;
                    return (
                      <TouchableOpacity
                        key={t._id}
                        onPress={() => setSelectedTopicId(isSelected ? '' : t._id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          marginBottom: 4,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ color: isSelected ? '#3b82f6' : (isDark ? '#d1d5db' : '#374151'), fontSize: 13, fontWeight: isSelected ? 'bold' : 'normal', flex: 1 }}>
                          {t.title}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          ) : selectedSubjectId ? (
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontStyle: 'italic', fontSize: 12 }}>No topics found for this subject.</Text>
          ) : null}
          <TouchableOpacity onPress={handleAddPYQ} style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Save PYQ</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Filters & Search */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 }}>
          <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginRight: 12 }} />
          <TextInput 
            placeholder="Search questions, directives, or themes..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ flex: 1, color: isDark ? 'white' : '#111827', fontSize: 16, outlineStyle: 'none' } as any}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['All', 'GS I', 'GS II', 'GS III', 'GS IV', 'Sociology'].map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity 
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={{ 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  borderRadius: 20, 
                  borderWidth: 1, 
                  backgroundColor: isActive ? '#2563eb' : (isDark ? '#1f2937' : '#f3f4f6'), 
                  borderColor: isActive ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb') 
                }}
              >
                <Text style={{ color: isActive ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: '500' }}>{filter}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* PYQ List */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {(() => {
          const filteredPyqs = pyqs.filter((pyq: any) => {
            const matchesSearch = !search || pyq.question?.toLowerCase().includes(search.toLowerCase()) || pyq.directive?.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = activeFilter === 'All' || pyq.subjectId?.name === activeFilter;
            return matchesSearch && matchesFilter;
          });
          return loading ? (
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
        ) : filteredPyqs.length === 0 ? (
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: 40 }}>No questions found.</Text>
        ) : (
          <View style={{ gap: 16, paddingBottom: 40 }}>
            {filteredPyqs.map((pyq: any) => (
              <View key={pyq._id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                    <View style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                      <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: 'bold' }}>{pyq.year}</Text>
                    </View>
                    {pyq.subjectId && (
                      <View style={{ backgroundColor: isDark ? 'rgba(30, 58, 138, 0.4)' : '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: isDark ? '#1e40af' : '#bfdbfe' }}>
                        <Text style={{ color: isDark ? '#60a5fa' : '#3b82f6', fontSize: 12, fontWeight: '500' }}>{pyq.subjectId.name || 'Subject'}</Text>
                      </View>
                    )}
                    <View style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: isDark ? '#d97706' : '#fde68a' }}>
                      <Text style={{ color: isDark ? '#fbbf24' : '#d97706', fontSize: 12, fontWeight: 'bold' }}>{pyq.marks || 10} Marks</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{pyq.difficulty || 'Medium'}</Text>
                  </View>
                </View>
              
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, lineHeight: 24, marginBottom: 16 }}>{pyq.question}</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1, gap: 4 }}>
                  <Ionicons name="pricetag" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                  {pyq.topicId ? (
                    <TouchableOpacity onPress={() => router.push(`/topic/${pyq.topicId._id}`)}>
                      <Text style={{ color: '#3b82f6', fontSize: 12, marginLeft: 4, marginRight: 12, textDecorationLine: 'underline', fontWeight: 'bold' }}>{pyq.topicId.title}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginLeft: 4, marginRight: 12 }}>Unlinked</Text>
                  )}
                  <Ionicons name="key" size={14} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginLeft: 6 }} />
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginLeft: 4 }}>{pyq.directive || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => router.push(`/answers?pyqId=${pyq._id}`)} 
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}
                  >
                    <Ionicons name="create" size={14} color={isDark ? 'white' : '#111827'} />
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: '500', marginLeft: 4 }}>Write Answer</Text>
                  </TouchableOpacity>
                  {deleteConfirmId === pyq._id ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => setDeleteConfirmId('')}
                        style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}
                      >
                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: 'bold' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePYQ(pyq._id)}
                        style={{ backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                      >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setDeleteConfirmId(pyq._id)} 
                      style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            ))}
          </View>
        );
        })()}
      </ScrollView>

    </View>
  );
}
