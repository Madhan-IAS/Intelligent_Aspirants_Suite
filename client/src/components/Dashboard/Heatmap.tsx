import React, { useState, useEffect } from 'react';
import { View, Text, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Heatmap = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [data, setData] = useState<Record<string, number>>({});
  const [hourlyData, setHourlyData] = useState<number[]>(Array(24).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/focus/heatmap');
        const map: Record<string, number> = {};
        res.data.heatmap.forEach((item: any) => {
          map[item.date] = item.count; // count is now total focus minutes
        });
        setData(map);
        setHourlyData(res.data.hourlyData || Array(24).fill(0));
      } catch (err) {
        console.error('Failed to fetch focus heatmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  const generateGrid = () => {
    const grid = [];
    const today = new Date();

    for (let col = 0; col < 14; col++) {
      const week = [];
      for (let row = 0; row < 7; row++) {
        const daysAgo = (13 - col) * 7 + (6 - row);
        const d = new Date();
        d.setDate(today.getDate() - daysAgo);
        const dateStr = d.toISOString().split('T')[0];

        const focusMins = data[dateStr] || 0;

        let color = isDark ? '#374151' : '#e5e7eb';
        if (focusMins >= 120) color = '#16a34a'; // > 2 hours deep work
        else if (focusMins >= 60) color = '#22c55e'; // > 1 hour
        else if (focusMins >= 25) color = '#86efac'; // > 25 mins Focus

        week.push(
          <View
            key={`${col}-${row}`}
            style={{
              width: 14, height: 14,
              backgroundColor: color,
              borderRadius: 3, margin: 2
            }}
          />
        );
      }
      grid.push(<View key={col} style={{ flexDirection: 'column' }}>{week}</View>);
    }
    return grid;
  };

  const renderHourlyChart = () => {
    const maxVal = Math.max(...hourlyData, 1);
    return (
      <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>🕒 Focus Time by Hour</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, justifyContent: 'space-between' }}>
          {hourlyData.map((val, i) => {
            const height = (val / maxVal) * 80;
            return (
              <View key={i} style={{ alignItems: 'center', width: '3%' }}>
                <View style={{ width: '100%', height: height || 2, backgroundColor: val > 0 ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb'), borderRadius: 2 }} />
                {i % 4 === 0 && <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 8, marginTop: 4, width: 20, textAlign: 'center' }}>{i}h</Text>}
              </View>
            )
          })}
        </View>
      </View>
    )
  };

  if (loading) return <ActivityIndicator size="small" color="#22c55e" />;

  return (
    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Focus Sessions consistency</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
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
        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, marginLeft: 4 }}>More (120m+)</Text>
      </View>

      {renderHourlyChart()}
    </View>
  );
};

export default Heatmap;
