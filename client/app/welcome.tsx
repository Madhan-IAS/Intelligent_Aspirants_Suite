import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

const ASPIRANT_PHASES = [
  {
    icon: 'school',
    title: 'UPSC CSE 2027',
    subtitle: 'The Dedicated Journey to LBSNAA Begins',
    badge: 'STAGE 1: FOUNDATION'
  },
  {
    icon: 'book',
    title: 'GS I-IV & Optional Mastery',
    subtitle: '1000+ Structured Topics, PYQs & Answer Evaluation',
    badge: 'STAGE 2: STRATEGY'
  },
  {
    icon: 'timer',
    title: 'Smart 3-5-7 Revisions',
    subtitle: 'Deep Work Analytics & Intelligent Daily Planner',
    badge: 'STAGE 3: EXECUTION'
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
    // 1. Initial Fade In
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // 2. Pulse Animation for Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

    // 3. 5-Second Progress Bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 4. Phase Text Rotations (at 1.7s and 3.4s)
    const timer1 = setTimeout(() => {
      animateTextChange(1);
    }, 1700);

    const timer2 = setTimeout(() => {
      animateTextChange(2);
    }, 3400);

    // 5. Final Redirect after 5.0 seconds
    const timerFinal = setTimeout(() => {
      if (user) {
        router.replace('/');
      } else {
        router.replace('/login');
      }
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timerFinal);
    };
  }, [user]);

  const handleNext = () => {
    if (user) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  };

  const animateTextChange = (nextIndex: number) => {
    Animated.timing(textFadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setPhaseIndex(nextIndex);
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleSkip = () => {
    router.replace('/login');
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
          onPress={handleSkip}
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
        {/* Pulsing Logo Container */}
        <Animated.View 
          style={{
            transform: [{ scale: pulseAnim }],
            width: 200,
            height: 200,
            borderRadius: 44,
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(37, 99, 235, 0.15)',
            marginBottom: 36,
          }}
        >
          <Image 
            source={require('../assets/ias_logo.png')} 
            style={{ width: 155, height: 155, resizeMode: 'contain' }}
          />
        </Animated.View>

        {/* Title */}
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

        {/* Dynamic Aspirant Work & Progress Phase */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', minHeight: 90, paddingHorizontal: 12 }}>
          <View 
            style={{ 
              backgroundColor: 'rgba(37, 99, 235, 0.12)', 
              paddingHorizontal: 12, 
              paddingVertical: 4, 
              borderRadius: 12, 
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name={currentPhase.icon as any} size={13} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={{ color: '#2563eb', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>
              {currentPhase.badge}
            </Text>
          </View>

          <Text style={{ color: isDark ? '#f3f4f6' : '#1f2937', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            {currentPhase.title}
          </Text>

          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, textAlign: 'center' }}>
            {currentPhase.subtitle}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom Bar: 5-Second Progress Indicator */}
      <View style={{ width: '85%', alignItems: 'center' }}>
        <View style={{ width: '100%', height: 4, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <Animated.View 
            style={{ 
              width: progressWidth, 
              height: '100%', 
              backgroundColor: '#2563eb',
              borderRadius: 2 
            }} 
          />
        </View>
        <Text style={{ color: isDark ? '#4b5563' : '#9ca3af', fontSize: 11 }}>
          Initializing Aspirant Environment...
        </Text>
      </View>
    </View>
  );
}
