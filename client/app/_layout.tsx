import "../global.css";
import { Slot, usePathname, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import Sidebar from '../src/components/Sidebar';
import MobileNavigation from '../src/components/MobileNavigation';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { registerForPushNotificationsAsync } from '../src/services/notifications';
import FeatureGate from '../src/components/FeatureGate';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

function AppContent() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== 'web' || width < 768;
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/welcome' || pathname === '/register' || pathname === '/subscription' || pathname === '/pending-approval' || pathname === '/admin' || pathname === '/onboarding';

  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = "IAS — Intelligent Aspirant's Suite";
    }

    const trackAnonymousVisit = async () => {
      try {
        const lastVisit = await AsyncStorage.getItem('ias_last_visit');
        const now = Date.now();
        if (!lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000) {
          await api.post('/admin/track-visit');
          await AsyncStorage.setItem('ias_last_visit', now.toString());
        }
      } catch (e) {
        // Fail silently
      }
    };
    trackAnonymousVisit();

    // Delay redirect logic to let Expo Router finish mounting its route tree
    const timer = setTimeout(() => setRouterReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && routerReady && !welcomeCompleted) {
      setWelcomeCompleted(true);
      if (user) {
        // Onboarding gate — only for brand-new users who have never completed setup
        // Existing users (onboardingComplete === undefined) are NOT affected
        if (user.onboardingComplete === false && pathname !== '/onboarding' && user.role !== 'admin') {
          router.replace('/onboarding');
        } else {
          // Subscription-based routing
          const subStatus = user.subscriptionStatus || 'pending';
          if (subStatus === 'pending' && pathname !== '/subscription' && user.role !== 'admin') {
            router.replace('/subscription');
          } else if (subStatus === 'pending_review' && pathname !== '/pending-approval' && user.role !== 'admin') {
            router.replace('/pending-approval');
          } else if (subStatus === 'rejected' && pathname !== '/subscription' && user.role !== 'admin') {
            router.replace('/subscription');
          } else if (subStatus === 'expired' && pathname !== '/subscription' && user.role !== 'admin') {
            router.replace('/subscription');
          } else if (pathname === '/welcome' || pathname === '/login' || pathname === '/register') {
            router.replace('/');
          }
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
          <ErrorBoundary>
            <ToastProvider>
              <FeatureGate><Slot /></FeatureGate>
            </ToastProvider>
          </ErrorBoundary>
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
