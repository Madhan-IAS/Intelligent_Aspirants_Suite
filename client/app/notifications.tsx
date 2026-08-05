import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, StatusBar, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';

interface NotificationItem {
  _id: string;
  type: 'current_affairs' | 'revision_due' | 'system' | 'achievement';
  title: string;
  message: string;
  metadata?: {
    source?: string;
    articleCount?: number;
    tags?: string[];
  };
  read: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  current_affairs: { icon: 'newspaper', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  revision_due: { icon: 'refresh', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  system: { icon: 'settings', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  achievement: { icon: 'trophy', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleTapNotification = (notification: NotificationItem) => {
    if (!notification.read) handleMarkAsRead(notification._id);
    if (notification.type === 'current_affairs') {
      router.push('/current-affairs');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications by date
  const groupByDate = (items: NotificationItem[]) => {
    const groups: { [key: string]: NotificationItem[] } = {};
    items.forEach(n => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  };

  const grouped = groupByDate(notifications);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 80 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor="#3b82f6" />}
      >
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Notifications</Text>
              {unreadCount > 0 && (
                <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 16 }}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <View style={{ width: 80, height: 80, backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Ionicons name="notifications-off-outline" size={40} color={isDark ? '#6b7280' : '#9ca3af'} />
            </View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>You're all caught up!</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
              Notifications will appear here when new Current Affairs articles are scraped daily at 6:00 AM IST.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {Object.keys(grouped).map(dateKey => (
              <View key={dateKey}>
                {/* Date Group Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{dateKey}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#374151' : '#e5e7eb', marginLeft: 12 }} />
                </View>

                {/* Notification Cards */}
                <View style={{ gap: 10 }}>
                  {grouped[dateKey].map(notification => {
                    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
                    return (
                      <TouchableOpacity 
                        key={notification._id}
                        onPress={() => handleTapNotification(notification)}
                        style={{
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          borderRadius: 14,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: !notification.read ? config.color : (isDark ? '#374151' : '#e5e7eb'),
                          borderLeftWidth: !notification.read ? 4 : 1,
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: 14
                        }}
                      >
                        {/* Icon */}
                        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: config.bgColor, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          <Ionicons name={config.icon as any} size={20} color={config.color} />
                        </View>

                        {/* Content */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: notification.read ? '500' : 'bold', flex: 1, paddingRight: 8 }}>
                              {notification.title}
                            </Text>
                            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}>{formatTimeAgo(notification.createdAt)}</Text>
                          </View>

                          {notification.message && (
                            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, lineHeight: 18, marginBottom: 8 }}>
                              {notification.message}
                            </Text>
                          )}

                          {/* Tags */}
                          {notification.metadata?.tags && notification.metadata.tags.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                              {notification.metadata.tags.slice(0, 5).map((tag, idx) => (
                                <View key={idx} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 10, fontWeight: '600' }}>{tag}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Source + Action Row */}
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {notification.metadata?.source && (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="link" size={12} color={config.color} />
                                <Text style={{ color: config.color, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{notification.metadata.source}</Text>
                              </View>
                            )}
                            <TouchableOpacity onPress={() => handleDelete(notification._id)} style={{ padding: 4 }}>
                              <Ionicons name="trash-outline" size={14} color={isDark ? '#6b7280' : '#9ca3af'} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Unread Dot */}
                        {!notification.read && (
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color, position: 'absolute', top: 8, right: 8 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
