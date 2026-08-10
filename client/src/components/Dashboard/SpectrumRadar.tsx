import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const DIMENSION_COLORS: Record<string, string> = {
    S: '#f43f5e', P: '#8b5cf6', E: '#f59e0b', C: '#ec4899',
    T: '#06b6d4', R: '#3b82f6', U: '#10b981', M: '#6366f1',
};

const DIMENSION_NAMES: Record<string, string> = {
    S: 'Society', P: 'Polity', E: 'Economy', C: 'Culture',
    T: 'Tech & Science', R: 'Int\'l Relations', U: 'Env & Geo', M: 'Ethics',
};

interface SpectrumDim {
    dimension: string;
    letter: string;
    total: number;
    completed: number;
    percentage: number;
}

export default function SpectrumRadar() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [spectrum, setSpectrum] = useState<SpectrumDim[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        api.get('/daily-plan/spectrum-stats')
            .then(res => setSpectrum(res.data.spectrum || []))
            .catch(err => console.error('Spectrum stats error:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#8b5cf6" />
            </View>
        );
    }

    const weakDimensions = spectrum.filter(d => d.percentage < 30 && d.total > 0);
    const overallCompleted = spectrum.reduce((sum, d) => sum + d.completed, 0);
    const overallTotal = spectrum.reduce((sum, d) => sum + d.total, 0);
    const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

    return (
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            {/* Header */}
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 20 }}>🌈</Text>
                    <View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 15 }}>SPECTRUM Progress</Text>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>S·P·E·C·T·R·U·M dimensions</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 14 }}>{overallPct}%</Text>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
                </View>
            </TouchableOpacity>

            {/* SPECTRUM Letter Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: expanded ? 16 : 0 }}>
                {spectrum.map(dim => (
                    <View key={dim.letter} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{
                            width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: dim.percentage > 0 ? `${DIMENSION_COLORS[dim.letter]}20` : (isDark ? '#374151' : '#f3f4f6'),
                            borderWidth: 2, borderColor: dim.percentage > 50 ? DIMENSION_COLORS[dim.letter] : 'transparent'
                        }}>
                            <Text style={{ color: DIMENSION_COLORS[dim.letter], fontWeight: 'bold', fontSize: 14 }}>{dim.letter}</Text>
                        </View>
                        <Text style={{ color: dim.percentage > 50 ? DIMENSION_COLORS[dim.letter] : (isDark ? '#6b7280' : '#9ca3af'), fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>{dim.percentage}%</Text>
                    </View>
                ))}
            </View>

            {/* Expanded: Dimension Details */}
            {expanded && (
                <View>
                    {spectrum.map(dim => (
                        <View key={dim.letter} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${DIMENSION_COLORS[dim.letter]}20`, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: DIMENSION_COLORS[dim.letter], fontWeight: 'bold', fontSize: 12 }}>{dim.letter}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, fontWeight: '600' }}>{DIMENSION_NAMES[dim.letter]}</Text>
                                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>{dim.completed}/{dim.total}</Text>
                                </View>
                                {/* Progress Bar */}
                                <View style={{ height: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                                    <View style={{ height: 6, width: `${dim.percentage}%`, backgroundColor: DIMENSION_COLORS[dim.letter], borderRadius: 3 }} />
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Weak Dimensions Alert */}
                    {weakDimensions.length > 0 && (
                        <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Ionicons name="warning" size={14} color="#ef4444" />
                                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>Weak Dimensions ({weakDimensions.length})</Text>
                            </View>
                            <Text style={{ color: isDark ? '#fca5a5' : '#dc2626', fontSize: 11, lineHeight: 16 }}>
                                {weakDimensions.map(d => `${DIMENSION_NAMES[d.letter]} (${d.percentage}%)`).join(', ')} — these need focused attention.
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
