import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

const PAPERS = ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT'];
const PAPER_COLORS: Record<string, string> = { 'GS I': '#3b82f6', 'GS II': '#10b981', 'GS III': '#f59e0b', 'GS IV': '#ec4899', 'CSAT': '#06b6d4' };

interface Note {
    _id: string;
    paper: string;
    subject: string;
    title: string;
    content?: string;
    tags: string[];
    createdAt: string;
}

export default function AINotesPage() {
    const router = useRouter();
    const { mode } = useTheme();
    const { user } = useAuth();
    const isDark = mode === 'dark';
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<Note[]>([]);
    const [activePaper, setActivePaper] = useState('GS I');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [noteLoading, setNoteLoading] = useState(false);

    const protectedRef = useRef<any>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    // ─── Content Protection (Web only) ───
    useEffect(() => {
        if (Platform.OS !== 'web' || !selectedNote) return;

        // Block keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ['c', 's', 'p', 'a', 'u'].includes(e.key.toLowerCase())) ||
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 's'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Block right-click
        const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };

        // Block copy/cut
        const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); };

        // Block print via CSS
        const printStyle = document.createElement('style');
        printStyle.id = 'ai-notes-print-block';
        printStyle.textContent = '@media print { body { display: none !important; } }';
        document.head.appendChild(printStyle);

        // Blur on tab switch (screen recording deterrent)
        const handleVisibility = () => {
            if (protectedRef.current) {
                if (document.hidden) {
                    protectedRef.current.style.filter = 'blur(20px)';
                } else {
                    protectedRef.current.style.filter = 'none';
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCopy);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCopy);
            document.removeEventListener('visibilitychange', handleVisibility);
            const el = document.getElementById('ai-notes-print-block');
            if (el) el.remove();
        };
    }, [selectedNote]);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const openNote = async (id: string) => {
        setNoteLoading(true);
        try {
            const res = await api.get(`/notes/${id}`);
            setSelectedNote(res.data);
        } catch (error) {
            console.error('Error fetching note:', error);
        } finally {
            setNoteLoading(false);
        }
    };

    const bg = isDark ? '#111827' : '#f9fafb';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const border = isDark ? '#374151' : '#e5e7eb';
    const textPrimary = isDark ? '#f3f4f6' : '#111827';
    const textSecondary = isDark ? '#9ca3af' : '#6b7280';
    const textMuted = isDark ? '#6b7280' : '#9ca3af';
    const paperColor = PAPER_COLORS[activePaper] || '#3b82f6';

    const filteredNotes = notes.filter(n => {
        if (n.paper !== activePaper) return false;
        if (activeSubject && n.subject !== activeSubject) return false;
        return true;
    });
    const subjects = Array.from(new Set(notes.filter(n => n.paper === activePaper).map(n => n.subject)));

    // ─── Reader View (Protected) ───
    if (selectedNote) {
        const watermarkText = user ? `${user.name || ''} • ${user.email || ''}` : 'IAS User';
        return (
            <View style={{ flex: 1, backgroundColor: bg }}>
                {/* Header bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: border, backgroundColor: cardBg }}>
                    <TouchableOpacity onPress={() => setSelectedNote(null)} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="arrow-back" size={20} color={textPrimary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: textMuted, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{selectedNote.paper} • {selectedNote.subject}</Text>
                        <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold' }} numberOfLines={1}>{selectedNote.title}</Text>
                    </View>
                    <View style={{ backgroundColor: '#ef444422', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="shield-checkmark" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: 'bold' }}>PROTECTED</Text>
                    </View>
                </View>

                {/* Protected content area */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: isDesktop ? 40 : 20, paddingBottom: 80 }}
                >
                    <View
                        ref={protectedRef}
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: 16,
                            padding: isDesktop ? 40 : 20,
                            borderWidth: 1,
                            borderColor: border,
                            position: 'relative',
                            overflow: 'hidden',
                            // @ts-ignore — web-only CSS
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                        } as any}
                        // @ts-ignore
                        onDragStart={(e: any) => { if (Platform.OS === 'web') e.preventDefault?.(); }}
                    >
                        {/* Watermark overlay */}
                        {Platform.OS === 'web' && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    // @ts-ignore
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                    overflow: 'hidden',
                                    opacity: 0.06,
                                } as any}
                            >
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <Text
                                        key={i}
                                        style={{
                                            color: isDark ? '#ffffff' : '#000000',
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                            // @ts-ignore
                                            transform: [{ rotate: '-30deg' }],
                                            marginVertical: 30,
                                            marginLeft: (i % 3) * 200 - 100,
                                            letterSpacing: 2,
                                        } as any}
                                    >
                                        {watermarkText}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {/* Note content */}
                        <View style={{ marginBottom: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {selectedNote.tags?.map((tag, i) => (
                                <View key={i} style={{ backgroundColor: paperColor + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: paperColor + '30' }}>
                                    <Text style={{ color: paperColor, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <Text
                            style={{
                                color: textPrimary,
                                fontSize: 15,
                                lineHeight: 28,
                                // @ts-ignore
                                whiteSpace: 'pre-wrap',
                            } as any}
                        >
                            {selectedNote.content || 'No content available for this note.'}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // ─── List View ───
    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ color: textSecondary, marginTop: 16 }}>Loading notes...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingHorizontal: isDesktop ? 32 : 16, paddingVertical: 32, paddingBottom: 80 }}>

            {/* ═══ Page Header ═══ */}
            <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={20} color={textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={{ color: textMuted, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>IAS Knowledge Hub</Text>
                    <Text style={{ color: textPrimary, fontSize: 26, fontWeight: 'bold' }}>📝 IASuite Notes</Text>
                </View>
            </View>

            {/* ═══ Stats Banner ═══ */}
            <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: border, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${paperColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="document-text" size={24} color={paperColor} />
                    </View>
                    <View>
                        <Text style={{ color: textPrimary, fontWeight: 'bold', fontSize: 16 }}>{activePaper} Notes</Text>
                        <Text style={{ color: textSecondary, fontSize: 13 }}>Protected study material — view only</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: paperColor, fontSize: 22, fontWeight: 'bold' }}>{filteredNotes.length}</Text>
                        <Text style={{ color: textMuted, fontSize: 11 }}>Notes</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#10b981', fontSize: 22, fontWeight: 'bold' }}>{subjects.length}</Text>
                        <Text style={{ color: textMuted, fontSize: 11 }}>Subjects</Text>
                    </View>
                </View>
            </View>

            {/* ═══ Paper Tabs ═══ */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: textMuted, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Select Paper</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
                    {PAPERS.map(paper => {
                        const isSel = activePaper === paper;
                        const pc = PAPER_COLORS[paper];
                        const count = notes.filter(n => n.paper === paper).length;
                        return (
                            <TouchableOpacity
                                key={paper}
                                onPress={() => { setActivePaper(paper); setActiveSubject(null); }}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                                    backgroundColor: isSel ? pc : cardBg,
                                    borderWidth: 1.5, borderColor: isSel ? pc : border,
                                    flexDirection: 'row', alignItems: 'center', gap: 8,
                                }}
                            >
                                <Text style={{ color: isSel ? 'white' : textPrimary, fontWeight: isSel ? 'bold' : '600', fontSize: 13 }}>{paper}</Text>
                                {count > 0 && (
                                    <View style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : `${pc}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                        <Text style={{ color: isSel ? 'white' : pc, fontSize: 11, fontWeight: 'bold' }}>{count}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ═══ Subject Filter ═══ */}
            {subjects.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: textMuted, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Filter by Subject</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => setActiveSubject(null)}
                            style={{
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                                backgroundColor: !activeSubject ? paperColor : cardBg,
                                borderWidth: 1, borderColor: !activeSubject ? paperColor : border,
                            }}
                        >
                            <Text style={{ color: !activeSubject ? 'white' : textPrimary, fontWeight: !activeSubject ? 'bold' : '500', fontSize: 13 }}>All</Text>
                        </TouchableOpacity>
                        {subjects.map(subj => {
                            const isSel = activeSubject === subj;
                            return (
                                <TouchableOpacity
                                    key={subj}
                                    onPress={() => setActiveSubject(isSel ? null : subj)}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                                        backgroundColor: isSel ? paperColor : cardBg,
                                        borderWidth: 1, borderColor: isSel ? paperColor : border,
                                    }}
                                >
                                    <Text style={{ color: isSel ? 'white' : textPrimary, fontWeight: isSel ? 'bold' : '500', fontSize: 13 }}>{subj}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* ═══ Notes Cards ═══ */}
            {filteredNotes.length === 0 ? (
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: border }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${paperColor}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Ionicons name="document-text" size={32} color={paperColor} />
                    </View>
                    <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No notes yet</Text>
                    <Text style={{ color: textSecondary, fontSize: 14, textAlign: 'center', maxWidth: 320 }}>IASuite Notes for {activePaper} will appear here once uploaded by the admin.</Text>
                </View>
            ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {filteredNotes.map(note => (
                        <TouchableOpacity
                            key={note._id}
                            onPress={() => openNote(note._id)}
                            style={{
                                backgroundColor: cardBg,
                                borderRadius: 16, padding: 20,
                                flex: 1, minWidth: isDesktop ? 320 : '100%', maxWidth: isDesktop ? '48%' : '100%',
                                borderWidth: 1, borderColor: border,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <View style={{ backgroundColor: `${paperColor}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                            <Text style={{ color: paperColor, fontSize: 11, fontWeight: 'bold' }}>{note.paper}</Text>
                                        </View>
                                        <Text style={{ color: textMuted, fontSize: 11 }}>•</Text>
                                        <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '500' }}>{note.subject}</Text>
                                    </View>
                                    <Text style={{ color: textPrimary, fontSize: 16, fontWeight: 'bold', lineHeight: 22 }}>{note.title}</Text>
                                </View>
                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${paperColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="document-text" size={20} color={paperColor} />
                                </View>
                            </View>

                            {note.tags?.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                    {note.tags.slice(0, 4).map((tag, i) => (
                                        <View key={i} style={{ backgroundColor: `${paperColor}10`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: `${paperColor}25` }}>
                                            <Text style={{ color: paperColor, fontSize: 11, fontWeight: '500' }}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderColor: isDark ? '#374151' : '#f3f4f6' }}>
                                <Text style={{ color: textMuted, fontSize: 11 }}>
                                    {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${paperColor}15`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                                    <Ionicons name="eye" size={14} color={paperColor} />
                                    <Text style={{ color: paperColor, fontSize: 12, fontWeight: 'bold' }}>Read</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {noteLoading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={{ color: 'white', marginTop: 12, fontWeight: 'bold' }}>Loading note...</Text>
                </View>
            )}
        </ScrollView>
    );
}
