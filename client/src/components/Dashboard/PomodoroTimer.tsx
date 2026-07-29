import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { scheduleLocalNotification } from '../../services/notifications';

interface ActiveSlot {
  _id: string;
  activity: string;
  duration: string;
  category: string;
  session?: string;
  time?: string;
}

interface PomodoroTimerProps {
  defaultSubject?: string;
  activeSlot?: ActiveSlot | null;
  onSlotComplete?: (slotId: string) => void;
  onSlotDismiss?: () => void;
  activeTopicId?: string;
  activeTopicName?: string;
  onTopicComplete?: (topicId: string) => void;
}

// 8-Day Rotation Schedule (matches Planner)
const ROTATION_SCHEDULE = [
  { morning: 'Sociology Paper I', day: 'GS-I', pyqs: 'GS-I + Sociology', writing: '1 GS-I + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-II', pyqs: 'GS-II + Sociology', writing: '1 GS-II + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-III', pyqs: 'GS-III + Sociology', writing: '1 GS-III + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-IV', pyqs: 'GS-IV + Sociology', writing: '2 Ethics Case Studies + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-I', pyqs: 'GS-I + Sociology', writing: '1 GS-I + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-II', pyqs: 'GS-II + Sociology', writing: '1 GS-II + 1 Sociology Paper-II' },
  { morning: 'Sociology Paper I', day: 'GS-III', pyqs: 'GS-III + Sociology', writing: '1 GS-III + 1 Sociology Paper-I' },
  { morning: 'Sociology Paper II', day: 'GS-IV', pyqs: 'GS-IV + Sociology', writing: '2 Ethics Case Studies + 1 Sociology Paper-II' },
];

const getRotationDay = () => {
  const startDate = new Date('2026-07-28');
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % 8;
};

const getDynamicActivityName = (slot: any) => {
  const todayRotation = ROTATION_SCHEDULE[getRotationDay()];
  if (slot.session === 'Study Session – I') {
    return `Sociology Optional: ${todayRotation.morning}`;
  }
  if (slot.session === 'Study Session – II') {
    return `GS Study: ${todayRotation.day}`;
  }
  if (slot.session === 'Study Session – III') {
    return `Continue ${todayRotation.day} + Notes & Diagrams`;
  }
  if (slot.category === 'PYQ Practice') {
    return `PYQ Focus: ${todayRotation.pyqs}`;
  }
  if (slot.category === 'Answer Writing') {
    return `Write: ${todayRotation.writing}`;
  }
  return slot.activity;
};

// Parse time range string like "08:40 AM – 11:10 AM" into start/end minutes from midnight
const parseTimeRangeToMinutes = (timeStr: string) => {
  if (!timeStr) return null;
  const parts = timeStr.split(/–|-/);
  if (parts.length < 2) return null;

  const parseSingleTime = (tStr: string) => {
    const cleaned = tStr.trim().toUpperCase();
    const match = cleaned.match(/(\d+):(\d+)\s*(AM|PM)?/);
    if (!match) return 0;
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const period = match[3];

    if (period === 'PM' && hrs < 12) hrs += 12;
    if (period === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  const startMins = parseSingleTime(parts[0]);
  const endMins = parseSingleTime(parts[1]);
  return { startMins, endMins };
};

// Parse "2 hr 30 min", "45 min", "1 hr" etc. into seconds
const parseDuration = (duration: string): number => {
  let totalSeconds = 0;
  const hrMatch = duration.match(/(\d+)\s*hr/i);
  const minMatch = duration.match(/(\d+)\s*min/i);
  if (hrMatch) totalSeconds += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
  return totalSeconds || 50 * 60;
};

const PomodoroTimer = ({ 
  defaultSubject, 
  activeSlot: propActiveSlot, 
  onSlotComplete, 
  onSlotDismiss,
  activeTopicId,
  activeTopicName,
  onTopicComplete
}: PomodoroTimerProps) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const [sessionSeconds, setSessionSeconds] = useState(50 * 60);
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [subject, setSubject] = useState('GS I');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Real-time slot auto-detection
  const [autoSlot, setAutoSlot] = useState<ActiveSlot | null>(null);
  const [slotStatusBadge, setSlotStatusBadge] = useState<string | null>(null);
  const [isLiveNow, setIsLiveNow] = useState(false);

  // Text input states for hours and minutes when editing
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('50');
  
  const subjects = ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology', 'Current Affairs', 'Other'];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Topic focus configuration
  useEffect(() => {
    if (activeTopicId) {
      setSlotStatusBadge('📖 TOPIC FOCUS');
      setIsLiveNow(true);
    }
  }, [activeTopicId]);

  // If activeTopicId is provided, construct a virtual slot representing the topic focus
  const currentBoundSlot = activeTopicId ? {
    _id: `topic-${activeTopicId}`,
    activity: `Topic: ${activeTopicName || 'Syllabus Focus'}`,
    duration: `${Math.ceil(sessionSeconds / 60)} min`,
    category: 'Study',
    isTopic: true
  } as any : (propActiveSlot || autoSlot || (hasStarted ? {
    _id: 'adhoc',
    activity: `${subject} Study Session`,
    duration: `${Math.ceil(sessionSeconds / 60)} min`,
    category: 'Study'
  } as any : null));

  // Real-time timetable clock matching if no propActiveSlot is provided
  useEffect(() => {
    if (propActiveSlot) return; // Prop overrides auto-matching

    const fetchAndMatchTimetable = async () => {
      try {
        const [slotsRes, progressRes] = await Promise.all([
          api.get('/timetable').catch(() => ({ data: [] })),
          api.get('/timetable/progress').catch(() => ({ data: {} })),
        ]);
        const slots: any[] = slotsRes.data || [];
        const progress: Record<string, boolean> = progressRes.data || {};

        if (slots.length === 0) return;

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        let liveMatch: any = null;
        let liveMatchRange: { startMins: number; endMins: number } | null = null;
        let upcomingMatch: any = null;

        for (const slot of slots) {
          if (progress[slot._id]) continue; // Skip completed slots

          const range = parseTimeRangeToMinutes(slot.time);
          if (!range) continue;

          // Check if current time falls within this slot
          if (currentMins >= range.startMins && currentMins < range.endMins) {
            liveMatch = slot;
            liveMatchRange = range;
            break;
          }

          // Track first upcoming uncompleted study block
          if (currentMins < range.startMins && !upcomingMatch && slot.isStudyBlock) {
            upcomingMatch = slot;
          }
        }

        const selectedSlot = liveMatch || upcomingMatch;

        if (selectedSlot) {
          const actName = getDynamicActivityName(selectedSlot);
          const formattedSlot: ActiveSlot = {
            _id: selectedSlot._id,
            activity: actName,
            duration: selectedSlot.duration,
            category: selectedSlot.category,
            session: selectedSlot.session,
            time: selectedSlot.time
          };

          setAutoSlot(formattedSlot);
          setIsLiveNow(!!liveMatch);
          setSlotStatusBadge(liveMatch ? `🔴 LIVE SLOT (${selectedSlot.time})` : `⏳ UP NEXT (${selectedSlot.time})`);

          const totalSlotSecs = parseDuration(selectedSlot.duration);

          if (liveMatch && liveMatchRange) {
            // Calculate EXACT remaining time left until slot end time
            const currentTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const slotEndTotalSecs = liveMatchRange.endMins * 60;
            const remainingSecs = Math.max(1, slotEndTotalSecs - currentTotalSecs);

            setSessionSeconds(totalSlotSecs);
            setSecondsLeft(remainingSecs);

            // AUTO-RUN the timer automatically for Live Slot!
            setHasStarted(true);
            setIsActive(true);
          } else {
            setSessionSeconds(totalSlotSecs);
            setSecondsLeft(totalSlotSecs);
            setHasStarted(false);
            setIsActive(false);
          }

          setInputHours(Math.floor(totalSlotSecs / 3600).toString());
          setInputMinutes(Math.floor((totalSlotSecs % 3600) / 60).toString());

          // Subject mapping
          const cat = selectedSlot.category;
          if (cat === 'Current Affairs') setSubject('Current Affairs');
          else if (actName.toLowerCase().includes('sociology')) setSubject('Sociology');
          else if (actName.toLowerCase().includes('gs-i') || actName.toLowerCase().includes('gs i')) setSubject('GS I');
          else if (actName.toLowerCase().includes('gs-ii') || actName.toLowerCase().includes('gs ii')) setSubject('GS II');
          else if (actName.toLowerCase().includes('gs-iii') || actName.toLowerCase().includes('gs iii')) setSubject('GS III');
          else if (actName.toLowerCase().includes('gs-iv') || actName.toLowerCase().includes('gs iv') || actName.toLowerCase().includes('ethics')) setSubject('GS IV');
        }
      } catch (err) {
        console.error('Timetable clock matching error:', err);
      }
    };

    fetchAndMatchTimetable();
  }, [propActiveSlot]);

  // Keep subject in sync if defaultSubject changes
  useEffect(() => {
    if (defaultSubject && subjects.includes(defaultSubject)) {
      setSubject(defaultSubject);
    }
  }, [defaultSubject]);

  // Auto-configure timer when propActiveSlot is bound from Planner button
  useEffect(() => {
    if (propActiveSlot) {
      const totalSecs = parseDuration(propActiveSlot.duration);
      setSessionSeconds(totalSecs);
      setSecondsLeft(totalSecs);
      setInputHours(Math.floor(totalSecs / 3600).toString());
      setInputMinutes(Math.floor((totalSecs % 3600) / 60).toString());
      setHasStarted(true);
      setIsActive(true);
      setShowCompletionModal(false);
      setSlotStatusBadge('🎯 PLANNER SELECTED');

      // Auto-set subject from slot category
      const cat = propActiveSlot.category;
      if (cat === 'Current Affairs') setSubject('Current Affairs');
      else if (propActiveSlot.activity?.toLowerCase().includes('sociology')) setSubject('Sociology');
      else if (propActiveSlot.activity?.toLowerCase().includes('gs-i') || propActiveSlot.activity?.toLowerCase().includes('gs i')) setSubject('GS I');
      else if (propActiveSlot.activity?.toLowerCase().includes('gs-ii') || propActiveSlot.activity?.toLowerCase().includes('gs ii')) setSubject('GS II');
      else if (propActiveSlot.activity?.toLowerCase().includes('gs-iii') || propActiveSlot.activity?.toLowerCase().includes('gs iii')) setSubject('GS III');
      else if (propActiveSlot.activity?.toLowerCase().includes('gs-iv') || propActiveSlot.activity?.toLowerCase().includes('gs iv') || propActiveSlot.activity?.toLowerCase().includes('ethics')) setSubject('GS IV');
    }
  }, [propActiveSlot]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();

      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setIsActive(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, sessionSeconds]);

  const handleSessionComplete = async () => {
    const displayMins = Math.ceil(sessionSeconds / 60);

    if (Platform.OS === 'web') {
      window.alert(`Focus session complete for ${currentBoundSlot ? currentBoundSlot.activity : subject}! Great job.`);
    } else {
      scheduleLocalNotification("Session Complete!", `Great job! Take a break after ${displayMins} minutes.`, 1);
    }

    // Log to Backend
    try {
      await api.post('/focus', { subject, durationMinutes: displayMins });
    } catch (err) {
      console.error('Failed to log session', err);
    }

    // We always show the completion modal now (since we have the adhoc/topic fallback)
    if (currentBoundSlot) {
      setShowCompletionModal(true);
    } else {
      setSecondsLeft(sessionSeconds);
      setHasStarted(false);
    }
  };

  const handleCompletionYes = async () => {
    if (currentBoundSlot) {
      if (currentBoundSlot.isTopic) {
        const topicId = currentBoundSlot._id.replace('topic-', '');
        if (onTopicComplete) {
          onTopicComplete(topicId);
        } else {
          try {
            await api.patch(`/topics/${topicId}/toggle`);
          } catch (err) {
            console.error('Failed to toggle topic completed status:', err);
          }
        }
      } else if (currentBoundSlot._id === 'adhoc') {
        // Ad-hoc session completed, no slot to tick
      } else if (onSlotComplete) {
        onSlotComplete(currentBoundSlot._id);
      } else {
        try {
          await api.post(`/timetable/progress/${currentBoundSlot._id}`);
        } catch (err) {
          console.error('Failed to auto-tick slot:', err);
        }
      }
    }
    setShowCompletionModal(false);
    setSecondsLeft(sessionSeconds);
    setHasStarted(false);
    setAutoSlot(null);
    if (onSlotDismiss) onSlotDismiss();
  };

  const handleCompletionNo = () => {
    setShowCompletionModal(false);
    setSecondsLeft(sessionSeconds);
    setHasStarted(false);
  };

  const toggleTimer = () => {
    if (!isActive && secondsLeft <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Please set a focus duration greater than 0.');
      }
      return;
    }
    if (!hasStarted) setHasStarted(true);
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(sessionSeconds);
    setHasStarted(false);
    setShowCompletionModal(false);
    if (onSlotDismiss) onSlotDismiss();
  };

  const handleHoursChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setInputHours(cleaned);
    
    const h = parseInt(cleaned || '0', 10);
    const m = parseInt(inputMinutes || '0', 10);
    const totalSecs = (h * 3600) + (m * 60);
    setSessionSeconds(totalSecs);
    setSecondsLeft(totalSecs);
  };

  const handleMinutesChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setInputMinutes(cleaned);
    
    const h = parseInt(inputHours || '0', 10);
    const m = parseInt(cleaned || '0', 10);
    const totalSecs = (h * 3600) + (m * 60);
    setSessionSeconds(totalSecs);
    setSecondsLeft(totalSecs);
  };

  const displayHrs = Math.floor(secondsLeft / 3600);
  const displayMins = Math.floor((secondsLeft % 3600) / 60);
  const displaySecs = secondsLeft % 60;

  const progressPct = sessionSeconds > 0 ? Math.max(0, Math.min(100, ((sessionSeconds - secondsLeft) / sessionSeconds) * 100)) : 0;
  const progressColor = progressPct >= 80 ? '#ef4444' : (progressPct >= 50 ? '#f59e0b' : '#10b981');
  const showCountdown = isActive || hasStarted;

  return (
    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: currentBoundSlot ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb') }}>
      
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>Deep Work Timer</Text>
            {slotStatusBadge && (
              <View style={{ backgroundColor: isLiveNow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isLiveNow ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)' }}>
                <Text style={{ color: isLiveNow ? '#ef4444' : '#3b82f6', fontSize: 10, fontWeight: 'bold' }}>
                  {slotStatusBadge}
                </Text>
              </View>
            )}
          </View>
          {currentBoundSlot && (
            <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600', marginTop: 4 }} numberOfLines={1}>
              🎯 {currentBoundSlot.activity}
            </Text>
          )}
        </View>
      </View>

      {/* Timer Display */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        {showCountdown ? (
          <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : 1 }], alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: isActive ? '#ef4444' : (isDark ? 'white' : '#111827'), fontVariant: ['tabular-nums'] }}>
              {displayHrs.toString().padStart(2, '0')}:
              {displayMins.toString().padStart(2, '0')}:
              {displaySecs.toString().padStart(2, '0')}
            </Text>
            <Text style={{ fontSize: 10, color: isActive ? '#ef4444' : '#f59e0b', marginTop: 4, fontWeight: 'bold', letterSpacing: 1 }}>
              {isActive ? 'FOCUSING' : 'PAUSED'}
            </Text>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <TextInput
                  style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: isDark ? 'white' : '#111827',
                    width: 68,
                    textAlign: 'center',
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: 8,
                    paddingVertical: 6,
                    outlineStyle: 'none'
                  } as any}
                  keyboardType="number-pad"
                  value={inputHours}
                  onChangeText={handleHoursChange}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
                <Text style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4, fontWeight: 'bold' }}>HOURS</Text>
              </View>
              
              <Text style={{ fontSize: 40, fontWeight: 'bold', color: isDark ? '#4b5563' : '#9ca3af', marginBottom: 18 }}>:</Text>

              <View style={{ alignItems: 'center' }}>
                <TextInput
                  style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: isDark ? 'white' : '#111827',
                    width: 68,
                    textAlign: 'center',
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: 8,
                    paddingVertical: 6,
                    outlineStyle: 'none'
                  } as any}
                  keyboardType="number-pad"
                  value={inputMinutes}
                  onChangeText={handleMinutesChange}
                  placeholder="00"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                />
                <Text style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4, fontWeight: 'bold' }}>MINUTES</Text>
              </View>
            </View>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 8, fontSize: 11 }}>
              {currentBoundSlot ? `Auto-set from schedule: ${currentBoundSlot.duration}` : 'Type hours & minutes to adjust focus time'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      {hasStarted && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ height: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: progressColor, borderRadius: 3 }} />
          </View>
        </View>
      )}

      {/* Control Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        <TouchableOpacity onPress={toggleTimer} style={{ backgroundColor: isActive ? '#ef4444' : '#10b981', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={isActive ? "pause" : "play"} size={20} color="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
            {isActive ? 'PAUSE' : (hasStarted ? 'RESUME' : 'START')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={resetTimer} style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="refresh" size={20} color={isDark ? '#d1d5db' : '#4b5563'} />
        </TouchableOpacity>
      </View>

      {/* Completion Modal Overlay */}
      {showCompletionModal && currentBoundSlot && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16,
          alignItems: 'center', justifyContent: 'center', padding: 24,
          zIndex: 100
        }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340, borderWidth: 2, borderColor: '#10b981' }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(16, 185, 129, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                Session Complete! 🎉
              </Text>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                Did you complete this task?
              </Text>
              <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4 }}>
                "{currentBoundSlot.activity}"
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleCompletionNo}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', alignItems: 'center' }}
              >
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 'bold' }}>Not Yet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCompletionYes}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>✅ Yes, Done!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PomodoroTimer;
