import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { playCompletionSound } from '../src/services/sound';

const CATEGORY_COLORS: Record<string, string> = {
  Study: '#3b82f6',
  Revision: '#f59e0b',
  'Answer Writing': '#10b981',
  'Current Affairs': '#8b5cf6',
  Break: '#6b7280',
  'Mock Test': '#ef4444',
  'PYQ Practice': '#f97316',
  'KMS Development': '#06b6d4',
  'Value Addition': '#ec4899',
  'Daily Review': '#14b8a6',
  'Morning Routine': '#a78bfa',
  'Health & Planning': '#22d3ee',
  'Sleep': '#475569',
};

const CATEGORY_ICONS: Record<string, string> = {
  Study: 'book',
  Revision: 'refresh',
  'Answer Writing': 'pencil',
  'Current Affairs': 'newspaper',
  Break: 'cafe',
  'Mock Test': 'document-text',
  'PYQ Practice': 'help-circle',
  'KMS Development': 'construct',
  'Value Addition': 'diamond',
  'Daily Review': 'clipboard',
  'Morning Routine': 'sunny',
  'Health & Planning': 'fitness',
  'Sleep': 'moon',
};

// 8-Day Subject Rotation
const ROTATION_SCHEDULE = [
  { morning: 'Sociology Paper I', day: 'GS-I', pyqs: 'GS-I + Sociology', writing: '1 GS-I + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-II', pyqs: 'GS-II + Sociology', writing: '1 GS-II + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-III', pyqs: 'GS-III + Sociology', writing: '1 GS-III + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-IV', pyqs: 'GS-IV + Sociology', writing: '2 Ethics Case Studies + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-I', pyqs: 'GS-I + Sociology', writing: '1 GS-I + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-II', pyqs: 'GS-II + Sociology', writing: '1 GS-II + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-III', pyqs: 'GS-III + Sociology', writing: '1 GS-III + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-IV', pyqs: 'GS-IV + Sociology', writing: '2 Ethics Case Studies + 1 Sociology Paper-II' },
];

export default function Planner() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const [slots, setSlots] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Today's Mission state
  const [todayMission, setTodayMission] = useState<any>(null);
  const [missionLoading, setMissionLoading] = useState(true);
  const [studyStats, setStudyStats] = useState<any>(null);

  // Determine which day in the 8-day rotation we are on
  const getRotationDay = () => {
    // Reference date: July 28, 2026
    const startYear = 2026;
    const startMonth = 6; // July is 6 (0-indexed)
    const startDateNum = 28;
    
    // Get current local date in Asia/Kolkata timezone
    const now = new Date();
    const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcOffset + (3600000 * 5.5));
    
    const start = new Date(startYear, startMonth, startDateNum);
    const todayLocal = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    
    const diffTime = todayLocal.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.abs(diffDays) % 8;
  };

  const rotationIndex = getRotationDay();
  const todayRotation = ROTATION_SCHEDULE[rotationIndex];

  useEffect(() => {
    fetchData();
    fetchTodayMission();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, progressRes, checklistRes, weeklyRes] = await Promise.all([
        api.get('/timetable').catch(() => ({ data: [] })),
        api.get('/timetable/progress').catch(() => ({ data: {} })),
        api.get('/timetable/checklist').catch(() => ({ data: [] })),
        api.get('/timetable/weekly').catch(() => ({ data: [] })),
      ]);
      setSlots(slotsRes.data || []);
      setProgress(progressRes.data || {});
      setChecklistItems(checklistRes.data || []);
      setWeeklySchedule(weeklyRes.data || []);
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMission = async () => {
    setMissionLoading(true);
    try {
      const [planRes, statsRes] = await Promise.all([
        api.get('/daily-plan/today'),
        api.get('/daily-plan/stats').catch(() => ({ data: null })),
      ]);
      setTodayMission(planRes.data);
      setStudyStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching daily plan:', error);
    } finally {
      setMissionLoading(false);
    }
  };

  const formatCompletionTime = (dateInput: string | Date | undefined) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Checked today at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      return `Checked on ${dateStr} at ${timeStr}`;
    }
  };

  const handleToggleMissionTopic = async (topicId: string) => {
    try {
      const res = await api.patch(`/daily-plan/toggle-topic/${topicId}`);
      await playCompletionSound();
      // Update the mission state locally
      setTodayMission((prev: any) => {
        if (!prev) return prev;
        const updateList = (list: any[]) => list.map((t: any) => 
          t._id === topicId ? { ...t, completed: res.data.completed, status: res.data.status, completedAt: res.data.completedAt } : t
        );
        return {
          ...prev,
          gsTopicIds: updateList(prev.gsTopicIds || []),
          optTopicIds: updateList(prev.optTopicIds || []),
          revisionTopicId: prev.revisionTopicId?._id === topicId 
            ? { ...prev.revisionTopicId, completed: res.data.completed, status: res.data.status, completedAt: res.data.completedAt }
            : prev.revisionTopicId
        };
      });
    } catch (error) {
      console.error('Error toggling mission topic:', error);
    }
  };

  const toggleSlot = async (slotId: string) => {
    try {
      const nextVal = !progress[slotId];
      setProgress(prev => ({ ...prev, [slotId]: nextVal }));
      if (nextVal) {
        await playCompletionSound();
      }
      await api.post(`/timetable/progress/${slotId}`);
    } catch (error) {
      console.error('Error toggling progress:', error);
      setProgress(prev => ({ ...prev, [slotId]: !prev[slotId] }));
    }
  };

  const toggleChecklistItem = async (itemId: string) => {
    try {
      const nextVal = !progress[itemId];
      setProgress(prev => ({ ...prev, [itemId]: nextVal }));
      if (nextVal) {
        await playCompletionSound();
      }
      await api.post(`/timetable/checklist/progress/${itemId}`);
    } catch (error) {
      console.error('Error toggling checklist item progress:', error);
      setProgress(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    }
  };

  const completedCount = slots.filter(s => progress[s._id]).length;
  const studyBlocks = slots.filter(s => s.isStudyBlock);
  const completedStudy = studyBlocks.filter(s => progress[s._id]).length;

  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currentDayOfWeek = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  // Separate daily targets and end-of-day checklist items
  const dailyTargets = checklistItems.filter(item => item.category === 'daily_target');
  const eodChecklist = checklistItems.filter(item => item.category === 'end_of_day');

  const getDynamicActivity = (slot: any) => {
    if (slot.session === 'Study Session – I') {
      return `Sociology Optional: ${todayRotation.morning}`;
    }
    if (slot.session === 'Study Session – II') {
      return `GS Study: ${todayRotation.day}`;
    }
    if (slot.session === 'Study Session – III') {
      return `Continue ${todayRotation.day} + Notes & Diagrams`;
    }
    if (slot.category === 'PYQ Practice') {
      return `PYQ Focus: ${todayRotation.pyqs}`;
    }
    if (slot.category === 'Answer Writing') {
      return `Write: ${todayRotation.writing}`;
    }
    return slot.activity;
  };

  const getSlotRoute = (slot: any) => {
    const activity = getDynamicActivity(slot).toLowerCase();
    const category = slot.category;

    if (activity.includes('sociology')) return '/gs/Sociology';
    if (activity.includes('gs-i') || activity.includes('gs-1')) return '/gs/GS I';
    if (activity.includes('gs-ii') || activity.includes('gs-2')) return '/gs/GS II';
    if (activity.includes('gs-iii') || activity.includes('gs-3')) return '/gs/GS III';
    if (activity.includes('gs-iv') || activity.includes('gs-4') || activity.includes('ethics')) return '/gs/GS IV';
    
    if (category === 'Current Affairs') return '/current-affairs';
    if (category === 'PYQ Practice') return '/pyqs';
    if (category === 'Answer Writing') return '/answers';
    if (category === 'Revision') return '/revision';
    
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>UPSC CSE 2027</Text>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Master Planner</Text>
            </View>
          </View>
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
            <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{completedCount}/{slots.length} Done</Text>
          </View>
        </View>

        {/* Today Info + Rotation */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 16 }}>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginBottom: 8 }}>{todayDate}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>Day {rotationIndex + 1}/8 Rotation</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' }}>
              <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '600' }}>AM: {todayRotation.morning}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>GS: {todayRotation.day}</Text>
            </View>
          </View>
        </View>

        {/* Study Progress Bar */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>Study Blocks Progress</Text>
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{completedStudy}/{studyBlocks.length} completed</Text>
          </View>
          <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${studyBlocks.length > 0 ? (completedStudy / studyBlocks.length) * 100 : 0}%`, backgroundColor: '#3b82f6', borderRadius: 4 }} />
          </View>
        </View>

        {/* ===== TODAY'S MISSION 🎯 ===== */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#3b82f6', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, marginRight: 8 }}>🎯</Text>
              <View>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Today's Mission</Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                  {todayMission ? `${todayMission.gsPaper} Day • Rotation ${(todayMission.rotationDay || 0) + 1}/8` : 'Loading...'}
                </Text>
              </View>
            </View>
            {studyStats && studyStats.streak > 0 && (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 14 }}>🔥</Text>
                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 13 }}>{studyStats.streak} Day Streak</Text>
              </View>
            )}
          </View>

          {missionLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
          ) : todayMission ? (
            <View style={{ gap: 12 }}>
              {/* Mission Progress Bar */}
              {(() => {
                const allTopics = [...(todayMission.gsTopicIds || []), ...(todayMission.optTopicIds || []), ...(todayMission.revisionTopicId ? [todayMission.revisionTopicId] : [])];
                const doneCount = allTopics.filter((t: any) => t.completed).length;
                const totalCount = allTopics.length;
                const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
                return (
                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>Mission Progress</Text>
                      <Text style={{ color: pct === 100 ? '#10b981' : '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{doneCount}/{totalCount} Topics Done {pct === 100 ? '✅' : ''}</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: 4 }} />
                    </View>
                  </View>
                );
              })()}

              {/* GS Topics Section */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{todayMission.gsPaper} — General Studies ({(todayMission.gsTopicIds || []).length} Topics)</Text>
                </View>
                {(todayMission.gsTopicIds || []).map((topic: any) => (
                  <TouchableOpacity
                    key={topic._id}
                    onPress={() => handleToggleMissionTopic(topic._id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 6,
                      backgroundColor: topic.completed ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4') : (isDark ? '#111827' : '#f9fafb'),
                      borderWidth: 1, borderColor: topic.completed ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                      opacity: topic.completed ? 0.7 : 1
                    }}
                  >
                    <View style={{
                      width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                      borderColor: topic.completed ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                      backgroundColor: topic.completed ? '#10b981' : 'transparent',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      {topic.completed && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: isDark ? 'white' : '#111827', fontWeight: '600', fontSize: 14,
                        textDecorationLine: topic.completed ? 'line-through' : 'none'
                      }}>{topic.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>{topic.chapter}</Text>
                        {topic.completed && topic.completedAt && (
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '500' }}>• 🕒 {formatCompletionTime(topic.completedAt)}</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); router.push(`/topic/${topic._id}` as any); }}
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>Open Hub →</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sociology Topics Section */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' }} />
                  <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>{todayMission.optionalPaper} — Optional ({(todayMission.optTopicIds || []).length} Topics)</Text>
                </View>
                {(todayMission.optTopicIds || []).map((topic: any) => (
                  <TouchableOpacity
                    key={topic._id}
                    onPress={() => handleToggleMissionTopic(topic._id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 6,
                      backgroundColor: topic.completed ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4') : (isDark ? '#111827' : '#f9fafb'),
                      borderWidth: 1, borderColor: topic.completed ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                      opacity: topic.completed ? 0.7 : 1
                    }}
                  >
                    <View style={{
                      width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                      borderColor: topic.completed ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                      backgroundColor: topic.completed ? '#10b981' : 'transparent',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      {topic.completed && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: isDark ? 'white' : '#111827', fontWeight: '600', fontSize: 14,
                        textDecorationLine: topic.completed ? 'line-through' : 'none'
                      }}>{topic.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>{topic.chapter}</Text>
                        {topic.completed && topic.completedAt && (
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '500' }}>• 🕒 {formatCompletionTime(topic.completedAt)}</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); router.push(`/topic/${topic._id}` as any); }}
                      style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#8b5cf6', fontSize: 11, fontWeight: 'bold' }}>Open Hub →</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Revision Topic */}
              {todayMission.revisionTopicId && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' }} />
                    <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 13 }}>Revision Slot</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleMissionTopic(todayMission.revisionTopicId._id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10,
                      backgroundColor: todayMission.revisionTopicId.completed ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4') : (isDark ? '#111827' : '#f9fafb'),
                      borderWidth: 1, borderColor: todayMission.revisionTopicId.completed ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                      opacity: todayMission.revisionTopicId.completed ? 0.7 : 1
                    }}
                  >
                    <View style={{
                      width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                      borderColor: todayMission.revisionTopicId.completed ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                      backgroundColor: todayMission.revisionTopicId.completed ? '#10b981' : 'transparent',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      {todayMission.revisionTopicId.completed && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: isDark ? 'white' : '#111827', fontWeight: '600', fontSize: 14,
                        textDecorationLine: todayMission.revisionTopicId.completed ? 'line-through' : 'none'
                      }}>{todayMission.revisionTopicId.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>{todayMission.revisionTopicId.paper} • {todayMission.revisionTopicId.chapter}</Text>
                        {todayMission.revisionTopicId.completed && todayMission.revisionTopicId.completedAt && (
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '500' }}>• 🕒 {formatCompletionTime(todayMission.revisionTopicId.completedAt)}</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); router.push(`/topic/${todayMission.revisionTopicId._id}` as any); }}
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>Revise →</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              )}

              {/* Study Pace Stats */}
              {studyStats && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Completed</Text>
                    <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 14 }}>{studyStats.completedTopics}/{studyStats.totalTopics}</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Remaining</Text>
                    <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 14 }}>{studyStats.remainingTopics}</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Est. Days Left</Text>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 14 }}>{studyStats.estimatedDays}</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Coverage</Text>
                    <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 14 }}>{studyStats.completionPercent}%</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', marginVertical: 16 }}>Could not load today's mission. Please try again.</Text>
          )}
        </View>

        {/* Daily Timetable Section Header */}

        {/* Timetable Slots */}
        {slots.map((slot, index) => {
          const color = CATEGORY_COLORS[slot.category] || '#6b7280';
          const icon = CATEGORY_ICONS[slot.category] || 'time';
          const isDone = progress[slot._id] || false;
          const isBreak = slot.category === 'Break' || slot.category === 'Sleep';

          return (
            <TouchableOpacity
              key={slot._id}
              onPress={() => toggleSlot(slot._id)}
              activeOpacity={0.7}
              style={{
                marginBottom: 10,
                padding: 14,
                borderRadius: 14,
                backgroundColor: isDark 
                  ? (isDone ? 'rgba(17, 24, 39, 0.8)' : '#1f2937')
                  : (isDone ? '#f9fafb' : '#ffffff'),
                borderWidth: 1,
                borderColor: isDone ? (isDark ? '#1f4620' : '#bbf7d0') : (isDark ? '#374151' : '#e5e7eb'),
                opacity: isDone ? 0.65 : 1,
                ...(isBreak && !isDone ? { borderStyle: 'dashed' as any } : {}),
              }}
            >
              {/* Top Row: Time, Duration, Checkbox */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                  <View style={{ 
                    width: 10, height: 10, borderRadius: 5, 
                    backgroundColor: isDone ? '#10b981' : color,
                    marginRight: 8
                  }} />
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', marginRight: 6 }}>
                    {slot.time}
                  </Text>
                  <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>
                    ({slot.duration})
                  </Text>
                </View>

                {/* Checkbox */}
                <View style={{ 
                  width: 24, height: 24, borderRadius: 6, borderWidth: 2, 
                  borderColor: isDone ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'), 
                  backgroundColor: isDone ? '#10b981' : 'transparent', 
                  alignItems: 'center', justifyContent: 'center' 
                }}>
                  {isDone && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </View>

              {/* Title & Category Icon Row */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ 
                  width: 32, height: 32, borderRadius: 8, 
                  backgroundColor: color + '20', 
                  alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2
                }}>
                  <Ionicons name={icon as any} size={16} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 15,
                    textDecorationLine: isDone ? 'line-through' : 'none',
                    lineHeight: 20
                  }}>
                    {getDynamicActivity(slot)}
                  </Text>

                  {slot.objective && !isBreak && (
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 4 }}>
                      🎯 {slot.objective}
                    </Text>
                  )}
                </View>
              </View>

              {/* Badges & Actions Row (Flexible Wrap) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6, paddingLeft: 42 }}>
                <View style={{ backgroundColor: color + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ color: color, fontSize: 11, fontWeight: '600' }}>{slot.session}</Text>
                </View>

                {getSlotRoute(slot) && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      const route = getSlotRoute(slot);
                      if (route) router.push(route as any);
                    }}
                    style={{ backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text style={{ color: color, fontSize: 11, fontWeight: 'bold' }}>Study Module</Text>
                    <Ionicons name="arrow-forward-circle" size={12} color={color} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                )}

                {/* Focus Timer Button */}
                {!isBreak && slot.isStudyBlock && !isDone && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: '/',
                        params: {
                          focusSlotId: slot._id,
                          focusActivity: getDynamicActivity(slot),
                          focusDuration: slot.duration,
                          focusCategory: slot.category
                        }
                      });
                    }}
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  >
                    <Ionicons name="stopwatch-outline" size={12} color="#10b981" />
                    <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                      Start Focus
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Daily Targets Card (Interactive) */}
        {dailyTargets.length > 0 && (
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="flag" size={18} color="#f59e0b" />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Daily Targets</Text>
            </View>
            {dailyTargets.map((target) => {
              const isChecked = progress[target._id] || false;
              return (
                <TouchableOpacity 
                  key={target._id} 
                  onPress={() => toggleChecklistItem(target._id)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, opacity: isChecked ? 0.6 : 1 }}
                >
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{target.icon}</Text>
                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 13, flex: 1, textDecorationLine: isChecked ? 'line-through' : 'none' }}>{target.label}</Text>
                  <View style={{ 
                    width: 20, height: 20, borderRadius: 4, borderWidth: 2, 
                    borderColor: isChecked ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'), 
                    backgroundColor: isChecked ? '#10b981' : 'transparent', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Weekly Special Schedule Card */}
        {weeklySchedule.length > 0 && (
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="calendar" size={18} color="#3b82f6" />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Weekly Special Tasks</Text>
            </View>
            {weeklySchedule.map((item) => {
              const isToday = currentDayOfWeek.toLowerCase().includes(item.day.split(' ')[0].toLowerCase());
              return (
                <View 
                  key={item._id} 
                  style={{ 
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10,
                    borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#f3f4f6',
                    backgroundColor: isToday ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
                    paddingHorizontal: isToday ? 8 : 0, borderRadius: 8
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: isToday ? '#3b82f6' : (isDark ? 'white' : '#111827'), fontSize: 13, fontWeight: '600' }}>
                      {item.day} {isToday && '(Today)'}
                    </Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>{item.task}</Text>
                  </View>
                  <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 'bold' }}>{item.duration}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* End-of-Day Checklist Card (Interactive) */}
        {eodChecklist.length > 0 && (
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="checkbox" size={18} color="#10b981" />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>End-of-Day Checklist</Text>
            </View>
            {eodChecklist.map((item) => {
              const isChecked = progress[item._id] || false;
              return (
                <TouchableOpacity 
                  key={item._id} 
                  onPress={() => toggleChecklistItem(item._id)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, opacity: isChecked ? 0.6 : 1 }}
                >
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{item.icon}</Text>
                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 13, flex: 1, textDecorationLine: isChecked ? 'line-through' : 'none' }}>{item.label}</Text>
                  <View style={{ 
                    width: 20, height: 20, borderRadius: 4, borderWidth: 2, 
                    borderColor: isChecked ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'), 
                    backgroundColor: isChecked ? '#10b981' : 'transparent', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Rotation Info Card */}
        <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="sync" size={18} color="#8b5cf6" />
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Today's Rotation (Day {rotationIndex + 1})</Text>
          </View>
          {[
            { label: 'Morning Session', value: todayRotation.morning, color: '#8b5cf6' },
            { label: 'GS Session', value: todayRotation.day, color: '#3b82f6' },
            { label: 'PYQ Focus', value: todayRotation.pyqs, color: '#f97316' },
            { label: 'Answer Writing', value: todayRotation.writing, color: '#10b981' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: isDark ? '#374151' : '#f3f4f6' }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, fontWeight: '500' }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 13, fontWeight: 'bold' }}>{item.value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
