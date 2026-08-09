import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

const BLUEPRINT = [
  { segment: 'Number System & Permutations', count: '18–22 Qs', priority: 'Extreme High', color: '#ef4444' },
  { segment: 'Reading Comprehension (RC)', count: '25–27 Qs', priority: 'High Priority', color: '#f59e0b' },
  { segment: 'General Arithmetic & TSD', count: '12–15 Qs', priority: 'Moderate-High', color: '#3b82f6' },
  { segment: 'Analytical Puzzles & Arrangements', count: '8–10 Qs', priority: 'Moderate', color: '#8b5cf6' },
  { segment: 'Data Interpretation & Sufficiency', count: '5–8 Qs', priority: 'Increasing Trend', color: '#10b981' },
  { segment: 'Clocks, Calendars & Cubes', count: '3–5 Qs', priority: 'High Accuracy', color: '#ec4899' },
];

const EXTENDED_FORMULAS = [
  {
    category: 'Advanced Number System',
    title: 'Fermat\'s Little Theorem & Euler Totient',
    formula: 'a^(p-1) ≡ 1 (mod p)  [where p is prime and gcd(a,p)=1]',
    note: 'Used for evaluating high-exponent remainders e.g. 2^100 mod 101 = 1.'
  },
  {
    category: 'Advanced Number System',
    title: 'Trailing Zeros in Factorials',
    formula: 'Count of 5s = ⌊N/5⌋ + ⌊N/25⌋ + ⌊N/125⌋ + ...',
    note: 'Example: 100! has ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24 trailing zeros.'
  },
  {
    category: 'Core Arithmetic',
    title: 'Mixture & Alligation Cross Formula',
    formula: '(Cheaper Qty) / (Dearer Qty) = (Dearer Price - Mean Price) / (Mean Price - Cheaper Price)',
    note: 'Used for solving multi-vessel liquid replacements and price blending.'
  },
  {
    category: 'Time, Speed & Distance',
    title: 'Average Speed & Relative Intercept',
    formula: 'S_avg = 2xy/(x+y)  |  Relative Speed (Opposite) = S1 + S2',
    note: 'Used when equal distance is traveled at different speeds x and y.'
  },
  {
    category: 'Combinatorics',
    title: 'Circular Arrangements & Distribution',
    formula: 'Circular Permutations = (n - 1)!  |  Identical Items to Distinct Groups = (n + r - 1)C(r - 1)',
    note: 'For necklaces/garlands (no direction distinction), divide by 2: (n - 1)! / 2.'
  },
  {
    category: 'Logical Reasoning',
    title: 'Clock Hand Angle Formula',
    formula: 'θ = | (30 * H) - (11/2 * M) |',
    note: 'H = Hour, M = Minute. Gives exact angle in degrees between clock hands.'
  },
  {
    category: 'Logical Reasoning',
    title: 'Painted Sub-Cubes Metric (n x n x n)',
    formula: '3 Faces = 8 (corners) | 2 Faces = 12(n-2) | 1 Face = 6(n-2)^2 | 0 Faces = (n-2)^3',
    note: 'n = number of cuts per edge + 1 (i.e. length of large cube / length of small cube).'
  },
  {
    category: 'Reading Comprehension',
    title: 'Assumption vs Inference Rule',
    formula: 'Assumption = Unstated Necessary Premise | Corollary = Direct Spin-off Impact',
    note: 'In UPSC RC, if an assumption is negated, the author\'s main conclusion MUST fall apart.'
  }
];

const DRILL_QUESTIONS = [
  {
    id: 1,
    type: 'Advanced Quant',
    question: 'Find the total number of trailing zeros in the expansion of 100! (100 factorial).',
    options: ['A) 20', 'B) 24', 'C) 25', 'D) 22'],
    correctIndex: 1,
    explanation: 'Count of zeros = ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24 trailing zeros.'
  },
  {
    id: 2,
    type: 'Logical Reasoning',
    question: 'A large cube painted red on all outer faces is cut into 64 identical smaller cubes (4x4x4). How many smaller cubes have EXACTLY 2 faces painted red?',
    options: ['A) 16', 'B) 24', 'C) 36', 'D) 8'],
    correctIndex: 1,
    explanation: 'Here n = 4. 2-face painted cubes are along edges = 12 * (n - 2) = 12 * (4 - 2) = 24 cubes.'
  },
  {
    id: 3,
    type: 'Reading Comprehension',
    question: 'Passage: "Decentralized governance without financial autonomy remains an empty administrative gesture." Which assumption is necessary?',
    options: [
      'A) Financial autonomy requires central taxation.',
      'B) Meaningful local governance depends on having independent financial resources.',
      'C) All administrative gestures are ineffective.',
      'D) Local bodies should not collect taxes.'
    ],
    correctIndex: 1,
    explanation: 'Negating Option B ("Governance does NOT depend on financial resources") breaks the author\'s premise that it is an empty gesture without it.'
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
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
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

  const resetDrill = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setDrillFinished(false);
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold' }}>🧮 CSAT Master Hub</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>UPSC Prelims Paper II • 80 Qs (200 Marks) • 33% Qualifying</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowBlueprintModal(true)}
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="stats-chart" size={16} color="#8b5cf6" />
            <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 12 }}>Trends 📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowFormulaModal(true)}
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="sparkles" size={16} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>Formulas ⚡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Target Benchmark Hero Card */}
      <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>Qualifying Target: 33% (66.00 / 200 Net Marks)</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>+2.5 Marks Correct • -0.833 Penalty per Incorrect Answer</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>33% Benchmark</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>Exhaustive Micro-Syllabus Coverage</Text>
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{completedCount}/{totalCount} Micro-Topics ({progressPct}%)</Text>
          </View>
          <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#3b82f6', borderRadius: 4 }} />
          </View>
        </View>

        {/* Quick Action Button: Speed Test */}
        <TouchableOpacity
          onPress={() => { resetDrill(); setShowDrillModal(true); }}
          style={{ backgroundColor: '#8b5cf6', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>⚡ Take 15-Min CSAT Speed Test Drill</Text>
        </TouchableOpacity>
      </View>

      {/* Module Tabs */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'Quantitative Aptitude', label: '🧮 Quant & Math (35-40 Qs)' },
          { key: 'Logical Reasoning', label: '🧠 Reasoning & Puzzles (20-25 Qs)' },
          { key: 'Reading Comprehension', label: '📖 RC & Data (25-30 Qs)' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
              backgroundColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#1f2937' : '#ffffff'),
              borderWidth: 1, borderColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
            }}
          >
            <Text style={{ color: activeTab === tab.key ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 12 }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Topics List */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />
      ) : filteredTopics.length === 0 ? (
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginVertical: 30 }}>No micro-topics found under this module.</Text>
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
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: '600', textDecorationLine: topic.completed ? 'line-through' : 'none' }}>
                  {topic.title}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 2 }}>{topic.heading}</Text>
              </View>
              <View style={{ backgroundColor: topic.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' : topic.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: topic.difficulty === 'Hard' ? '#ef4444' : topic.difficulty === 'Medium' ? '#f59e0b' : '#10b981', fontSize: 10, fontWeight: 'bold' }}>{topic.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Blueprint Trend Modal */}
      <Modal visible={showBlueprintModal} animationType="slide" transparent={true} onRequestClose={() => setShowBlueprintModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>📊 Historical Weightage & Blueprint</Text>
              <TouchableOpacity onPress={() => setShowBlueprintModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ gap: 10 }}>
              {BLUEPRINT.map((row, idx) => (
                <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 13 }}>{row.segment}</Text>
                    <Text style={{ color: row.color, fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>{row.priority}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{row.count}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              {EXTENDED_FORMULAS.map((item, idx) => (
                <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 10 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</Text>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>{item.title}</Text>
                  <View style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', padding: 8, borderRadius: 6, marginVertical: 6 }}>
                    <Text style={{ color: '#2563eb', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12 }}>{item.formula}</Text>
                  </View>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>💡 {item.note}</Text>
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

                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: '600', marginBottom: 16 }}>
                  {DRILL_QUESTIONS[currentQuestion].question}
                </Text>

                <View style={{ gap: 10, marginBottom: 20 }}>
                  {DRILL_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedAnswer(idx)}
                      style={{
                        padding: 12, borderRadius: 10, borderWidth: 1,
                        backgroundColor: selectedAnswer === idx ? 'rgba(59, 130, 246, 0.15)' : (isDark ? '#111827' : '#f9fafb'),
                        borderColor: selectedAnswer === idx ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
                      }}
                    >
                      <Text style={{ color: selectedAnswer === idx ? '#3b82f6' : (isDark ? 'white' : '#111827'), fontWeight: selectedAnswer === idx ? 'bold' : 'normal', fontSize: 13 }}>
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
