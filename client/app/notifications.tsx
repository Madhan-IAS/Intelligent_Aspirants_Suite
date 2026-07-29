import React from 'react';
import { View, Text, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';

export default function NotificationsPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Notifications Center</Text>
        </View>

        {/* Empty State / Placeholder */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
          <View style={{ width: 80, height: 80, backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Ionicons name="notifications-off-outline" size={40} color={isDark ? '#6b7280' : '#9ca3af'} />
          </View>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>You're all caught up!</Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
            No new alerts or system notifications at this time. Go crush your targets!
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
