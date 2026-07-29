import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function RevisionDashboard() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const intervals = [1, 3, 7, 15, 30, 90];

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const res = await api.get('/revisions');
      setRevisions(res.data.filter((r: any) => r.status?.toLowerCase() === 'pending'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.post(`/revisions/${id}/complete`);
      setRevisions(revisions.filter((r: any) => r._id !== id));
    } catch (error) {
      console.error('Error completing revision:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={{ marginBottom: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>3-5-7 Engine</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Today's Revisions</Text>
          </View>
        </View>
        <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.5)' }}>
          <Text style={{ color: '#f97316', fontWeight: 'bold' }}>{revisions.length} Due</Text>
        </View>
      </View>

      {/* Intervals Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#4ade80" style={{ marginTop: 40 }} />
      ) : (
        intervals.map((interval) => {
          const dueItems = revisions.filter((r: any) => r.nextInterval === interval);
          
          if (dueItems.length === 0) return null;

        return (
          <View key={interval} style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{interval}</Text>
              </View>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>{interval} Day Revision</Text>
            </View>

            <View style={{ gap: 12 }}>
              {dueItems.map((item: any) => (
                <View key={item._id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <TouchableOpacity 
                    onPress={() => item.topicId?._id && router.push(`/topic/${item.topicId._id}`)}
                    style={{ flex: 1, paddingRight: 16 }}
                  >
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: '500', marginBottom: 4, textDecorationLine: 'underline' }}>{item.topicId?.title || 'Unknown Topic'}</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Target Date: {new Date(item.scheduledDate).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleComplete(item._id)}
                    style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.5)', flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="checkmark" size={16} color="#4ade80" />
                    <Text style={{ color: '#4ade80', fontWeight: '500', marginLeft: 8 }}>Done</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );
      })
      )}

      {!loading && revisions.length === 0 && (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
          <Ionicons name="happy-outline" size={64} color="#4ade80" style={{ marginBottom: 16 }} />
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>All Caught Up!</Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>You've completed all scheduled revisions for today.</Text>
        </View>
      )}

    </ScrollView>
  );
}
