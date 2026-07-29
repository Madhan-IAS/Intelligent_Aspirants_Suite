import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ProgressCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export default function ProgressCard({ title, value, subtitle, icon, color }: ProgressCardProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const iconColorMap = {
    blue: '#60a5fa',
    green: '#4ade80',
    orange: '#fb923c',
    purple: '#c084fc',
  };

  const bgColors = {
    blue: 'rgba(59, 130, 246, 0.2)',
    green: 'rgba(34, 197, 94, 0.2)',
    orange: 'rgba(249, 115, 22, 0.2)',
    purple: 'rgba(168, 85, 247, 0.2)',
  };

  return (
    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, flex: 1, minWidth: 150, margin: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>{title}</Text>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: bgColors[color] }}>
          <Ionicons name={icon} size={20} color={iconColorMap[color]} />
        </View>
      </View>
      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 30, fontWeight: 'bold', marginBottom: 4 }}>{value}</Text>
      <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>{subtitle}</Text>
    </View>
  );
}
