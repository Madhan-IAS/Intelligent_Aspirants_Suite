import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

const ASPIRANT_PHASES = [
  // --- Original Foundation Stages ---
  {
    icon: 'school',
    title: 'UPSC CSE — Your Journey Begins',
    subtitle: 'Building Unbreakable Discipline & The LBSNAA Dream',
    badge: 'STAGE 1: FOUNDATION'
  },
  {
    icon: 'book',
    title: 'GS I-IV, CSAT & Optional Integration',
    subtitle: '3,385+ Topic Micro-Trackers & Daily Answer Writing',
    badge: 'STAGE 2: STRATEGY & SYLLABUS'
  },
  // --- New Feature-Specific Stages ---
  {
    icon: 'rocket',
    title: "Today's Mission Engine",
    subtitle: '23 Daily Subtopics • Auto-Scheduled Across GS I-IV & Sociology',
    badge: '🎯 DAILY TARGETS'
  },
  {
    icon: 'calculator',
    title: 'CSAT Speed Drills & Formulas',
    subtitle: 'Quantitative Aptitude • Logical Reasoning • Reading Comprehension',
    badge: '🧮 CSAT PAPER II'
  },
  {
    icon: 'create',
    title: 'Mains Answer Writing Lab',
    subtitle: 'Daily Practice • 250 Words • Topic-Linked from Mission',
    badge: '✍️ ANSWER PRACTICE'
  },
  {
    icon: 'library',
    title: '360° Knowledge Hub & Notes',
    subtitle: 'Theory • PYQs • MCQs • Case Studies • Mind Maps • Revision Notes',
    badge: '📝 KNOWLEDGE ENGINE'
  },
  {
    icon: 'refresh-circle',
    title: 'Scientific 3-5-7 Spaced Repetition',
    subtitle: 'Automated Flashcards • Active Recall • Memory Retention Engine',
    badge: '🔄 REVISION ENGINE'
  },
  {
    icon: 'calendar',
    title: 'Intelligent Daily Planner & Analytics',
    subtitle: '8-Day GS Rotation • Study Blocks • Real-Time Performance Heatmaps',
    badge: '📊 SMART PLANNER'
  },
  {
    icon: 'newspaper',
    title: 'Live Current Affairs Feed',
    subtitle: 'The Hindu • PIB • Indian Express • RBI etc .... — Auto-Scraped Daily ',
    badge: '📰 CURRENT AFFAIRS'
  },
  {
    icon: 'trophy',
    title: 'The LBSNAA Dream Awaits',
    subtitle: '100% Syllabus Coverage',
    badge: '🏛️ PEAK PERFORMANCE'
  }
];

const TICKER_ITEMS = [
  '📝 3,385+ Subtopics',
  '✍️ Daily Answer Writing',
  '🧮 35 CSAT Drills',
  '📰 4 News Sources',
  '🔄 3-5-7 Revision',
  '📊 Heatmap Analytics',
  '🎯 23 Topics/Day',
  '📚 GS I-IV + Sociology',
  '⚡ Formula Cheatsheets',
  '🏛️ PYQ Database',
];

const FLOATING_ICONS = ['📚', '✍️', '🧮', '📊', '🔄', '📰', '🎯', '⚡'];

export default function WelcomeScreen() {
  const router = useRouter();
  const { mode } = useTheme();
  const { user } = useAuth();
  const isDark = mode === 'dark';

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');

  // Core animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  // New animations
  const ringAnim = useRef(new Animated.Value(0)).current;
  const badgeSlideAnim = useRef(new Animated.Value(-60)).current;
  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const tickerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;

  // Floating icon animations (8 icons)
  const floatAnims = useRef(FLOATING_ICONS.map(() => ({
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }))).current;

  // Stat counter animations
  const statAnim1 = useRef(new Animated.Value(0)).current;
  const statAnim2 = useRef(new Animated.Value(0)).current;
  const statAnim3 = useRef(new Animated.Value(0)).current;
  const [statVal1, setStatVal1] = useState(0);
  const [statVal2, setStatVal2] = useState(0);
  const [statVal3, setStatVal3] = useState(0);

  useEffect(() => {
    // 1. Screen fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // 1b. Badge and Title spring entrance on mount to avoid layout overlap
    Animated.parallel([
      Animated.spring(badgeSlideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }),
      Animated.spring(titleSlideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }),
    ]).start();

    // 2. Emblem pulse
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

    // 3. Glow pulse around emblem
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.15,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

    // 4. Progress bar (28 seconds for 10 phases — slow & steady)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 28000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 5. Ring progress around emblem
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 28000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 6. Floating icons - staggered entrance
    floatAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.timing(anim.opacity, {
          toValue: 0.25,
          duration: 600,
          useNativeDriver: false,
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.y, {
              toValue: -10 - (i % 3) * 3,
              duration: 3000 + i * 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(anim.y, {
              toValue: 10 + (i % 3) * 3,
              duration: 3000 + i * 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            })
          ])
        ).start();
      }, i * 300);
    });

    // 7. Ticker scroll animation (looping)
    Animated.loop(
      Animated.timing(tickerAnim, {
        toValue: -1200,
        duration: 28000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // 8. Stat counter animations (slow count up over ~3-4 seconds)
    const statInterval1 = setInterval(() => {
      setStatVal1(prev => {
        if (prev >= 3385) { clearInterval(statInterval1); return 3385; }
        return prev + Math.ceil((3385 - prev) / 25);
      });
    }, 120);

    const statInterval2 = setInterval(() => {
      setStatVal2(prev => {
        if (prev >= 35) { clearInterval(statInterval2); return 35; }
        return prev + 1;
      });
    }, 200);

    const statInterval3 = setInterval(() => {
      setStatVal3(prev => {
        if (prev >= 23) { clearInterval(statInterval3); return 23; }
        return prev + 1;
      });
    }, 250);

    // 9. Phase rotations (every 2.8s for 10 phases = 28s total — slow & elegant)
    const phaseTimers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < ASPIRANT_PHASES.length; i++) {
      phaseTimers.push(setTimeout(() => animateTextChange(i), i * 2800));
    }

    // 10. Final redirect after 29 seconds
    const timerFinal = setTimeout(() => {
      handleNext();
    }, 29000);

    return () => {
      phaseTimers.forEach(clearTimeout);
      clearTimeout(timerFinal);
      clearInterval(statInterval1);
      clearInterval(statInterval2);
      clearInterval(statInterval3);
    };
  }, []);

  // Typewriter effect for subtitle
  useEffect(() => {
    const fullText = ASPIRANT_PHASES[phaseIndex].subtitle;
    setTypewriterText('');
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setTypewriterText(fullText.substring(0, charIndex));
      if (charIndex >= fullText.length) {
        clearInterval(typeInterval);
      }
    }, 40);
    return () => clearInterval(typeInterval);
  }, [phaseIndex]);

  const animateTextChange = (nextIndex: number) => {
    // Fade out + slide badge out
    Animated.parallel([
      Animated.timing(textFadeAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      Animated.timing(badgeSlideAnim, { toValue: -60, duration: 400, useNativeDriver: false }),
      Animated.timing(titleSlideAnim, { toValue: 30, duration: 400, useNativeDriver: false }),
    ]).start(() => {
      setPhaseIndex(nextIndex);
      // Fade in + slide badge in with gentle spring
      Animated.parallel([
        Animated.timing(textFadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.spring(badgeSlideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }),
        Animated.spring(titleSlideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }),
      ]).start();
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

  const ringProgress = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Floating icon positions (scattered around the emblem)
  const iconPositions = [
    { top: '8%', left: '8%' },
    { top: '5%', right: '12%' },
    { top: '22%', left: '3%' },
    { top: '18%', right: '5%' },
    { bottom: '38%', left: '6%' },
    { bottom: '42%', right: '8%' },
    { bottom: '28%', left: '15%' },
    { bottom: '32%', right: '14%' },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0b0f17' : '#ffffff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
        overflow: 'hidden',
      }}
    >
      {/* Floating Background Icons */}
      {FLOATING_ICONS.map((emoji, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: 22,
            opacity: floatAnims[i].opacity,
            transform: [{ translateY: floatAnims[i].y }],
            ...iconPositions[i],
            zIndex: 0,
          } as any}
        >
          {emoji}
        </Animated.Text>
      ))}

      {/* Top Bar: Skip Button */}
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', zIndex: 10 }}>
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
            Skip
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
          width: '100%',
          zIndex: 5,
        }}
      >
        {/* Animated Ring + Emblem Container */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          {/* Outer Glow Ring */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 230,
              height: 230,
              borderRadius: 52,
              borderWidth: 3,
              borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.15)',
              opacity: glowAnim,
            }}
          />

          {/* Progress Ring Track */}
          <View
            style={{
              position: 'absolute',
              width: 224,
              height: 224,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: isDark ? '#1f2937' : '#e5e7eb',
            }}
          />

          {/* Pulsing Emblem */}
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
              shadowOpacity: 0.25,
              shadowRadius: 30,
              elevation: 16,
              borderWidth: 1,
              borderColor: 'rgba(37, 99, 235, 0.18)',
            }}
          >
            <Image
              source={require('../assets/ias_logo.png')}
              style={{ width: 150, height: 150, resizeMode: 'contain' }}
            />
          </Animated.View>
        </View>

        {/* Suite Title */}
        <Text
          style={{
            color: isDark ? '#ffffff' : '#111827',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          IAS — Intelligent Aspirant's Suite
        </Text>
        <Text
          style={{
            color: isDark ? '#4b5563' : '#9ca3af',
            fontSize: 11,
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: '600',
            marginBottom: 20,
          }}
        >
          YOUR COMPLETE UPSC PREPARATION SYSTEM
        </Text>

        {/* Animated Stat Counters Row */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
            <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: 'bold' }}>{statVal1.toLocaleString()}+</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>Subtopics</Text>
          </View>
          <View style={{ alignItems: 'center', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#f5f3ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
            <Text style={{ color: '#8b5cf6', fontSize: 18, fontWeight: 'bold' }}>{statVal2}</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>CSAT Drills</Text>
          </View>
          <View style={{ alignItems: 'center', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
            <Text style={{ color: '#10b981', fontSize: 18, fontWeight: 'bold' }}>{statVal3}/Day</Text>
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>Daily Target</Text>
          </View>
        </View>

        {/* Dynamic Phase Carousel with Staggered Animations */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', minHeight: 90, paddingHorizontal: 16 }}>
          {/* Badge with slide-in animation */}
          <Animated.View
            style={{
              transform: [{ translateX: badgeSlideAnim }],
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 12,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name={currentPhase.icon as any} size={14} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={{ color: '#2563eb', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>
              {currentPhase.badge}
            </Text>
          </Animated.View>

          {/* Title with slide-up spring */}
          <Animated.Text
            style={{
              transform: [{ translateY: titleSlideAnim }],
              color: isDark ? '#f3f4f6' : '#1f2937',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {currentPhase.title}
          </Animated.Text>

          {/* Typewriter subtitle */}
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, textAlign: 'center', lineHeight: 17, minHeight: 36 }}>
            {typewriterText}
            <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>|</Text>
          </Text>
        </Animated.View>

        {/* Phase Progress Dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {ASPIRANT_PHASES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === phaseIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === phaseIndex ? '#3b82f6' : (i < phaseIndex ? '#10b981' : (isDark ? '#374151' : '#d1d5db')),
                transition: 'all 0.3s',
              } as any}
            />
          ))}
        </View>
      </Animated.View>

      {/* Bottom Section: Ticker + Progress */}
      <View style={{ width: '100%', alignItems: 'center', zIndex: 10 }}>
        {/* Scrolling Feature Ticker */}
        <View style={{ width: '100%', overflow: 'hidden', marginBottom: 12, height: 28 }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              transform: [{ translateX: tickerAnim }],
              alignItems: 'center',
              gap: 24,
            }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <Text
                key={idx}
                style={{
                  color: isDark ? '#4b5563' : '#9ca3af',
                  fontSize: 11,
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                } as any}
              >
                {item}
              </Text>
            ))}
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <View style={{ width: '85%', marginBottom: 6 }}>
          <View style={{ width: '100%', height: 5, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <Animated.View
              style={{
                width: progressWidth,
                height: '100%',
                backgroundColor: '#2563eb',
                borderRadius: 3
              }}
            />
          </View>
        </View>

        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 10, fontWeight: '500' }}>
          Preparing Aspirant Workspace — Stage {phaseIndex + 1} of {ASPIRANT_PHASES.length}
        </Text>
      </View>
    </View>
  );
}
