import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { COVERAGE_MATRIX, BOOK_LIST } from '../src/data/bookListData';

type TabKey = 'coverage' | 'bookshelf';

export default function BookListPage() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;
    const [activeTab, setActiveTab] = useState<TabKey>('coverage');

    const bg = isDark ? '#111827' : '#f9fafb';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const border = isDark ? '#374151' : '#e5e7eb';
    const textPrimary = isDark ? '#f3f4f6' : '#111827';
    const textSecondary = isDark ? '#9ca3af' : '#6b7280';
    const textMuted = isDark ? '#6b7280' : '#9ca3af';

    // Table cell style helpers
    const cellBase = { paddingVertical: 10, paddingHorizontal: 12 } as const;
    const headerCell = { ...cellBase, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' } as const;

    const tabs: { key: TabKey; label: string; icon: string; count: number; color: string }[] = [
        { key: 'coverage', label: 'Coverage Matrix', icon: 'grid', count: COVERAGE_MATRIX.length, color: '#3b82f6' },
        { key: 'bookshelf', label: 'Core Bookshelf', icon: 'book', count: 30, color: '#10b981' },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingHorizontal: isDesktop ? 32 : 16, paddingVertical: 32, paddingBottom: 80 }}>

            {/* ═══ Page Header ═══ */}
            <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={20} color={textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={{ color: textMuted, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>IAS Study Resources</Text>
                    <Text style={{ color: textPrimary, fontSize: 26, fontWeight: 'bold' }}>📚 Book List</Text>
                </View>
            </View>

            {/* ═══ Stats Banner ═══ */}
            <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: border, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59, 130, 246, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="library" size={24} color="#3b82f6" />
                    </View>
                    <View>
                        <Text style={{ color: textPrimary, fontWeight: 'bold', fontSize: 16 }}>UPSC CSE Master Book List</Text>
                        <Text style={{ color: textSecondary, fontSize: 13 }}>Complete static + dynamic coverage for all subjects</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#3b82f6', fontSize: 22, fontWeight: 'bold' }}>46</Text>
                        <Text style={{ color: textMuted, fontSize: 11 }}>Subjects</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#10b981', fontSize: 22, fontWeight: 'bold' }}>30</Text>
                        <Text style={{ color: textMuted, fontSize: 11 }}>Core Books</Text>
                    </View>
                </View>
            </View>

            {/* ═══ Tab Switcher ═══ */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={{
                                paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
                                backgroundColor: isActive ? tab.color : cardBg,
                                borderWidth: 1.5,
                                borderColor: isActive ? tab.color : border,
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                            }}
                        >
                            <Ionicons name={tab.icon as any} size={16} color={isActive ? 'white' : tab.color} />
                            <Text style={{ color: isActive ? 'white' : textPrimary, fontWeight: isActive ? 'bold' : '600', fontSize: 14 }}>{tab.label}</Text>
                            <View style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : `${tab.color}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                <Text style={{ color: isActive ? 'white' : tab.color, fontSize: 11, fontWeight: 'bold' }}>{tab.count}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ═══ Coverage Matrix Table ═══ */}
            {activeTab === 'coverage' && (
                <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor: border, overflow: 'hidden' }}>
                    <View style={{ padding: 20, borderBottomWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="grid" size={20} color="#3b82f6" />
                        <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold' }}>100% Coverage Matrix</Text>
                        <View style={{ backgroundColor: '#3b82f620', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>{COVERAGE_MATRIX.length} Subjects</Text>
                        </View>
                    </View>
                    <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={true}>
                        <View style={{ minWidth: isDesktop ? '100%' : 900 }}>
                            {/* Table Header */}
                            <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderColor: border }}>
                                <View style={{ ...headerCell, width: isDesktop ? '20%' : 180 }}><Text style={{ color: textPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subject</Text></View>
                                <View style={{ ...headerCell, width: isDesktop ? '22%' : 200 }}><Text style={{ color: textPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>NCERTs / Foundation</Text></View>
                                <View style={{ ...headerCell, width: isDesktop ? '22%' : 220 }}><Text style={{ color: textPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Standard Books</Text></View>
                                <View style={{ ...headerCell, width: isDesktop ? '26%' : 240 }}><Text style={{ color: textPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Additional Sources</Text></View>
                                <View style={{ ...headerCell, width: isDesktop ? '10%' : 100, alignItems: 'center' }}><Text style={{ color: textPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Coverage</Text></View>
                            </View>
                            {/* Table Rows */}
                            {COVERAGE_MATRIX.map((entry, idx) => {
                                const badgeColor = entry.coverage === '🔴 Essential' ? '#ef4444' : entry.coverage === '🟢 Dynamic' ? '#f59e0b' : '#22c55e';
                                const badgeLabel = entry.coverage.replace('🟢 ', '').replace('🔴 ', '');
                                const isEven = idx % 2 === 0;
                                const rowBg = isEven ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)') : 'transparent';
                                return (
                                    <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: isDark ? '#1f2937' : '#f3f4f6', backgroundColor: rowBg }}>
                                        <View style={{ ...cellBase, width: isDesktop ? '20%' : 180 }}>
                                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '700' }}>{entry.subject}</Text>
                                        </View>
                                        <View style={{ ...cellBase, width: isDesktop ? '22%' : 200 }}>
                                            <Text style={{ color: textSecondary, fontSize: 12 }}>{entry.ncerts}</Text>
                                        </View>
                                        <View style={{ ...cellBase, width: isDesktop ? '22%' : 220 }}>
                                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600' }}>{entry.standardBooks}</Text>
                                        </View>
                                        <View style={{ ...cellBase, width: isDesktop ? '26%' : 240 }}>
                                            <Text style={{ color: textSecondary, fontSize: 12 }}>{entry.additionalSources}</Text>
                                        </View>
                                        <View style={{ ...cellBase, width: isDesktop ? '10%' : 100, alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ backgroundColor: badgeColor + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                                                <Text style={{ color: badgeColor, fontSize: 11, fontWeight: 'bold' }}>{badgeLabel}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* ═══ Core Bookshelf Table ═══ */}
            {activeTab === 'bookshelf' && (
                <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor: border, overflow: 'hidden' }}>
                    <View style={{ padding: 20, borderBottomWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="book" size={20} color="#10b981" />
                        <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold' }}>Core Bookshelf — 30 Books</Text>
                        <View style={{ backgroundColor: '#10b98120', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>Your Physical Stack</Text>
                        </View>
                    </View>

                    {BOOK_LIST.map((group) => (
                        <View key={group.category}>
                            {/* Category Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderBottomWidth: 1, borderColor: border }}>
                                <Ionicons name={group.icon as any} size={16} color={group.color} style={{ marginRight: 8 }} />
                                <Text style={{ color: group.color, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>{group.category}</Text>
                                <View style={{ backgroundColor: group.color + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, marginLeft: 8 }}>
                                    <Text style={{ color: group.color, fontSize: 10, fontWeight: 'bold' }}>{group.books.length}</Text>
                                </View>
                            </View>
                            {/* Book Rows */}
                            {group.books.map((book, bIdx) => {
                                const isEven = bIdx % 2 === 0;
                                const rowBg = isEven ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)') : 'transparent';
                                return (
                                    <View key={book.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: isDark ? '#1f2937' : '#f3f4f6', backgroundColor: rowBg }}>
                                        <View style={{ width: 36, height: 28, borderRadius: 6, backgroundColor: group.color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                            <Text style={{ color: group.color, fontSize: 12, fontWeight: 'bold' }}>{book.id}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20 }}>{book.title}</Text>
                                            <Text style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>{book.purpose}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
