import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function QuizHistory() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/quiz/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching quiz history:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToQuiz = (id: string) => {
        router.push(`/quiz?id=${id}`);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            {/* Header */}
            <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
                </TouchableOpacity>
                <View>
                    <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Archive</Text>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Quiz History</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {history.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                        <Ionicons name="folder-open-outline" size={64} color={isDark ? '#4b5563' : '#d1d5db'} />
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 16, marginTop: 16 }}>No completed quizzes found.</Text>
                    </View>
                ) : (
                    <View style={{ gap: 16 }}>
                        {history.map((quiz, idx) => (
                            <TouchableOpacity
                                key={quiz._id}
                                onPress={() => navigateToQuiz(quiz._id)}
                                style={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    borderRadius: 16,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: isDark ? '#374151' : '#e5e7eb',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Ionicons name="calendar" size={24} color="#8b5cf6" />
                                    </View>
                                    <View>
                                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>{quiz.date}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <View style={{ backgroundColor: quiz.type === 'Subject' ? '#10b98120' : '#8b5cf620', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                                <Text style={{ color: quiz.type === 'Subject' ? '#10b981' : '#8b5cf6', fontSize: 11, fontWeight: 'bold' }}>{quiz.type === 'Subject' ? 'Topic Quiz' : 'Mission Quiz'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold' }}>{quiz.score}</Text>
                                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>out of 25</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
