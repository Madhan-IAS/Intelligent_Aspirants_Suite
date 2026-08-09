import "../global.css";
import { Slot, usePathname, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import Sidebar from '../src/components/Sidebar';
import MobileNavigation from '../src/components/MobileNavigation';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { registerForPushNotificationsAsync } from '../src/services/notifications';
import { useEffect, useState } from 'react';

function AppContent() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== 'web' || width < 768;
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/welcome' || pathname === '/register';

  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = "IAS — Intelligent Aspirant's Suite";
    }
    // Delay redirect logic to let Expo Router finish mounting its route tree
    const timer = setTimeout(() => setRouterReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && routerReady && !welcomeCompleted) {
      setWelcomeCompleted(true);
      if (user) {
        if (pathname === '/welcome' || pathname === '/login' || pathname === '/register') {
          router.replace('/');
        }
      } else {
        if (pathname !== '/welcome' && pathname !== '/login' && pathname !== '/register') {
          router.replace('/welcome');
        }
      }
    }
  }, [loading, user, routerReady]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Hide navigation bar completely on Welcome and Login pages or when logged out
  if (isAuthPage || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#ffffff' }}>
        <Slot />
      </View>
    );
  }

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
