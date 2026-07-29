import React, { useState, useEffect } from 'react';
import { View, Text, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Heatmap = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/analytics/heatmap');
        const map: Record<string, number> = {};
        res.data.forEach((item: any) => {
          map[item.date] = item.count;
        });
        setData(map);
      } catch (err) {
        console.error('Failed to fetch heatmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  // Generate last 14 weeks (98 days) for a compact UI
  const generateGrid = () => {
    const grid = [];
    const today = new Date();
    
    // We want 14 columns of 7 days.
    for (let col = 0; col < 14; col++) {
      const week = [];
      for (let row = 0; row < 7; row++) {
        // Calculate days ago
        const daysAgo = (13 - col) * 7 + (6 - row);
        const d = new Date();
        d.setDate(today.getDate() - daysAgo);
        const dateStr = d.toISOString().split('T')[0];
        
        const count = data[dateStr] || 0;
        
        let color = isDark ? '#374151' : '#e5e7eb'; // 0
        if (count >= 5) color = '#16a34a'; // High activity
        else if (count >= 3) color = '#22c55e'; // Medium
        else if (count >= 1) color = '#86efac'; // Low

        week.push(
          <View 
            key={`${col}-${row}`} 
            style={{ 
              width: 14, 
              height: 14, 
              backgroundColor: color, 
              borderRadius: 3,
              margin: 2
            }}
          />
        );
      }
      grid.push(<View key={col} style={{ flexDirection: 'column' }}>{week}</View>);
    }
    return grid;
  };

  if (loading) return <ActivityIndicator size="small" color="#22c55e" />;

  return (
    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Consistency Streak</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {/* Day Labels */}
          <View style={{ flexDirection: 'column', marginRight: 8, justifyContent: 'space-around', height: 126 }}>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }}>Mon</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }}>Wed</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }}>Fri</Text>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            {generateGrid()}
          </View>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12, gap: 4 }}>
        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, marginRight: 4 }}>Less</Text>
        <View style={{ width: 10, height: 10, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 2 }} />
        <View style={{ width: 10, height: 10, backgroundColor: '#86efac', borderRadius: 2 }} />
        <View style={{ width: 10, height: 10, backgroundColor: '#22c55e', borderRadius: 2 }} />
        <View style={{ width: 10, height: 10, backgroundColor: '#16a34a', borderRadius: 2 }} />
        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, marginLeft: 4 }}>More</Text>
      </View>
    </View>
  );
};

export default Heatmap;
