import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AdminCMS() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [subTab, setSubTab] = useState<'mindmaps' | 'pyqs' | 'answers'>('mindmaps');

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        try {
            let endpoint = '/mind-maps';
            if (subTab === 'pyqs') endpoint = '/pyqs';
            if (subTab === 'answers') endpoint = '/admin/gallery-curation';

            const res = await api.get(endpoint);
            setItems(res.data);
        } catch (e) {
            console.error('Fetch error:', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [subTab]);

    const handleCreate = async () => {
        if (!title || !pdfUrl) return;
        try {
            const endpoint = subTab === 'mindmaps' ? '/mind-maps' : '/pyqs';
            const payload = subTab === 'mindmaps'
                ? { title, subject, gsPaper: 'GS1', pdfUrl, isPremium: false }
                : { title, year: parseInt(year) || new Date().getFullYear(), pdfUrl, examType: 'prelims', tags: [] };

            await api.post(endpoint, payload);
            setTitle('');
            setSubject('');
            setYear('');
            setPdfUrl('');
            fetchItems();
        } catch (e: any) {
            if (Platform.OS === 'web') {
                window.alert('Upload Failed: ' + e.message);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (Platform.OS === 'web' && !window.confirm('Delete this item completely?')) return;
        try {
            const endpoint = subTab === 'mindmaps' ? `/mind-maps/${id}` : `/pyqs/${id}`;
            await api.delete(endpoint);
            fetchItems();
        } catch (e: any) {
            if (Platform.OS === 'web') {
                window.alert('Delete Failed: ' + e.message);
            }
        }
    };

    const handleFeatureAnswer = async (id: string) => {
        try {
            await api.post(`/admin/feature-answer/${id}`);
            fetchItems(); // refresh list
        } catch (e: any) {
            if (Platform.OS === 'web') window.alert('Feature Failed: ' + e.message);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setSubTab('mindmaps')} style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: subTab === 'mindmaps' ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6') }}>
                    <Text style={{ fontWeight: 'bold', color: subTab === 'mindmaps' ? 'white' : (isDark ? 'white' : '#111827') }}>Mind Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('pyqs')} style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: subTab === 'pyqs' ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6') }}>
                    <Text style={{ fontWeight: 'bold', color: subTab === 'pyqs' ? 'white' : (isDark ? 'white' : '#111827') }}>PYQs</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('answers')} style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: subTab === 'answers' ? '#3b82f6' : (isDark ? '#374151' : '#f3f4f6') }}>
                    <Text style={{ fontWeight: 'bold', color: subTab === 'answers' ? 'white' : (isDark ? 'white' : '#111827') }}>Curations</Text>
                </TouchableOpacity>
            </View>

            {/* Create Form */}
            {subTab !== 'answers' && (
                <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', marginBottom: 12 }}>Upload New {subTab === 'mindmaps' ? 'Mind Map' : 'PYQ'}</Text>
                    <View style={{ gap: 12 }}>
                        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : 'black', padding: 10, borderRadius: 8 }} placeholderTextColor={isDark ? '#9ca3af' : 'gray'} />
                        {subTab === 'mindmaps' ? (
                            <TextInput placeholder="Subject (e.g. History)" value={subject} onChangeText={setSubject} style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : 'black', padding: 10, borderRadius: 8 }} placeholderTextColor={isDark ? '#9ca3af' : 'gray'} />
                        ) : (
                            <TextInput placeholder="Year (e.g. 2024)" value={year} onChangeText={setYear} style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : 'black', padding: 10, borderRadius: 8 }} placeholderTextColor={isDark ? '#9ca3af' : 'gray'} />
                        )}
                        <TextInput placeholder="PDF DropBox / Drive URL" value={pdfUrl} onChangeText={setPdfUrl} style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : 'black', padding: 10, borderRadius: 8 }} placeholderTextColor={isDark ? '#9ca3af' : 'gray'} />

                        <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#22c55e', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Publish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>
                    {subTab === 'mindmaps' ? 'Active Mind Maps' : subTab === 'pyqs' ? 'Active PYQs' : 'Curation Queue'}
                </Text>
                {!loading && (
                    <View style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: 'bold' }}>{items.length} items</Text>
                    </View>
                )}
            </View>

            {/* List */}
            {loading ? <ActivityIndicator color="#3b82f6" /> : (
                <View style={{ gap: 12 }}>
                    {items.map(item => (
                        <View key={item._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }} numberOfLines={2}>
                                    {subTab === 'answers' ? (item.pyqId?.title || 'Unknown Question') : item.title}
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                                    <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {subTab === 'mindmaps' ? item.subject : subTab === 'pyqs' ? `Year: ${item.year}` : `AI Score: ${item.aiEvaluation?.score || 0}/20`}
                                        </Text>
                                    </View>
                                    {subTab === 'answers' && (
                                        <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}>By: {item.userId?.name || 'Aspirant'}</Text>
                                        </View>
                                    )}
                                </View>
                                {subTab === 'answers' && (
                                    <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginTop: 8 }} numberOfLines={3}>
                                        {item.content}
                                    </Text>
                                )}
                            </View>

                            <View style={{ flexDirection: 'column', gap: 8 }}>
                                {subTab === 'answers' ? (
                                    <TouchableOpacity onPress={() => handleFeatureAnswer(item._id)} style={{ backgroundColor: '#fbbf24', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="star" size={16} color="white" />
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Feature</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8, alignSelf: 'flex-end' }}>
                                        <Ionicons name="trash" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
