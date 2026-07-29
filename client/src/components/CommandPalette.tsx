import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

type CommandPaletteProps = {
  visible: boolean;
  onClose: () => void;
};

export default function CommandPalette({ visible, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleNavigate = (path: string) => {
    onClose();
    setQuery('');
    setResults(null);
    router.push(path as any);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 80, paddingHorizontal: 16 }}>
        
        <View style={{ width: '100%', maxWidth: 672, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, overflow: 'hidden' }}>
          
          {/* Search Input */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }}>
            <Ionicons name="search" size={24} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search topics, PYQs, current affairs..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{ flex: 1, color: isDark ? 'white' : '#111827', fontSize: 20, outlineStyle: 'none' } as any}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 16, backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold' }}>ESC</Text>
            </TouchableOpacity>
          </View>

          {/* Results Area */}
          <ScrollView style={{ maxHeight: '60%' }}>
            {loading && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#60a5fa" />
              </View>
            )}

            {!loading && results && (
              <View style={{ padding: 8 }}>
                
                {/* Topics Results */}
                {results.topics?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#6b7280' : '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 12, marginBottom: 8 }}>Topics</Text>
                    {results.topics.map((item: any) => (
                      <TouchableOpacity 
                        key={item._id} 
                        onPress={() => handleNavigate(`/topic/${item._id}`)}
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: 'transparent' }}
                      >
                        <View style={{ width: 32, height: 32, backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#eff6ff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name="git-merge" size={16} color="#60a5fa" />
                        </View>
                        <Text style={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: '500', flex: 1 }}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#4b5563' : '#9ca3af'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* PYQs Results */}
                {results.pyqs?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#6b7280' : '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 12, marginBottom: 8 }}>Previous Questions</Text>
                    {results.pyqs.map((item: any) => (
                      <TouchableOpacity 
                        key={item._id} 
                        onPress={() => handleNavigate(`/answers?pyqId=${item._id}`)}
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: 'transparent' }}
                      >
                        <View style={{ width: 32, height: 32, backgroundColor: isDark ? 'rgba(88, 28, 135, 0.3)' : '#faf5ff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name="help-circle" size={16} color="#c084fc" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: '500' }} numberOfLines={1}>{item.question}</Text>
                          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{item.year} • {item.directive}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#4b5563' : '#9ca3af'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Current Affairs Results */}
                {results.currentAffairs?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#6b7280' : '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 12, marginBottom: 8 }}>Current Affairs</Text>
                    {results.currentAffairs.map((item: any) => (
                      <TouchableOpacity 
                        key={item._id} 
                        onPress={() => handleNavigate('/current-affairs')}
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: 'transparent' }}
                      >
                        <View style={{ width: 32, height: 32, backgroundColor: isDark ? 'rgba(20, 83, 45, 0.3)' : '#ecfdf5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name="newspaper" size={16} color="#34d399" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: '500' }} numberOfLines={1}>{item.title}</Text>
                          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{item.source}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#4b5563' : '#9ca3af'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Empty State */}
                {results.topics?.length === 0 && results.pyqs?.length === 0 && results.currentAffairs?.length === 0 && (
                  <View style={{ padding: 32, alignItems: 'center' }}>
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center' }}>No results found for "{query}"</Text>
                  </View>
                )}
                
              </View>
            )}
            
            {!query && !loading && (
              <View style={{ padding: 32, alignItems: 'center', borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                <Ionicons name="search" size={48} color={isDark ? '#374151' : '#d1d5db'} style={{ marginBottom: 16 }} />
                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center' }}>Search across Topics, Questions, and News</Text>
              </View>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}
