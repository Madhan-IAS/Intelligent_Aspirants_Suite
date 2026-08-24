import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform, useWindowDimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

const PAPERS = ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT'];

const PAPER_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    'GS I': { color: '#3b82f6', icon: 'library', label: 'History, Culture & Geography' },
    'GS II': { color: '#10b981', icon: 'document-text', label: 'Polity, Governance & IR' },
    'GS III': { color: '#f59e0b', icon: 'trending-up', label: 'Economy, S&T & Environment' },
    'GS IV': { color: '#ec4899', icon: 'heart', label: 'Ethics, Integrity & Aptitude' },
    'CSAT': { color: '#06b6d4', icon: 'calculator', label: 'Aptitude & Comprehension' },
};

const DEFAULT_SUBJECTS: Record<string, string[]> = {
    'GS I': ['Ancient India', 'Medieval India', 'Modern India', 'Post Independent India', 'World History', 'Indian Society', 'Indian Geography', 'World Geography'],
    'GS II': ['Indian Constitution', 'Indian Polity', 'Governance', 'Social Justice', 'International Relations', 'Important Institutions'],
    'GS III': ['Indian Economy', 'Agriculture', 'Science & Technology', 'Environment & Ecology', 'Disaster Management', 'Internal Security'],
    'GS IV': ['Ethics & Human Interface', 'Attitude', 'Aptitude & Values', 'Emotional Intelligence', 'Public Administration Ethics', 'Case Studies'],
    'CSAT': ['Comprehension', 'Logical Reasoning', 'Analytical Ability', 'Decision Making', 'Data Interpretation', 'Basic Numeracy'],
};

export default function MindMapsPage() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    const [loading, setLoading] = useState(true);
    const [mindMaps, setMindMaps] = useState<any[]>([]);
    const [activePaper, setActivePaper] = useState('GS I');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Add form state
    const [newTitle, setNewTitle] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    useEffect(() => {
        fetchMindMaps();
    }, []);

    const fetchMindMaps = async () => {
        try {
            const res = await api.get('/mind-maps');
            setMindMaps(res.data);
        } catch (error) {
            console.error('Error fetching mind maps:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMindMap = async () => {
        if (!newTitle.trim()) return;
        const subject = newSubject.trim() || (DEFAULT_SUBJECTS[activePaper]?.[0] || 'General');
        try {
            await api.post('/mind-maps', {
                paper: activePaper,
                subject,
                title: newTitle.trim(),
                description: newDescription.trim(),
                content: newContent.trim(),
                imageUrl: newImageUrl.trim(),
                tags: [activePaper, subject],
            });
            setNewTitle('');
            setNewSubject('');
            setNewDescription('');
            setNewContent('');
            setNewImageUrl('');
            setShowAddForm(false);
            fetchMindMaps();
        } catch (error) {
            console.error('Error adding mind map:', error);
        }
    };

    const handleDeleteMindMap = async (id: string) => {
        if (Platform.OS === 'web') {
            if (!window.confirm('Delete this mind map?')) return;
        } else {
            // For mobile we'd use Alert, but simplified here
        }
        try {
            await api.delete(`/mind-maps/${id}`);
            fetchMindMaps();
        } catch (error) {
            console.error('Error deleting mind map:', error);
        }
    };

    // ─── PDF Download (Web only, generates a beautiful printable page) ───
    const handleDownloadPDF = (mindMap: any) => {
        if (Platform.OS !== 'web') return;

        const paperColor = PAPER_CONFIG[mindMap.paper]?.color || '#3b82f6';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${mindMap.title} — Mind Map</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #ffffff; color: #111827; padding: 0; }
  
  .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
  
  /* Header Banner */
  .header { 
    background: linear-gradient(135deg, ${paperColor}, ${paperColor}dd); 
    color: white; 
    padding: 32px 40px; 
    border-radius: 16px; 
    margin-bottom: 32px; 
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -30px; left: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .header-badge { 
    display: inline-block; 
    background: rgba(255,255,255,0.2); 
    padding: 4px 14px; 
    border-radius: 20px; 
    font-size: 12px; 
    font-weight: 700; 
    letter-spacing: 1.5px; 
    text-transform: uppercase;
    margin-bottom: 12px;
    backdrop-filter: blur(4px);
  }
  .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 6px; position: relative; z-index: 1; }
  .header .subtitle { font-size: 14px; opacity: 0.85; font-weight: 500; position: relative; z-index: 1; }
  
  /* Meta Info Strip */
  .meta-strip {
    display: flex;
    gap: 24px;
    padding: 16px 0;
    border-bottom: 2px solid #f3f4f6;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
  .meta-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: ${paperColor};
  }
  
  /* Content Section */
  .content-section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 28px 32px;
    margin-bottom: 24px;
    line-height: 1.8;
    font-size: 15px;
    color: #374151;
    white-space: pre-wrap;
  }
  .content-section h2 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid ${paperColor}44;
  }
  
  /* Description */
  .description {
    font-size: 15px;
    color: #4b5563;
    line-height: 1.7;
    margin-bottom: 28px;
    padding: 20px 24px;
    background: linear-gradient(135deg, ${paperColor}08, ${paperColor}04);
    border-left: 4px solid ${paperColor};
    border-radius: 0 12px 12px 0;
  }
  
  /* Image Container */
  .image-container {
    text-align: center;
    margin-bottom: 24px;
  }
  .image-container img {
    max-width: 100%;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }
  
  /* Footer */
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #9ca3af;
  }
  .footer-brand {
    font-weight: 700;
    color: ${paperColor};
    font-size: 13px;
  }
  
  /* Tags */
  .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .tag {
    background: ${paperColor}15;
    color: ${paperColor};
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid ${paperColor}30;
  }
  
  @media print {
    body { padding: 0; }
    .page { padding: 24px 20px; }
    .header { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-badge">${mindMap.paper} — Mind Map</div>
    <h1>${mindMap.title}</h1>
    <div class="subtitle">${mindMap.subject}</div>
  </div>
  
  <div class="meta-strip">
    <div class="meta-item"><div class="meta-dot"></div> Paper: ${mindMap.paper}</div>
    <div class="meta-item"><div class="meta-dot"></div> Subject: ${mindMap.subject}</div>
    <div class="meta-item"><div class="meta-dot"></div> Created: ${new Date(mindMap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
  
  ${mindMap.tags && mindMap.tags.length > 0 ? `<div class="tags">${mindMap.tags.map((t: string) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
  
  ${mindMap.description ? `<div class="description">${mindMap.description}</div>` : ''}
  
  ${mindMap.imageUrl ? `<div class="image-container"><img src="${mindMap.imageUrl}" alt="${mindMap.title}" /></div>` : ''}
  
  ${mindMap.content ? `<div class="content-section"><h2>Mind Map Content</h2>${mindMap.content}</div>` : ''}
  
  <div class="footer">
    <div class="footer-brand">IAS — Intelligent Aspirant's Suite</div>
    <div>Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
</div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); }, 600);
        }
    };

    // ─── Download ALL Mind Maps as single PDF ───
    const handleDownloadAllPDF = () => {
        if (Platform.OS !== 'web') return;
        if (filteredMaps.length === 0) return;

        const pc = PAPER_CONFIG[activePaper]?.color || '#3b82f6';
        const subjectLabel = activeSubject || 'All Subjects';
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        // Group for TOC
        const groups: Record<string, any[]> = {};
        filteredMaps.forEach(m => {
            if (!groups[m.subject]) groups[m.subject] = [];
            groups[m.subject].push(m);
        });

        // Build individual map sections
        const mapSections = filteredMaps.map((mm, idx) => `
  <div class="map-section">
    <div class="map-header">
      <div class="map-number">${idx + 1}</div>
      <div>
        <div class="map-badge">${mm.paper} · ${mm.subject}</div>
        <h2 class="map-title">${mm.title}</h2>
      </div>
    </div>
    ${mm.description ? `<div class="map-desc">${mm.description}</div>` : ''}
    ${mm.imageUrl ? `<div style="text-align:center;margin-bottom:20px"><img src="${mm.imageUrl}" style="max-width:100%;border-radius:10px;border:1px solid #e5e7eb" /></div>` : ''}
    ${mm.content ? `<div class="map-content"><pre>${mm.content}</pre></div>` : ''}
    ${mm.tags && mm.tags.length > 0 ? `<div class="map-tags">${mm.tags.map((t: string) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
  </div>`).join('\n');

        // Build TOC
        const tocItems = Object.keys(groups).map(subj => {
            const items = groups[subj].map((m: any) => `<li>${m.title}</li>`).join('');
            return `<div class="toc-group"><h4>${subj} (${groups[subj].length})</h4><ul>${items}</ul></div>`;
        }).join('');

        const htmlAll = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${activePaper} Mind Maps — ${subjectLabel}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',-apple-system,sans-serif; background:#fff; color:#111827; }
  .page { max-width:800px; margin:0 auto; padding:40px 36px; }

  /* Cover */
  .cover { text-align:center; padding:80px 40px 60px; page-break-after:always; }
  .cover-icon { font-size:64px; margin-bottom:24px; }
  .cover-badge { display:inline-block; background:${pc}18; color:${pc}; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:20px; border:1px solid ${pc}30; }
  .cover h1 { font-size:36px; font-weight:800; color:#111827; margin-bottom:8px; }
  .cover .sub { font-size:16px; color:#6b7280; font-weight:500; margin-bottom:32px; }
  .cover-stats { display:flex; justify-content:center; gap:40px; margin-top:32px; }
  .cover-stat { text-align:center; }
  .cover-stat .num { font-size:32px; font-weight:800; color:${pc}; }
  .cover-stat .lbl { font-size:12px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
  .cover-line { width:80px; height:4px; background:${pc}; margin:32px auto 0; border-radius:2px; }
  .cover-footer { margin-top:40px; font-size:12px; color:#9ca3af; }

  /* TOC */
  .toc { page-break-after:always; }
  .toc h3 { font-size:22px; font-weight:800; margin-bottom:24px; padding-bottom:12px; border-bottom:3px solid ${pc}; color:#111827; }
  .toc-group { margin-bottom:20px; }
  .toc-group h4 { font-size:15px; font-weight:700; color:${pc}; margin-bottom:8px; }
  .toc-group ul { list-style:none; padding-left:16px; }
  .toc-group li { font-size:13px; color:#374151; padding:4px 0; border-bottom:1px solid #f3f4f6; }
  .toc-group li::before { content:'→ '; color:${pc}; font-weight:600; }

  /* Map Sections */
  .map-section { page-break-inside:avoid; margin-bottom:40px; padding-bottom:32px; border-bottom:2px solid #f3f4f6; }
  .map-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:16px; }
  .map-number { width:40px; height:40px; border-radius:12px; background:${pc}15; color:${pc}; font-weight:800; font-size:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .map-badge { font-size:11px; color:${pc}; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .map-title { font-size:20px; font-weight:800; color:#111827; }
  .map-desc { font-size:14px; color:#4b5563; line-height:1.7; margin-bottom:16px; padding:16px 20px; background:${pc}06; border-left:4px solid ${pc}; border-radius:0 10px 10px 0; }
  .map-content { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px 24px; margin-bottom:16px; }
  .map-content pre { font-family:'Inter',monospace; font-size:13px; line-height:1.8; color:#374151; white-space:pre-wrap; word-wrap:break-word; }
  .map-tags { display:flex; gap:6px; flex-wrap:wrap; }
  .tag { background:${pc}12; color:${pc}; padding:3px 10px; border-radius:16px; font-size:11px; font-weight:600; border:1px solid ${pc}25; }

  /* Footer */
  .doc-footer { text-align:center; padding-top:24px; border-top:2px solid #f3f4f6; font-size:12px; color:#9ca3af; margin-top:40px; }
  .doc-footer .brand { color:${pc}; font-weight:700; font-size:13px; }

  @media print {
    .map-section { page-break-inside:avoid; }
    .cover { page-break-after:always; }
    .toc { page-break-after:always; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-icon">🧠</div>
    <div class="cover-badge">${activePaper} — Mind Maps Collection</div>
    <h1>${subjectLabel}</h1>
    <div class="sub">${PAPER_CONFIG[activePaper]?.label || ''}</div>
    <div class="cover-stats">
      <div class="cover-stat"><div class="num">${filteredMaps.length}</div><div class="lbl">Mind Maps</div></div>
      <div class="cover-stat"><div class="num">${Object.keys(groups).length}</div><div class="lbl">Subjects</div></div>
    </div>
    <div class="cover-line"></div>
    <div class="cover-footer">IAS — Intelligent Aspirant's Suite<br/>${dateStr}</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h3>📋 Table of Contents</h3>
    ${tocItems}
  </div>

  <!-- All Mind Maps -->
  ${mapSections}

  <div class="doc-footer">
    <div class="brand">IAS — Intelligent Aspirant's Suite</div>
    <div style="margin-top:6px">${filteredMaps.length} Mind Maps · Generated on ${dateStr}</div>
  </div>

</div>
</body>
</html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(htmlAll);
            w.document.close();
            setTimeout(() => { w.print(); }, 800);
        }
    };

    // ─── Filter logic ───
    const paperMaps = mindMaps.filter(m => m.paper === activePaper);
    const subjects = DEFAULT_SUBJECTS[activePaper] || [];
    const existingSubjects = Array.from(new Set(paperMaps.map(m => m.subject)));
    const allSubjects = Array.from(new Set([...subjects, ...existingSubjects]));

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredMaps = paperMaps.filter(m => {
        const matchesSubject = !activeSubject || m.subject === activeSubject;
        if (!matchesSubject) return false;
        if (!normalizedQuery) return true;
        return (
            (m.title || '').toLowerCase().includes(normalizedQuery) ||
            (m.subject || '').toLowerCase().includes(normalizedQuery) ||
            (m.description || '').toLowerCase().includes(normalizedQuery) ||
            (m.tags || []).some((t: string) => t.toLowerCase().includes(normalizedQuery))
        );
    });

    // Group by subject
    const subjectGroups: Record<string, any[]> = {};
    filteredMaps.forEach(m => {
        if (!subjectGroups[m.subject]) subjectGroups[m.subject] = [];
        subjectGroups[m.subject].push(m);
    });

    const paperColor = PAPER_CONFIG[activePaper]?.color || '#3b82f6';
    const totalMaps = paperMaps.length;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#60a5fa" />
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 16 }}>Loading mind maps...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 80 }}>

            {/* ═══ Page Header ═══ */}
            <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>IAS Knowledge Hub</Text>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 26, fontWeight: 'bold' }}>🧠 Mind Maps</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => setShowAddForm(!showAddForm)}
                    style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Ionicons name={showAddForm ? "close" : "add"} size={16} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>{showAddForm ? 'Cancel' : 'Add Mind Map'}</Text>
                </TouchableOpacity>
            </View>

            {/* ═══ Stats Banner ═══ */}
            <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: paperColor, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${paperColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="git-network" size={24} color={paperColor} />
                    </View>
                    <View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }}>{activePaper} Mind Maps</Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>{PAPER_CONFIG[activePaper]?.label}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: paperColor, fontSize: 22, fontWeight: 'bold' }}>{totalMaps}</Text>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>Total Maps</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#10b981', fontSize: 22, fontWeight: 'bold' }}>{Object.keys(subjectGroups).length}</Text>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>Subjects</Text>
                    </View>
                    {Platform.OS === 'web' && filteredMaps.length > 0 && (
                        <TouchableOpacity
                            onPress={handleDownloadAllPDF}
                            style={{ backgroundColor: `${paperColor}15`, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: `${paperColor}30`, marginLeft: 8 }}
                        >
                            <Ionicons name="download" size={18} color={paperColor} />
                            <Text style={{ color: paperColor, fontSize: 13, fontWeight: 'bold' }}>Download All PDF</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ═══ Paper Tab Pills ═══ */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Select Paper</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
                    {PAPERS.map(paper => {
                        const isSel = activePaper === paper;
                        const pc = PAPER_CONFIG[paper];
                        const count = mindMaps.filter(m => m.paper === paper).length;
                        return (
                            <TouchableOpacity
                                key={paper}
                                onPress={() => { setActivePaper(paper); setActiveSubject(null); }}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                                    backgroundColor: isSel ? pc.color : (isDark ? '#1f2937' : '#ffffff'),
                                    borderWidth: 1.5,
                                    borderColor: isSel ? pc.color : (isDark ? '#374151' : '#e5e7eb'),
                                    flexDirection: 'row', alignItems: 'center', gap: 8,
                                }}
                            >
                                <Ionicons name={pc.icon as any} size={16} color={isSel ? 'white' : pc.color} />
                                <Text style={{ color: isSel ? 'white' : (isDark ? '#e5e7eb' : '#374151'), fontWeight: isSel ? 'bold' : '600', fontSize: 13 }}>{paper}</Text>
                                {count > 0 && (
                                    <View style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : `${pc.color}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                        <Text style={{ color: isSel ? 'white' : pc.color, fontSize: 11, fontWeight: 'bold' }}>{count}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ═══ Subject Filter Pills ═══ */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Filter by Subject</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
                    <TouchableOpacity
                        onPress={() => setActiveSubject(null)}
                        style={{
                            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                            backgroundColor: !activeSubject ? paperColor : (isDark ? '#1f2937' : '#ffffff'),
                            borderWidth: 1, borderColor: !activeSubject ? paperColor : (isDark ? '#374151' : '#e5e7eb'),
                        }}
                    >
                        <Text style={{ color: !activeSubject ? 'white' : (isDark ? '#e5e7eb' : '#374151'), fontWeight: !activeSubject ? 'bold' : '500', fontSize: 13 }}>All Subjects</Text>
                    </TouchableOpacity>
                    {allSubjects.map(subj => {
                        const isSel = activeSubject === subj;
                        const count = paperMaps.filter(m => m.subject === subj).length;
                        return (
                            <TouchableOpacity
                                key={subj}
                                onPress={() => setActiveSubject(isSel ? null : subj)}
                                style={{
                                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                                    backgroundColor: isSel ? paperColor : (isDark ? '#1f2937' : '#ffffff'),
                                    borderWidth: 1, borderColor: isSel ? paperColor : (isDark ? '#374151' : '#e5e7eb'),
                                    flexDirection: 'row', alignItems: 'center', gap: 6,
                                }}
                            >
                                <Text style={{ color: isSel ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: isSel ? 'bold' : '500', fontSize: 13 }}>{subj}</Text>
                                {count > 0 && (
                                    <View style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : (isDark ? '#374151' : '#f3f4f6'), paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                                        <Text style={{ color: isSel ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), fontSize: 10, fontWeight: 'bold' }}>{count}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ═══ Search Bar ═══ */}
            <View style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderRadius: 16, borderWidth: 1.5,
                borderColor: searchQuery ? paperColor : (isDark ? '#374151' : '#e5e7eb'),
                paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24,
                flexDirection: 'row', alignItems: 'center',
            }}>
                <Ionicons name="search" size={20} color={searchQuery ? paperColor : (isDark ? '#9ca3af' : '#6b7280')} style={{ marginRight: 12 }} />
                <TextInput
                    placeholder="Search mind maps by title, subject, or tags..."
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ flex: 1, color: isDark ? 'white' : '#111827', fontSize: 15, fontWeight: '500', outlineStyle: 'none' } as any}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                        <Ionicons name="close-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                )}
            </View>

            {/* ═══ Add Mind Map Form ═══ */}
            {showAddForm && (
                <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 2, borderColor: paperColor, marginBottom: 24, gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${paperColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="add-circle" size={20} color={paperColor} />
                        </View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>New Mind Map — {activePaper}</Text>
                    </View>

                    <TextInput
                        placeholder="Mind Map Title (e.g. Mauryan Empire Overview)"
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                        value={newTitle}
                        onChangeText={setNewTitle}
                    />

                    <View>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Select Subject:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {(DEFAULT_SUBJECTS[activePaper] || []).map(subj => (
                                <TouchableOpacity
                                    key={subj}
                                    onPress={() => setNewSubject(subj)}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                                        backgroundColor: newSubject === subj ? paperColor : (isDark ? '#111827' : '#f3f4f6'),
                                        borderWidth: 1, borderColor: newSubject === subj ? paperColor : (isDark ? '#374151' : '#e5e7eb'),
                                    }}
                                >
                                    <Text style={{ color: newSubject === subj ? 'white' : (isDark ? '#d1d5db' : '#374151'), fontWeight: newSubject === subj ? 'bold' : '500', fontSize: 13 }}>{subj}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <TextInput
                        placeholder="Description (optional)"
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                        value={newDescription}
                        onChangeText={setNewDescription}
                        multiline
                    />

                    <TextInput
                        placeholder="Mind Map Content (you'll add this later — paste key points, hierarchies, etc.)"
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', minHeight: 100, textAlignVertical: 'top', outlineStyle: 'none' } as any}
                        value={newContent}
                        onChangeText={setNewContent}
                        multiline
                    />

                    <TextInput
                        placeholder="Image URL (optional — link to diagram/image)"
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        style={{ color: isDark ? 'white' : '#111827', fontSize: 15, backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', outlineStyle: 'none' } as any}
                        value={newImageUrl}
                        onChangeText={setNewImageUrl}
                    />

                    <TouchableOpacity onPress={handleAddMindMap} style={{ backgroundColor: paperColor, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Save Mind Map</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ═══ Mind Map Cards ═══ */}
            {filteredMaps.length === 0 ? (
                <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${paperColor}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Ionicons name="git-network" size={32} color={paperColor} />
                    </View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                        {searchQuery ? 'No matching mind maps' : 'No mind maps yet'}
                    </Text>
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
                        {searchQuery ? `No mind maps found for "${searchQuery}". Try a different search.` : `Add your first ${activePaper} mind map using the button above. You'll provide the content subject-by-subject later.`}
                    </Text>
                </View>
            ) : (
                Object.keys(subjectGroups).map(subjectName => (
                    <View key={subjectName} style={{ marginBottom: 28 }}>
                        {/* Subject Group Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: paperColor }} />
                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>{subjectName}</Text>
                            <View style={{ backgroundColor: `${paperColor}20`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                                <Text style={{ color: paperColor, fontSize: 12, fontWeight: 'bold' }}>{subjectGroups[subjectName].length} maps</Text>
                            </View>
                        </View>

                        {/* Cards Grid */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                            {subjectGroups[subjectName].map((mm: any) => (
                                <View
                                    key={mm._id}
                                    style={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        borderRadius: 16, padding: 20, flex: 1, minWidth: isDesktop ? 320 : '100%', maxWidth: isDesktop ? '48%' : '100%',
                                        borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb',
                                    }}
                                >
                                    {/* Card Header */}
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <View style={{ flex: 1, paddingRight: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <View style={{ backgroundColor: `${paperColor}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                                    <Text style={{ color: paperColor, fontSize: 11, fontWeight: 'bold' }}>{mm.paper}</Text>
                                                </View>
                                                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>•</Text>
                                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: '500' }}>{mm.subject}</Text>
                                            </View>
                                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', lineHeight: 22 }}>{mm.title}</Text>
                                        </View>
                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${paperColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                                            <Ionicons name="git-network" size={20} color={paperColor} />
                                        </View>
                                    </View>

                                    {/* Description */}
                                    {mm.description ? (
                                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, lineHeight: 20, marginBottom: 12 }} numberOfLines={3}>{mm.description}</Text>
                                    ) : null}

                                    {/* Content Preview */}
                                    {mm.content ? (
                                        <View style={{ backgroundColor: isDark ? 'rgba(17,24,39,0.5)' : '#f9fafb', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, lineHeight: 18 }} numberOfLines={4}>{mm.content}</Text>
                                        </View>
                                    ) : null}

                                    {/* Tags */}
                                    {mm.tags && mm.tags.length > 0 && (
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                            {mm.tags.slice(0, 4).map((tag: string, i: number) => (
                                                <View key={i} style={{ backgroundColor: `${paperColor}10`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: `${paperColor}25` }}>
                                                    <Text style={{ color: paperColor, fontSize: 11, fontWeight: '500' }}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Card Footer Actions */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderColor: isDark ? '#374151' : '#f3f4f6' }}>
                                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>
                                            {new Date(mm.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {/* Download as PDF */}
                                            {Platform.OS === 'web' && (
                                                <TouchableOpacity
                                                    onPress={() => handleDownloadPDF(mm)}
                                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                                >
                                                    <Ionicons name="download" size={14} color="#10b981" />
                                                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 'bold' }}>PDF</Text>
                                                </TouchableOpacity>
                                            )}
                                            {/* Delete */}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteMindMap(mm._id)}
                                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                                            >
                                                <Ionicons name="trash" size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))
            )}

        </ScrollView>
    );
}
