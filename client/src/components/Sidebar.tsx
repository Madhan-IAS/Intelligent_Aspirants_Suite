import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import CommandPalette from './CommandPalette';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { scheduleLocalNotification } from '../services/notifications';

interface SidebarProps {
  onNavigate?: () => void;
}

const SidebarItem = ({ icon, label, href, onNavigate }: { icon: any, label: string, href: string, onNavigate?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <TouchableOpacity
      onPress={() => {
        if (onNavigate) onNavigate();
        router.push(href as any);
      }}
      style={{
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 4,
        backgroundColor: isActive ? '#3b82f6' : 'transparent'
      }}
    >
      <Ionicons name={icon} size={20} color={isActive ? 'white' : isDark ? '#9ca3af' : '#6b7280'} />
      <Text style={{ marginLeft: 12, fontWeight: '500', color: isActive ? 'white' : isDark ? '#9ca3af' : '#374151' }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = mode === 'dark';

  const handleGlobalReminder = () => {
    if (Platform.OS === 'web') {
      const input = window.prompt("Enter minutes until reminder (e.g., 0.25 for 15s, 60 for 1h):", "0.25");
      if (input && !isNaN(parseFloat(input))) {
        const seconds = parseFloat(input) * 60;
        window.alert(`Daily study reminder scheduled for ${seconds} seconds from now (Web Simulation).`);
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              setTimeout(() => new Notification("Study Time!", { body: "Your dynamic study session is scheduled to start." }), seconds * 1000);
            }
          });
        }
      }
    } else {
      Alert.alert(
        "Set Study Reminder",
        "When would you like to be reminded?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "15 Seconds (Test)", onPress: () => {
              scheduleLocalNotification("Study Time!", "Your study session is starting!", 15);
              Alert.alert("Success", "Reminder set for 15 seconds.");
            }
          },
          {
            text: "1 Hour", onPress: () => {
              scheduleLocalNotification("Study Time!", "Time to hit the books!", 3600);
              Alert.alert("Success", "Reminder set for 1 hour from now.");
            }
          },
          {
            text: "4 Hours", onPress: () => {
              scheduleLocalNotification("Study Time!", "Your deep work session begins now.", 14400);
              Alert.alert("Success", "Reminder set for 4 hours from now.");
            }
          }
        ]
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#ffffff', padding: 16 }}>
      <CommandPalette visible={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Logo Area */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 0, marginTop: 8 }}>
        <Image
          source={require('../../assets/ias_logo.png')}
          style={{ width: 56, height: 56, marginRight: -6 }}
          resizeMode="contain"
        />
        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 28, fontWeight: 'bold' }}>IAS</Text>
      </View>

      {/* Global Search Button */}
      <TouchableOpacity
        onPress={() => setSearchOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 16, backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
      >
        <Ionicons name="search" size={20} color="#9ca3af" />
        <Text style={{ marginLeft: 12, fontWeight: '500', color: '#9ca3af', flex: 1 }}>Search everything...</Text>
        <View style={{ backgroundColor: isDark ? '#374151' : '#d1d5db', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }}>⌘K</Text>
        </View>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 8 }}>Main</Text>
          <SidebarItem icon="home" label="Dashboard" href="/" onNavigate={onNavigate} />
          <SidebarItem icon="person" label="Profile" href="/profile" onNavigate={onNavigate} />
          <SidebarItem icon="calendar" label="Daily Planner" href="/planner" onNavigate={onNavigate} />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 8 }}>General Studies</Text>
          <SidebarItem icon="library" label="GS I" href="/gs/GS I" onNavigate={onNavigate} />
          <SidebarItem icon="document-text" label="GS II" href="/gs/GS II" onNavigate={onNavigate} />
          <SidebarItem icon="trending-up" label="GS III" href="/gs/GS III" onNavigate={onNavigate} />
          <SidebarItem icon="heart" label="GS IV (Ethics)" href="/gs/GS IV" onNavigate={onNavigate} />
          <SidebarItem icon="calculator" label="CSAT (Paper II)" href="/csat" onNavigate={onNavigate} />
          <SidebarItem icon="git-network" label="Mind Maps" href="/mind-maps" onNavigate={onNavigate} />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 8 }}>Optionals & CA</Text>
          <SidebarItem icon="people" label="Sociology" href="/gs/Sociology" onNavigate={onNavigate} />
          <SidebarItem icon="newspaper" label="Current Affairs" href="/current-affairs" onNavigate={onNavigate} />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 8 }}>Practice</Text>
          <SidebarItem icon="time" label="3-5-7 Revision" href="/revision" onNavigate={onNavigate} />
          <SidebarItem icon="flask" label="Daily Quiz (AI)" href="/quiz" onNavigate={onNavigate} />
          <SidebarItem icon="create" label="Answer Writing" href="/answers" onNavigate={onNavigate} />
          <SidebarItem icon="search" label="PYQs" href="/pyqs" onNavigate={onNavigate} />
          <SidebarItem icon="ribbon" label="Directives & Quotes" href="/directives-quotes" onNavigate={onNavigate} />
          <SidebarItem icon="pencil" label="Essay Lab" href="/essays" onNavigate={onNavigate} />
        </View>
      </ScrollView>

      {/* Global Study Reminder Button */}
      <TouchableOpacity
        onPress={handleGlobalReminder}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', borderWidth: 1, borderColor: isDark ? '#8b5cf6' : '#c4b5fd', marginTop: 16 }}
      >
        <Ionicons name="notifications" size={20} color="#8b5cf6" />
        <Text style={{ marginLeft: 12, fontWeight: 'bold', color: isDark ? '#c4b5fd' : '#7c3aed' }}>Set Daily Reminder</Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginTop: 8 }}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={isDark ? '#fbbf24' : '#6366f1'} />
        <Text style={{ marginLeft: 12, fontWeight: '500', color: isDark ? '#d1d5db' : '#374151' }}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      {user && (
        <TouchableOpacity
          onPress={async () => {
            if (onNavigate) onNavigate();
            await logout();
          }}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', borderWidth: 1, borderColor: isDark ? '#ef4444' : '#fca5a5', marginTop: 8 }}
        >
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={{ marginLeft: 12, fontWeight: 'bold', color: '#ef4444' }}>Log Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
