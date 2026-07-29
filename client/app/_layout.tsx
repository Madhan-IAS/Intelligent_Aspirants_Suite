import "../global.css";
import { Slot } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Sidebar from '../src/components/Sidebar';
import MobileNavigation from '../src/components/MobileNavigation';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { registerForPushNotificationsAsync } from '../src/services/notifications';
import { useEffect } from 'react';

function AppContent() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== 'web' || width < 768;

  useEffect(() => {
    registerForPushNotificationsAsync();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = "IAS — Intelligent Aspirant's Suite";
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
      {/* Sidebar for Desktop Web */}
      {!isMobile && (
        <View style={{ width: 256, borderRightWidth: 1, borderRightColor: isDark ? '#1f2937' : '#e5e7eb' }}>
          <Sidebar />
        </View>
      )}

      {/* Main Content Area */}
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        {/* Top Header Navigation Bar for Mobile */}
        {isMobile && (
          <MobileNavigation />
        )}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});
