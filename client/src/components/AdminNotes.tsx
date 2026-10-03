import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const PAPERS = ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT'];

export default function AdminNotes() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState<any>(null);

    // Form state
    const [paper, setPaper] = useState('GS I');
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes/all'); // Admin route fetches all including drafts
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching admin notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!subject || !title || !content) {
            alert('Subject, Title, and Content are required.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                paper,
                subject: subject.trim(),
                title: title.trim(),
                content: content.trim(),
                tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            };

            if (editingNote) {
                await api.put(`/notes/${editingNote._id}`, payload);
            } else {
                await api.post('/notes', payload);
            }

            // Reset form
            setEditingNote(null);
            setPaper('GS I');
            setSubject('');
            setTitle('');
            setContent('');
            setTags('');

            fetchNotes();
            alert('Note saved successfully!');
        } catch (error: any) {
            console.error('Error saving note:', error);
            alert('Failed to save note: ' + error.response?.data?.message || error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (note: any) => {
        setEditingNote(note);
        setPaper(note.paper);
        setSubject(note.subject);
        setTitle(note.title);
        setContent(note.content || '');
        setTags(note.tags?.join(', ') || '');
    };

    const handleDelete = async (id: string) => {
        if (Platform.OS === 'web') {
            if (!window.confirm('Delete this note?')) return;
        }
        try {
            await api.delete(`/notes/${id}`);
            fetchNotes();
        } catch (error: any) {
            alert('Failed to delete note');
        }
    };

    const bg = isDark ? '#111827' : '#f9fafb';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const border = isDark ? '#374151' : '#e5e7eb';
    const textPrimary = isDark ? '#f3f4f6' : '#111827';
    const textSecondary = isDark ? '#9ca3af' : '#6b7280';
    const inputBg = isDark ? '#111827' : '#f9fafb';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24 }}>

                {/* ═══ Left: Note Form ═══ */}
                <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: border }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                            {editingNote ? 'Edit IASuite Note' : 'Create New IASuite Note'}
                        </Text>
                        {editingNote && (
                            <TouchableOpacity onPress={() => { setEditingNote(null); setPaper('GS I'); setSubject(''); setTitle(''); setContent(''); setTags(''); }} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ef444420', borderRadius: 8 }}>
                                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Cancel Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={{ color: textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Paper</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {PAPERS.map(p => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setPaper(p)}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
                                    backgroundColor: paper === p ? '#3b82f6' : inputBg,
                                    borderWidth: 1, borderColor: paper === p ? '#3b82f6' : border,
                                }}
                            >
                                <Text style={{ color: paper === p ? 'white' : textPrimary, fontWeight: paper === p ? 'bold' : 'normal', fontSize: 13 }}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={{ color: textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Subject</Text>
                    <TextInput
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="e.g. Modern History, Indian Economy..."
                        placeholderTextColor={textSecondary}
                        style={{ backgroundColor: inputBg, color: textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: border, marginBottom: 16, fontSize: 14, outlineStyle: 'none' } as any}
                    />

                    <Text style={{ color: textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Causes of the Revolt of 1857"
                        placeholderTextColor={textSecondary}
                        style={{ backgroundColor: inputBg, color: textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: border, marginBottom: 16, fontSize: 14, outlineStyle: 'none' } as any}
                    />

                    <Text style={{ color: textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Content (Markdown / Text)</Text>
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Paste the note content here..."
                        placeholderTextColor={textSecondary}
                        multiline
                        style={{ backgroundColor: inputBg, color: textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: border, marginBottom: 16, fontSize: 14, minHeight: 200, textAlignVertical: 'top', outlineStyle: 'none' } as any}
                    />

                    <Text style={{ color: textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Tags (Comma-separated)</Text>
                    <TextInput
                        value={tags}
                        onChangeText={setTags}
                        placeholder="e.g. 1857, British India, Revolt"
                        placeholderTextColor={textSecondary}
                        style={{ backgroundColor: inputBg, color: textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: border, marginBottom: 24, fontSize: 14, outlineStyle: 'none' } as any}
                    />

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        style={{ backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{editingNote ? 'Update Note' : 'Publish Note'}</Text>}
                    </TouchableOpacity>
                </View>

                {/* ═══ Right: Existing Notes List ═══ */}
                <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: border, maxHeight: 800 }}>
                    <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Existing Notes ({notes.length})</Text>

                    {/* Paper Stats */}
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                        {PAPERS.map(p => {
                            const count = notes.filter(n => n.paper === p).length;
                            return (
                                <View key={p} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={{ color: textPrimary, fontSize: 11, fontWeight: 'bold' }}>{p}</Text>
                                    <View style={{ backgroundColor: '#3b82f6', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                                        <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{count}</Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notes.map(note => {
                                // Color code by paper
                                const paperColor = note.paper === 'GS I' ? '#ef4444' :
                                    note.paper === 'GS II' ? '#3b82f6' :
                                        note.paper === 'GS III' ? '#10b981' :
                                            note.paper === 'GS IV' ? '#8b5cf6' : '#f59e0b';

                                return (
                                    <View key={note._id} style={{
                                        backgroundColor: inputBg, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: border, marginBottom: 12,
                                        borderLeftWidth: 4, borderLeftColor: paperColor
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                    <View style={{ backgroundColor: `${paperColor}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                        <Text style={{ color: paperColor, fontSize: 10, fontWeight: 'bold' }}>{note.paper}</Text>
                                                    </View>
                                                    <Text style={{ color: textSecondary, fontSize: 11 }}>• {note.subject}</Text>
                                                </View>
                                                <Text style={{ color: textPrimary, fontWeight: 'bold', fontSize: 15 }}>{note.title}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity onPress={() => handleEdit(note)} style={{ padding: 6, backgroundColor: '#3b82f620', borderRadius: 8 }}>
                                                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(note._id)} style={{ padding: 6, backgroundColor: '#ef444420', borderRadius: 8 }}>
                                                    <Ionicons name="trash" size={16} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {note.tags?.length > 0 && (
                                            <Text style={{ color: textSecondary, fontSize: 11 }}>Tags: {note.tags.join(', ')}</Text>
                                        )}
                                    </View>
                                )
                            })}
                            {notes.length === 0 && (
                                <Text style={{ color: textSecondary, textAlign: 'center', marginTop: 20 }}>No notes found.</Text>
                            )}
                        </ScrollView>
                    )}
                </View>

            </View>
        </View>
    );
}
