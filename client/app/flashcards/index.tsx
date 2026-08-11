import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

export default function Flashcards() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/flashcards/due');
      setCards(res.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (currentIndex >= cards.length) return;

    const card = cards[currentIndex];

    try {
      await api.post(`/flashcards/${card._id}/review`, { quality });
    } catch (err) {
      console.error('Error saving review', err);
    }

    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Spaced Repetition</Text>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Flashcards</Text>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {currentIndex >= cards.length ? (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>All Caught Up!</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 8, textAlign: 'center' }}>You have reviewed all your due flashcards for today.</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={{ marginTop: 24, backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: '100%', maxWidth: 400 }}>
            {/* Progress */}
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
              Card {currentIndex + 1} of {cards.length}
            </Text>

            {/* Card UI */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setIsFlipped(!isFlipped)}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                height: 400,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8
              }}
            >
              <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', position: 'absolute', top: 24, left: 24, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }}>
                {cards[currentIndex].subject}
              </Text>

              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 }}>
                {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
              </Text>

              <Text style={{ color: isDark ? '#4b5563' : '#d1d5db', position: 'absolute', bottom: 24, fontSize: 14 }}>
                Tap to flip
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            {isFlipped && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 10 }}>
                <TouchableOpacity onPress={() => handleReview(0)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#ef4444', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Again</Text>
                  <Text style={{ color: '#ef4444', fontSize: 10 }}>&lt; 1m</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReview(2)} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: '#f59e0b', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>Hard</Text>
                  <Text style={{ color: '#f59e0b', fontSize: 10 }}>1d</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReview(4)} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: '#10b981', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#10b981', fontWeight: 'bold' }}>Good</Text>
                  <Text style={{ color: '#10b981', fontSize: 10 }}>3d</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReview(5)} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: '#3b82f6', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Easy</Text>
                  <Text style={{ color: '#3b82f6', fontSize: 10 }}>7d</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
