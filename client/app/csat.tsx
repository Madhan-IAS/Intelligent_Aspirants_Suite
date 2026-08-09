import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

const FORMULAS = [
  {
    category: 'Quantitative Aptitude',
    title: 'Average Speed Formula',
    formula: 'S_avg = (2 * x * y) / (x + y)',
    note: 'Used when covering equal distances at two different speeds x and y.'
  },
  {
    category: 'Quantitative Aptitude',
    title: 'Relative Speed',
    formula: 'Opposite Direction = S1 + S2 | Same Direction = |S1 - S2|',
    note: 'Essential for trains meeting or overtaking problems.'
  },
  {
    category: 'Quantitative Aptitude',
    title: 'Divisibility Rule for 11',
    formula: '| (Sum of odd-position digits) - (Sum of even-position digits) | = 0 or multiple of 11',
    note: 'Quick check for 11 divisibility without long division.'
  },
  {
    category: 'Quantitative Aptitude',
    title: 'Permutations & Combinations',
    formula: 'nCr = n! / (r! * (n - r)!)  |  nPr = n! / (n - r)!',
    note: 'Use Combinations (nCr) when order DOES NOT matter. Use Permutations (nPr) when order DOES matter.'
  },
  {
    category: 'Logical Reasoning',
    title: 'Clock Hand Angle Formula',
    formula: 'θ = | (30 * H) - (11/2 * M) |',
    note: 'H = Hour, M = Minute. Gives exact angle in degrees between clock hands.'
  },
  {
    category: 'Logical Reasoning',
    title: 'Syllogism Standard Rules',
    formula: 'All + All = All | All + No = No | Some + All = Some',
    note: 'If both premises are Particular ("Some"), no valid conclusion can be drawn.'
  },
  {
    category: 'Reading Comprehension',
    title: 'Assumption vs Inference Rule',
    formula: 'Assumption = Unstated Premise | Inference = Logical Conclusion',
    note: 'In UPSC RC, an Assumption must be necessary for the author\'s argument to hold true.'
  }
];

const DRILL_QUESTIONS = [
  {
    id: 1,
    type: 'Quantitative',
    question: 'A train 150m long is running at a speed of 54 km/h. How many seconds will it take to cross a platform 250m long?',
    options: ['A) 20 seconds', 'B) 26.67 seconds', 'C) 30 seconds', 'D) 15 seconds'],
    correctIndex: 1, // 26.67s (Total dist = 400m, Speed = 54 * 5/18 = 15 m/s, Time = 400/15 = 26.67s)
    explanation: 'Speed = 54 * (5/18) = 15 m/s. Total distance = 150m + 250m = 400m. Time = 400 / 15 = 26.67 seconds.'
  },
  {
    id: 2,
    type: 'Logical Reasoning',
    question: 'If 1st January 2024 was a Monday, what day of the week was 1st January 2025?',
    options: ['A) Tuesday', 'B) Wednesday', 'C) Thursday', 'D) Monday'],
    correctIndex: 1, // Wednesday (2024 is a leap year = +2 odd days)
    explanation: '2024 is a leap year (366 days = 52 weeks + 2 odd days). So Jan 1 2025 = Monday + 2 = Wednesday.'
  },
  {
    id: 3,
    type: 'Reading Comprehension',
    question: 'Passage: "Sustainable agriculture requires balancing economic viability with environmental stewardship." What is the main corollary?',
    options: [
      'A) Farming without profits must be banned.',
      'B) Long-term food security requires both financial returns and ecological conservation.',
      'C) Chemical fertilizers should be immediately stopped.',
      'D) Only organic farming is sustainable.'
    ],
    correctIndex: 1,
    explanation: 'The passage explicitly ties economic viability and environmental stewardship together for sustainability.'
  }
];

export default function CSATHub() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Quantitative Aptitude');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);

  // Drill State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [drillFinished, setDrillFinished] = useState(false);

  useEffect(() => {
    fetchCSATTopics();
  }, []);

  const fetchCSATTopics = async () => {
    try {
      const res = await api.get('/topics/subject/CSAT');
      setTopics(res.data || []);
    } catch (err) {
      console.error('Error fetching CSAT topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckbox = async (topicId: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();

    const topic = topics.find(t => t._id === topicId);
    if (!topic) return;

    const nextCompleted = !topic.completed;
    setTopics(prev => prev.map(t => t._id === topicId ? { ...t, completed: nextCompleted } : t));

    try {
      await api.patch(`/daily-plan/toggle-topic/${topicId}`);
    } catch (err) {
      console.error('Error toggling topic:', err);
      // Revert
      setTopics(prev => prev.map(t => t._id === topicId ? { ...t, completed: !nextCompleted } : t));
    }
  };

  const filteredTopics = topics.filter(t => t.chapter === activeTab);

  const completedCount = topics.filter(t => t.completed).length;
  const totalCount = topics.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSelectDrillOption = (idx: number) => {
    setSelectedAnswer(idx);
  };

  const handleNextDrill = () => {
    if (selectedAnswer === DRILL_QUESTIONS[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion + 1 < DRILL_QUESTIONS.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setDrillFinished(true);
    }
  };

  const resetDrill = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setDrillFinished(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold' }}>🧮 CSAT Hub</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>Civil Services Aptitude Test • Prelims Paper II</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowFormulaModal(true)}
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons name="sparkles" size={16} color="#3b82f6" />
          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>Formulas ⚡</Text>
        </TouchableOpacity>
      </View>

      {/* Target Benchmark Hero Card */}
      <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>Qualifying Target: 33% (66.67 / 200 Marks)</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>80 Questions • 2.5 Marks each • -0.833 Negative Marking</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>Qualifying Only</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>CSAT Syllabus Coverage</Text>
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{completedCount}/{totalCount} Subtopics ({progressPct}%)</Text>
          </View>
          <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#3b82f6', borderRadius: 4 }} />
          </View>
        </View>

        {/* Quick Action Button: Speed Test */}
        <TouchableOpacity
          onPress={() => { resetDrill(); setShowDrillModal(true); }}
          style={{ backgroundColor: '#8b5cf6', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>⚡ Take 15-Min Speed Drill Practice</Text>
        </TouchableOpacity>
      </View>

      {/* Module Tabs */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Quantitative Aptitude', 'Logical Reasoning', 'Reading Comprehension'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
              backgroundColor: activeTab === tab ? '#3b82f6' : (isDark ? '#1f2937' : '#ffffff'),
              borderWidth: 1, borderColor: activeTab === tab ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
            }}
          >
            <Text style={{ color: activeTab === tab ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 13 }}>
              {tab === 'Quantitative Aptitude' ? '🧮 Quant' : tab === 'Logical Reasoning' ? '🧠 Reasoning' : '📖 Comprehension'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Topics List */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />
      ) : filteredTopics.length === 0 ? (
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginVertical: 30 }}>No subtopics found under this module.</Text>
      ) : (
        <View style={{ gap: 10, marginBottom: 30 }}>
          {filteredTopics.map(topic => (
            <TouchableOpacity
              key={topic._id}
              onPress={() => router.push(`/topic/${topic._id}` as any)}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
                backgroundColor: topic.completed ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4') : (isDark ? '#1f2937' : '#ffffff'),
                borderWidth: 1, borderColor: topic.completed ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                opacity: topic.completed ? 0.75 : 1
              }}
            >
              <TouchableOpacity
                onPress={(e) => handleToggleCheckbox(topic._id, e)}
                style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                  borderColor: topic.completed ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                  backgroundColor: topic.completed ? '#10b981' : 'transparent',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                {topic.completed && <Ionicons name="checkmark" size={14} color="white" />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: '600', textDecorationLine: topic.completed ? 'line-through' : 'none' }}>
                  {topic.title}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 2 }}>{topic.heading}</Text>
              </View>
              <View style={{ backgroundColor: topic.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' : topic.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: topic.difficulty === 'Hard' ? '#ef4444' : topic.difficulty === 'Medium' ? '#f59e0b' : '#10b981', fontSize: 11, fontWeight: 'bold' }}>{topic.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Formula Reference Modal */}
      <Modal visible={showFormulaModal} animationType="slide" transparent={true} onRequestClose={() => setShowFormulaModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>⚡ High-Yield CSAT Formulas</Text>
              <TouchableOpacity onPress={() => setShowFormulaModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ gap: 12 }}>
              {FORMULAS.map((item, idx) => (
                <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 10 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</Text>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{item.title}</Text>
                  <View style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', padding: 8, borderRadius: 6, marginVertical: 6 }}>
                    <Text style={{ color: '#2563eb', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 }}>{item.formula}</Text>
                  </View>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>💡 {item.note}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Speed Drill Modal */}
      <Modal visible={showDrillModal} animationType="slide" transparent={true} onRequestClose={() => setShowDrillModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>⚡ CSAT Speed Test Drill</Text>
              <TouchableOpacity onPress={() => setShowDrillModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            {drillFinished ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🎯</Text>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Drill Completed!</Text>
                <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold', marginVertical: 10 }}>
                  Score: {score} / {DRILL_QUESTIONS.length}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginBottom: 20 }}>
                  {score === DRILL_QUESTIONS.length ? '🌟 Perfect Accuracy! Keep up this high speed.' : 'Practice consistently to boost your speed and accuracy.'}
                </Text>
                <TouchableOpacity onPress={resetDrill} style={{ backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again 🔄</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>Question {currentQuestion + 1} of {DRILL_QUESTIONS.length}</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{DRILL_QUESTIONS[currentQuestion].type}</Text>
                </View>

                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>
                  {DRILL_QUESTIONS[currentQuestion].question}
                </Text>

                <View style={{ gap: 10, marginBottom: 20 }}>
                  {DRILL_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectDrillOption(idx)}
                      style={{
                        padding: 12, borderRadius: 10, borderWidth: 1,
                        backgroundColor: selectedAnswer === idx ? 'rgba(59, 130, 246, 0.15)' : (isDark ? '#111827' : '#f9fafb'),
                        borderColor: selectedAnswer === idx ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
                      }}
                    >
                      <Text style={{ color: selectedAnswer === idx ? '#3b82f6' : (isDark ? 'white' : '#111827'), fontWeight: selectedAnswer === idx ? 'bold' : 'normal', fontSize: 14 }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleNextDrill}
                  disabled={selectedAnswer === null}
                  style={{ backgroundColor: selectedAnswer !== null ? '#3b82f6' : '#9ca3af', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                    {currentQuestion + 1 === DRILL_QUESTIONS.length ? 'Submit Drill ✅' : 'Next Question →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
