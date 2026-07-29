import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function CurrentAffairs() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newTags, setNewTags] = useState('');

  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState('');

  useEffect(() => {
    fetchArticles();
    fetchSubjects();
  }, []);

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
      console.error('Error fetching topics:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await api.get('/current-affairs');
      setArticles(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/current-affairs', {
        title: newTitle,
        source: newSource,
        tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
        relatedTopicIds: selectedTopicId ? [selectedTopicId] : []
      });
      setNewTitle('');
      setNewSource('');
      setNewTags('');
      setSelectedSubjectId('');
      setSelectedTopicId('');
      setTopicSearch('');
      setShowAddForm(false);
      fetchArticles(); // Refresh list
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await api.delete(`/current-affairs/${id}`);
      setDeleteConfirmId('');
      fetchArticles(); // Refresh list
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleOpenArticle = (link: string) => {
    if (link) {
      Linking.openURL(link).catch(err => {
        console.error("Couldn't load page", err);
        Alert.alert("Error", "Could not open the article link.");
      });
    } else {
      Alert.alert("Notice", "No link available for this article.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingHorizontal: 24, paddingVertical: 24 }}>
      
      {/* Header & Search */}
      <View style={{ marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Database</Text>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Current Affairs</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => setShowAddForm(!showAddForm)}
            style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={showAddForm ? "close" : "add"} size={20} color="white" />
            {(Platform.OS === 'web' && window.innerWidth > 768) && (
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                {showAddForm ? 'Cancel' : 'Log Article'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Add Article Form */}
        {showAddForm && (
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f6', marginBottom: 24, gap: 16 }}>
            <TextInput 
              placeholder="Article Title..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{ color: isDark ? 'white' : '#111827', fontSize: 18, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TextInput 
                placeholder="Source (e.g. The Hindu)"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                style={{ flex: 1, color: isDark ? 'white' : '#111827', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                value={newSource}
                onChangeText={setNewSource}
              />
              <TextInput 
                placeholder="Tags (comma separated)"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                style={{ flex: 1, color: isDark ? 'white' : '#111827', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                value={newTags}
                onChangeText={setNewTags}
              />
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
                        backgroundColor: isSelected ? '#3b82f6' : (isDark ? '#111827' : '#f3f4f6'),
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
            <TouchableOpacity onPress={handleAddArticle} style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Article</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
          <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginRight: 12 }} />
          <TextInput 
            placeholder="Search articles, tags, or linked topics..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ flex: 1, color: isDark ? 'white' : '#111827', fontSize: 16, outlineStyle: 'none' } as any}
          />
        </View>
      </View>

      {/* Article List */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
        ) : articles.length === 0 ? (
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: 40 }}>No articles logged yet.</Text>
        ) : (
          <View style={{ gap: 16, paddingBottom: 40 }}>
            {articles.map((article: any) => (
              <TouchableOpacity 
                key={article._id}
                onPress={() => handleOpenArticle(article.link)}
                style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', flex: 1, paddingRight: 16, lineHeight: 24 }}>{article.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{new Date(article.date).toLocaleDateString()}</Text>
                    {deleteConfirmId === article._id ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); setDeleteConfirmId(''); }}
                          style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 10, fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); handleDeleteArticle(article._id); }}
                          style={{ backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); setDeleteConfirmId(article._id); }}
                        style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="trash" size={12} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                    {article.tags.map((tag: string) => (
                      <View key={tag} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  {article.relatedTopicIds && article.relatedTopicIds.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                      <Ionicons name="link" size={14} color="#60a5fa" />
                      <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '500', marginLeft: 4 }}>Linked</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}
