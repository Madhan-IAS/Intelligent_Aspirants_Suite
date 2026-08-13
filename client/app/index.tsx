import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import PomodoroTimer from '../src/components/Dashboard/PomodoroTimer';
import NightOwlTimer from '../src/components/Dashboard/NightOwlTimer';
import SpectrumRadar from '../src/components/Dashboard/SpectrumRadar';
import Heatmap from '../src/components/Dashboard/Heatmap';

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { focusSlotId, focusActivity, focusDuration, focusCategory } = params;

  const [quote, setQuote] = useState({ text: 'Consistency is the key to mastering the Civil Services Examination.', author: 'UPSC Aspirant Mantra' });
  const [stats, setStats] = useState({
    topics: 0,
    totalTopics: 0,
    pyqs: 0,
    revisions: 0,
    currentAffairs: 0,
    answers: 0
  });
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [recentTopics, setRecentTopics] = useState<any[]>([]);
  const [pendingRevisions, setPendingRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [dashMission, setDashMission] = useState<any>(null);
  const [studyStats, setStudyStats] = useState<any>(null);
  const [isMissionCollapsed, setIsMissionCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/(auth)/login');
      return;
    }
    if (user) {
      fetchDashboardData();
      fetchRandomQuote();
      fetchUnreadCount();
      fetchDashMission();
    }
  }, [user, authLoading]);

  const fetchDashMission = async () => {
    try {
      const [planRes, statsRes] = await Promise.all([
        api.get('/daily-plan/today'),
        api.get('/daily-plan/stats').catch(() => ({ data: null }))
      ]);
      setDashMission(planRes.data);
      setStudyStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard mission:', error);
    }
  };

  const handleToggleMissionTopic = async (topicId: string) => {
    try {
      const res = await api.patch(`/daily-plan/toggle-topic/${topicId}`);
      setDashMission((prev: any) => {
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
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling mission topic from dashboard:', error);
    }
  };

  const formatCompletionTime = (dateInput: string | Date | undefined) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Checked today at ${timeStr}` : `Checked on ${date.toLocaleDateString([], { day: 'numeric', month: 'short' })} at ${timeStr}`;
  };

  const fetchRandomQuote = async () => {
    try {
      const res = await api.get('/quotes');
      if (res.data && res.data.length > 0) {
        const random = res.data[Math.floor(Math.random() * res.data.length)];
        setQuote({ text: random.text, author: random.author || 'UPSC Wisdom' });
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [gs1Res, gs2Res, gs3Res, gs4Res, socioRes, csatRes, pyqsRes, revisionsRes, caRes, answersRes, recentTopicsRes] = await Promise.all([
        api.get('/topics/subject/GS I').catch(() => ({ data: [] })),
        api.get('/topics/subject/GS II').catch(() => ({ data: [] })),
        api.get(`/topics/subject/${encodeURIComponent('GS III')}`).catch(() => ({ data: [] })),
        api.get('/topics/subject/GS IV').catch(() => ({ data: [] })),
        api.get('/topics/subject/Sociology').catch(() => ({ data: [] })),
        api.get('/topics/subject/CSAT').catch(() => ({ data: [] })),
        api.get('/pyqs').catch(() => ({ data: [] })),
        api.get('/revisions/pending').catch(() => ({ data: [] })),
        api.get('/current-affairs').catch(() => ({ data: [] })),
        api.get('/answers').catch(() => ({ data: [] })),
        api.get('/topics/recent').catch(() => ({ data: [] }))
      ]);

      const subjects = [
        { name: 'GS I', data: gs1Res.data, color: '#3b82f6' },
        { name: 'GS II', data: gs2Res.data, color: '#10b981' },
        { name: 'GS III', data: gs3Res.data, color: '#f59e0b' },
        { name: 'GS IV', data: gs4Res.data, color: '#ec4899' },
        { name: 'Sociology', data: socioRes.data, color: '#8b5cf6' },
        { name: 'CSAT', data: csatRes.data, color: '#06b6d4' }
      ];

      const prog = subjects.map(s => ({
        name: s.name,
        total: s.data.length,
        completed: s.data.filter((t: any) => t.completed || t.status === 'Completed').length,
        color: s.color
      }));
      setSubjectProgress(prog);

      const allTopics = [...gs1Res.data, ...gs2Res.data, ...gs3Res.data, ...gs4Res.data, ...socioRes.data, ...csatRes.data];
      const completedCount = allTopics.filter((t: any) => t.completed || t.status === 'Completed').length;

      setStats({
        topics: completedCount,
        totalTopics: allTopics.length,
        pyqs: pyqsRes.data.length,
        revisions: revisionsRes.data.length,
        currentAffairs: caRes.data.length,
        answers: answersRes.data?.length || 0
      });

      setRecentTopics(recentTopicsRes.data || []);
      setPendingRevisions(revisionsRes.data || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadNotifications(res.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const { mode } = useTheme();
  const isDark = mode === 'dark';

  if (authLoading || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 16 }}>Loading your workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const overallPct = stats.totalTopics > 0 ? ((stats.topics / stats.totalTopics) * 100).toFixed(1) : '0.0';

  // Calculate days remaining to Dec 31, 2026 and May 23, 2027
  const now = new Date();
  const dec31 = new Date(2026, 11, 31);
  const prelimsDate = new Date(2027, 4, 23);
  const dec31Days = Math.max(0, Math.ceil((dec31.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const prelimsDays = Math.max(0, Math.ceil((prelimsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 18, fontWeight: '500', marginBottom: 4 }}>{getGreeting()}</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 32, fontWeight: 'bold' }}>{user.name?.split(' ')[0] || 'Aspirant'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Ionicons name="notifications" size={20} color="white" />
              {unreadNotifications > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, backgroundColor: '#ef4444', borderRadius: 9, borderWidth: 2, borderColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                  <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Milestone Countdown Banners */}
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: isDesktop ? 'nowrap' : 'wrap', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59, 130, 246, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>🎯</Text>
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>Dec 31, 2026 Target</Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} numberOfLines={1} adjustsFontSizeToFit>100% Syllabus + 2x Revision</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{dec31Days} Days Left</Text>
            </View>
          </View>

          <View style={{ flex: 1, backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#8b5cf6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: isDesktop ? 'nowrap' : 'wrap', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(139, 92, 246, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>🏛️</Text>
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>UPSC Prelims 2027</Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} numberOfLines={1} adjustsFontSizeToFit>May 23, 2027 Exam Date</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>{prelimsDays} Days Left</Text>
            </View>
          </View>
        </View>

        {/* SECTION 1: TODAY'S MISSION (HERO SECTION) */}
        {dashMission && (
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 18, borderWidth: 2, borderColor: '#3b82f6', marginBottom: 32 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setIsMissionCollapsed(!isMissionCollapsed)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
              >
                <Text style={{ fontSize: 24 }}>🎯</Text>
                <View>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Today's Mission</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                    {dashMission.gsPaper} Day • Rotation {(dashMission.rotationDay || 0) + 1}/8
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {studyStats && studyStats.streak > 0 && (
                  <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>🔥</Text>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 13 }}>{studyStats.streak} Day Streak</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setIsMissionCollapsed(!isMissionCollapsed)}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(55, 65, 81, 0.6)' : '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name={isMissionCollapsed ? "chevron-down" : "chevron-up"} size={20} color={isDark ? 'white' : '#111827'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mission Progress Bar */}
            {(() => {
              const allTopics = [...(dashMission.gsTopicIds || []), ...(dashMission.optTopicIds || []), ...(dashMission.revisionTopicId ? [dashMission.revisionTopicId] : [])];
              const doneCount = allTopics.filter((t: any) => t.completed).length;
              const totalCount = allTopics.length;
              const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
              return (
                <View style={{ marginBottom: isMissionCollapsed ? 0 : 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>Daily Mission Progress</Text>
                    <Text style={{ color: pct === 100 ? '#10b981' : '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{doneCount}/{totalCount} Topics Completed {pct === 100 ? '✅' : ''}</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: 4 }} />
                  </View>
                </View>
              );
            })()}

            {/* Collapsible Topics Body */}
            {!isMissionCollapsed && (
              <View style={{ marginTop: 12 }}>
                {/* GS Topics Section */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{dashMission.gsPaper} — General Studies ({(dashMission.gsTopicIds || []).length} Topics)</Text>
                  </View>
                  {(dashMission.gsTopicIds || []).map((topic: any) => (
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
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); router.push(`/answers?topicId=${topic._id}&topicTitle=${encodeURIComponent(topic.title)}&paper=${encodeURIComponent(dashMission.gsPaper)}` as any); }}
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>Write Answer ✍️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); router.push(`/topic/${topic._id}` as any); }}
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>Open Hub →</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sociology Topics Section */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' }} />
                    <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>{dashMission.optionalPaper} — Optional ({(dashMission.optTopicIds || []).length} Topics)</Text>
                  </View>
                  {(dashMission.optTopicIds || []).map((topic: any) => (
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
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); router.push(`/answers?topicId=${topic._id}&topicTitle=${encodeURIComponent(topic.title)}&paper=${encodeURIComponent(dashMission.optionalPaper)}` as any); }}
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>Write Answer ✍️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); router.push(`/topic/${topic._id}` as any); }}
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ color: '#8b5cf6', fontSize: 11, fontWeight: 'bold' }}>Open Hub →</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Planner Link */}
                <TouchableOpacity onPress={() => router.push('/planner')} style={{ alignItems: 'flex-end', marginTop: 4 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: 'bold' }}>View Full Schedule & Planner →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* SECTION 2: LIVE STATS CARDS */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.push('/pyqs')} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, flex: 1, minWidth: 140, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500', fontSize: 14 }}>Total PYQs</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="help-circle" size={20} color="#3b82f6" />
              </View>
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 30, fontWeight: 'bold' }}>{stats.pyqs}</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, marginTop: 4 }}>Questions logged</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/revision')} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, flex: 1, minWidth: 140, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500', fontSize: 14 }}>Revisions Due</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(249, 115, 22, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="refresh" size={20} color="#f97316" />
              </View>
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 30, fontWeight: 'bold' }}>{stats.revisions}</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, marginTop: 4 }}>3-5-7 System</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/gs/GS I' as any)} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, flex: 1, minWidth: 140, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500', fontSize: 14 }}>Syllabus Covered</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="book" size={20} color="#10b981" />
              </View>
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>{stats.topics} / {stats.totalTopics}</Text>
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600', marginTop: 4 }}>{overallPct}% Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/current-affairs')} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, flex: 1, minWidth: 140, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500', fontSize: 14 }}>Current Affairs</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139, 92, 246, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="newspaper" size={20} color="#8b5cf6" />
              </View>
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 30, fontWeight: 'bold' }}>{stats.currentAffairs}</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, marginTop: 4 }}>Articles logged</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: DEEP WORK TIMER & HEATMAP */}
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24, marginBottom: 32 }}>
          <View style={{ flex: isDesktop ? 1 : undefined, width: '100%' }}>
            <SpectrumRadar />
            <NightOwlTimer />
            <PomodoroTimer
              activeSlot={focusSlotId ? {
                _id: focusSlotId as string,
                activity: (focusActivity as string) || '',
                duration: (focusDuration as string) || '50 min',
                category: (focusCategory as string) || 'Study',
                session: 'Planner Session'
              } : null}
              onSlotComplete={async (slotId: string) => {
                try {
                  await api.post(`/timetable/progress/${slotId}`);
                  fetchDashboardData();
                  router.setParams({
                    focusSlotId: undefined,
                    focusActivity: undefined,
                    focusDuration: undefined,
                    focusCategory: undefined
                  });
                } catch (err) {
                  console.error('Error ticking timetable slot from Dashboard timer:', err);
                }
              }}
              onSlotDismiss={() => {
                router.setParams({
                  focusSlotId: undefined,
                  focusActivity: undefined,
                  focusDuration: undefined,
                  focusCategory: undefined
                });
              }}
            />
          </View>
          <View style={{ flex: isDesktop ? 1 : undefined, width: '100%' }}>
            <Heatmap />
          </View>
        </View>

        {/* SECTION 4: QUICK ACTIONS & RECENT ACTIVITY */}
        <View style={{ gap: 24, marginBottom: 32 }}>

          {/* Quick Actions */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity onPress={() => router.push('/current-affairs')} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="newspaper" size={18} color="#3b82f6" />
                <Text style={{ color: '#3b82f6', marginLeft: 8, fontWeight: '500' }}>Log Current Affairs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/answers')} style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.5)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pencil" size={18} color="#10b981" />
                <Text style={{ color: '#10b981', marginLeft: 8, fontWeight: '500' }}>Write Answer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/pyqs')} style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.5)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add-circle" size={18} color="#a855f7" />
                <Text style={{ color: '#a855f7', marginLeft: 8, fontWeight: '500' }}>Add PYQ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/revision')} style={{ backgroundColor: 'rgba(234, 88, 12, 0.2)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.5)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="refresh" size={18} color="#f97316" />
                <Text style={{ color: '#f97316', marginLeft: 8, fontWeight: '500' }}>Start Revision</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Topics + Pending Revisions */}
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24 }}>
            {/* Recent Topics */}
            <View style={{ flex: isDesktop ? 1 : undefined, width: '100%', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Recent Topics</Text>
                <TouchableOpacity onPress={() => router.push('/gs/GS I' as any)}>
                  <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>View All →</Text>
                </TouchableOpacity>
              </View>
              {recentTopics.length === 0 ? (
                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>No recent topics found. Complete a topic to see it here!</Text>
              ) : (
                recentTopics.map((topic: any) => (
                  <TouchableOpacity
                    key={topic._id}
                    onPress={() => router.push(`/topic/${topic._id}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : '#f3f4f6', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 12, backgroundColor: topic.completed ? '#10b981' : topic.status === 'In Progress' ? '#3b82f6' : '#6b7280' }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: '500' }}>{topic.title}</Text>
                      <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>
                        {topic.paper || 'GS'} • {topic.completed && topic.completedAt ? formatCompletionTime(topic.completedAt) : topic.status}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Pending Revisions */}
            <View style={{ flex: isDesktop ? 1 : undefined, width: '100%', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Pending Revisions</Text>
                <TouchableOpacity onPress={() => router.push('/revision')}>
                  <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500' }}>View All →</Text>
                </TouchableOpacity>
              </View>
              {pendingRevisions.length === 0 ? (
                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>No pending revisions due today. You're all caught up! 🎉</Text>
              ) : (
                pendingRevisions.map((rev: any) => (
                  <TouchableOpacity
                    key={rev._id}
                    onPress={() => rev.topicId?._id && router.push(`/topic/${rev.topicId._id}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : '#f3f4f6', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(249, 115, 22, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name="time" size={16} color="#f97316" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: '500', textDecorationLine: 'underline' }}>{rev.topicId?.title || 'Topic Revision'}</Text>
                      <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12 }}>Due: {new Date(rev.scheduledDate || rev.nextDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* Syllabus Completion Breakdown */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Syllabus Completion Breakdown</Text>

            {/* Master Overall Progress Bar */}
            <View style={{ marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 15 }}>Master Mastery Progress</Text>
                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 14 }}>
                  {stats.topics} / {stats.totalTopics} Topics ({overallPct}%)
                </Text>
              </View>
              <View style={{ height: 10, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${stats.totalTopics > 0 ? (stats.topics / stats.totalTopics) * 100 : 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 5 }} />
              </View>
            </View>

            <View style={{ gap: 16 }}>
              {subjectProgress.map(subj => {
                const pct = subj.total > 0 ? Math.round((subj.completed / subj.total) * 100) : 0;
                return (
                  <View key={subj.name}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937', fontWeight: '600', fontSize: 14 }}>{subj.name}</Text>
                      <Text style={{ color: subj.color, fontWeight: 'bold', fontSize: 13 }}>
                        {subj.completed}/{subj.total} topics ({pct}%)
                      </Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: subj.color, borderRadius: 4 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Dynamic Motivational Quote */}
          <View style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#eff6ff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : '#bfdbfe' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name="chatbubble-outline" size={24} color="#3b82f6" />
              <TouchableOpacity onPress={fetchRandomQuote} style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                <Ionicons name="refresh" size={16} color="#3b82f6" />
                <Text style={{ color: '#3b82f6', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>Refresh Quote</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: '500', fontStyle: 'italic', lineHeight: 24, marginTop: 12, marginBottom: 12 }}>
              "{quote.text}"
            </Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 14, fontWeight: 'bold', textAlign: 'right' }}>— {quote.author}</Text>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
