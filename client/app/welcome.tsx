import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

const ASPIRANT_PHASES = [
  {
    icon: 'school',
    title: 'UPSC CSE',
    subtitle: 'Building Unbreakable Discipline & The LBSNAA Dream',
    badge: 'STAGE 1: FOUNDATION'
  },
  {
    icon: 'book',
    title: 'GS I-IV, CSAT & Optional Integration',
    subtitle: '1000+ Topic Micro-Trackers & Daily Answer Writing',
    badge: 'STAGE 2: STRATEGY & SYLLABUS'
  },
  {
    icon: 'refresh-circle',
    title: 'Scientific 3-5-7 Spaced Repetition',
    subtitle: 'Automated Flashcards, Active Recall & Memory Engine',
    badge: 'STAGE 3: REVISION ENGINE'
  },
  {
    icon: 'stats-chart',
    title: 'Intelligent Daily Planner & Analytics',
    subtitle: 'Optimizing Study Hours & Real-Time Performance Heatmaps',
    badge: 'STAGE 4: PEAK PERFORMANCE'
  }
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { mode } = useTheme();
  const { user } = useAuth();
  const isDark = mode === 'dark';

  const [phaseIndex, setPhaseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Initial Screen Fade In
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // 2. Pulse Animation for Emblem Logo (Slower, elegant 1.6s pulse)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

    // 3. 10-Second Linear Progress Bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 4. Smooth Phase Text Rotations (every 2.5 seconds: at 2.5s, 5.0s, and 7.5s)
    const timer1 = setTimeout(() => {
      animateTextChange(1);
    }, 2500);

    const timer2 = setTimeout(() => {
      animateTextChange(2);
    }, 5000);

    const timer3 = setTimeout(() => {
      animateTextChange(3);
    }, 7500);

    // 5. Final Redirect after 10.0 seconds
    const timerFinal = setTimeout(() => {
      handleNext();
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFinal);
    };
  }, []);

  const animateTextChange = (nextIndex: number) => {
    Animated.timing(textFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setPhaseIndex(nextIndex);
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleNext = () => {
    if (user) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  };

  const currentPhase = ASPIRANT_PHASES[phaseIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0b0f17' : '#ffffff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 24,
      }}
    >
      {/* Top Bar: Skip Button */}
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', marginRight: 4 }}>
            Skip to Login
          </Text>
          <Ionicons name="arrow-forward" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      {/* Main Center Content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        {/* Pulsing Emblem Container */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            width: 210,
            height: 210,
            borderRadius: 48,
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 26,
            elevation: 14,
            borderWidth: 1,
            borderColor: 'rgba(37, 99, 235, 0.18)',
            marginBottom: 36,
          }}
        >
          <Image
            source={require('../assets/ias_logo.png')}
            style={{ width: 160, height: 160, resizeMode: 'contain' }}
          />
        </Animated.View>

        {/* Suite Title */}
        <Text
          style={{
            color: isDark ? '#ffffff' : '#111827',
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 0.5,
            marginBottom: 20,
          }}
        >
          IAS — Intelligent Aspirant's Suite
        </Text>

        {/* Dynamic Aspirant Work & Progress Phase Carousel */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', minHeight: 95, paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 12,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name={currentPhase.icon as any} size={14} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={{ color: '#2563eb', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>
              {currentPhase.badge}
            </Text>
          </View>

          <Text style={{ color: isDark ? '#f3f4f6' : '#1f2937', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            {currentPhase.title}
          </Text>

          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
            {currentPhase.subtitle}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom Bar: 10-Second Progress Indicator */}
      <View style={{ width: '85%', alignItems: 'center' }}>
        <View style={{ width: '100%', height: 5, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View
            style={{
              width: progressWidth,
              height: '100%',
              backgroundColor: '#2563eb',
              borderRadius: 3
            }}
          />
        </View>
        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: '500' }}>
          Preparing Aspirant Workspace...
        </Text>
      </View>
    </View>
  );
}
