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
  
  const [articles, setArticles] = useState<any[]>([]);
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

  // Tabs & Search
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleToggleSave = async (id: string) => {
    try {
      const res = await api.patch(`/current-affairs/${id}/toggle-save`);
      setArticles(prev => prev.map(a => a._id === id ? { ...a, isSaved: res.data.isSaved } : a));
    } catch (error) {
      console.error('Error toggling saved state:', error);
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

  const savedCount = articles.filter(a => a.isSaved).length;

  const filteredArticles = articles.filter(article => {
    // Tab filter
    if (activeTab === 'saved' && !article.isSaved) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = article.title?.toLowerCase().includes(q);
      const sourceMatch = article.source?.toLowerCase().includes(q);
      const tagMatch = article.tags?.some((t: string) => t.toLowerCase().includes(q));
      return titleMatch || sourceMatch || tagMatch;
    }

    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingHorizontal: 24, paddingVertical: 24 }}>
      
      {/* Header & Controls */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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

        {/* Tab Switcher: All vs Saved */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: activeTab === 'all' ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
              borderWidth: 1,
              borderColor: activeTab === 'all' ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Ionicons name="newspaper-outline" size={16} color={activeTab === 'all' ? 'white' : (isDark ? '#9ca3af' : '#6b7280')} />
            <Text style={{ color: activeTab === 'all' ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: 'bold', fontSize: 14 }}>
              All Feed ({articles.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('saved')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: activeTab === 'saved' ? '#f59e0b' : (isDark ? '#1f2937' : '#ffffff'),
              borderWidth: 1,
              borderColor: activeTab === 'saved' ? '#f59e0b' : (isDark ? '#374151' : '#e5e7eb'),
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Ionicons name="bookmark" size={16} color={activeTab === 'saved' ? 'white' : '#f59e0b'} />
            <Text style={{ color: activeTab === 'saved' ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: 'bold', fontSize: 14 }}>
              Saved Articles ({savedCount})
            </Text>
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

        {/* Search Bar */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
          <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginRight: 12 }} />
          <TextInput 
            placeholder="Search articles, tags, or sources..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: isDark ? 'white' : '#111827', fontSize: 16, outlineStyle: 'none' } as any}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Article List */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
        ) : filteredArticles.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1f2937' : '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons 
                name={activeTab === 'saved' ? "bookmark-outline" : "newspaper-outline"} 
                size={32} 
                color={isDark ? '#6b7280' : '#9ca3af'} 
              />
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
              {activeTab === 'saved' ? 'No Saved Articles Yet' : 'No Articles Found'}
            </Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', fontSize: 14, lineHeight: 20 }}>
              {activeTab === 'saved'
                ? 'Tap the bookmark icon on any article in your feed to save it here for later revision!'
                : searchQuery
                ? `No articles match "${searchQuery}". Try a different term.`
                : 'No articles logged yet.'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16, paddingBottom: 40 }}>
            {filteredArticles.map((article: any) => (
              <TouchableOpacity 
                key={article._id}
                onPress={() => handleOpenArticle(article.link)}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  padding: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: article.isSaved ? '#f59e0b' : (isDark ? '#374151' : '#e5e7eb'),
                  position: 'relative'
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', flex: 1, paddingRight: 16, lineHeight: 24 }}>{article.title}</Text>
                  
                  {/* Action Controls: Bookmark & Delete */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{new Date(article.date).toLocaleDateString()}</Text>
                    
                    {/* Bookmark Toggle */}
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); handleToggleSave(article._id); }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        backgroundColor: article.isSaved ? 'rgba(245, 158, 11, 0.15)' : (isDark ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6'),
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Ionicons 
                        name={article.isSaved ? "bookmark" : "bookmark-outline"} 
                        size={16} 
                        color={article.isSaved ? "#f59e0b" : (isDark ? "#9ca3af" : "#6b7280")} 
                      />
                    </TouchableOpacity>

                    {/* Delete Toggle */}
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
                        style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="trash" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {/* Source & Tags */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                    {article.source ? (
                      <View style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.3)' }}>
                        <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{article.source}</Text>
                      </View>
                    ) : null}
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
