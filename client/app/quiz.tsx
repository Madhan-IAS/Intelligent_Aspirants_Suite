import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function DailyQuiz() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quizId = params.id as string;
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  useEffect(() => {
    setVisitedQuestions(prev => new Set(prev).add(currentQuestionIndex));
  }, [currentQuestionIndex]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(quizId ? `/quiz/${quizId}` : '/quiz/daily');
      setQuiz(res.data);
      if (res.data?.status === 'Completed') {
        setSubmitted(true);
        if (res.data.selectedAnswers) {
          setSelectedAnswers(res.data.selectedAnswers);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/quiz/generate');
      setQuiz(res.data);
      setSubmitted(false);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setVisitedQuestions(new Set([0]));
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      alert(error.response?.data?.message || 'Failed to generate quiz. Is your GEMINI_API_KEY set?');
    } finally {
      setGenerating(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (submitted) return;
    const qId = quiz.questions[currentQuestionIndex]._id;
    setSelectedAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q: any) => {
      if (selectedAnswers[q._id]?.trim() === q.correctAnswer?.trim()) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      const score = calculateScore();
      const res = await api.put(`/quiz/${quiz._id}/submit`, { score, selectedAnswers });
      setQuiz(res.data); // Update quiz with backend saved score
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 40, left: 24, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
        </TouchableOpacity>

        <Ionicons name="rocket" size={80} color="#8b5cf6" style={{ marginBottom: 24 }} />
        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Today's Mission Quiz</Text>
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginBottom: 32, maxWidth: 400 }}>
          Generate 25 UPSC Prelims-style MCQs from today's GS schedule topics. AI will create statement-based, assertion-reason, and factual questions.
        </Text>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        >
          {generating ? <ActivityIndicator color="white" /> : <Ionicons name="sparkles" size={20} color="white" />}
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
            {generating ? 'Generating 25 UPSC Questions...' : 'Generate Today\'s Mission Quiz'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/quiz-history')}
          style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="time" size={20} color={isDark ? 'white' : '#111827'} />
          <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
            View Quiz History
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const finalScore = quiz?.status === 'Completed' ? quiz.score : calculateScore();

  const question = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const hasAnsweredCurrent = !!selectedAnswers[question._id];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* 2-Column Layout */}
      <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', padding: 24, gap: 24 }}>

        {/* MAIN COLUMN */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
              <View>
                <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Daily Testing</Text>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>AI Quiz Engine</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/quiz-history')}
                style={{ backgroundColor: isDark ? '#1f2937' : '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
              >
                <Ionicons name="time" size={16} color={isDark ? '#d1d5db' : '#4b5563'} style={{ marginRight: 6 }} />
                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: 'bold' }}>Archive</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: isDark ? '#1f2937' : '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: 'bold' }}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Text>
              </View>
            </View>
          </View>

          {/* Results Banner (If Submitted) */}
          {submitted && (
            <View style={{ backgroundColor: '#10b98120', borderColor: '#10b981', borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 24, alignItems: 'center' }}>
              <Ionicons name="trophy" size={32} color="#10b981" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#10b981', fontSize: 20, fontWeight: 'bold' }}>Quiz Completed!</Text>
              <Text style={{ color: isDark ? '#d1d5db' : '#374151', marginTop: 4 }}>
                You scored <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{finalScore}</Text> out of {totalQuestions}.
              </Text>
            </View>
          )}

          {/* Question Card */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flex: 1, padding: 24 }}>

            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, lineHeight: 28, fontFamily: 'serif', marginBottom: 24, fontWeight: '500' }}>
              {currentQuestionIndex + 1}. {question.questionText}
            </Text>

            <View style={{ gap: 12 }}>
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswers[question._id] === option;
                const isCorrect = option === question.correctAnswer;

                let bgColor = isDark ? '#374151' : '#f3f4f6';
                let borderColor = isDark ? '#4b5563' : '#e5e7eb';
                let textColor = isDark ? '#d1d5db' : '#374151';

                if (submitted) {
                  if (isCorrect) {
                    bgColor = '#10b98120';
                    borderColor = '#10b981';
                    textColor = '#10b981';
                  } else if (isSelected && !isCorrect) {
                    bgColor = '#ef444420';
                    borderColor = '#ef4444';
                    textColor = '#ef4444';
                  }
                } else if (isSelected) {
                  bgColor = '#8b5cf620';
                  borderColor = '#8b5cf6';
                  textColor = '#8b5cf6';
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOptionSelect(option)}
                    disabled={submitted}
                    style={{
                      backgroundColor: bgColor,
                      borderWidth: 1,
                      borderColor: borderColor,
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      {isSelected && !submitted && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#8b5cf6' }} />}
                      {submitted && isCorrect && <Ionicons name="checkmark" size={14} color="#10b981" />}
                      {submitted && isSelected && !isCorrect && <Ionicons name="close" size={14} color="#ef4444" />}
                    </View>
                    <Text style={{ color: textColor, fontSize: 16, flex: 1, fontFamily: 'serif' }}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation (Shows after submit) */}
            {submitted && (
              <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="information-circle" size={18} color="#3b82f6" />
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginLeft: 8 }}>Explanation</Text>
                </View>
                <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', lineHeight: 24 }}>{question.explanation}</Text>
              </View>
            )}

          </View>

          {/* Post-Quiz Actions */}
          {submitted && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 40, paddingTop: 32, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingBottom: 24 }}>
              <TouchableOpacity
                onPress={() => quizId ? router.replace('/quiz-history') : setQuiz(null)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isDark ? '#374151' : '#e5e7eb', alignItems: 'center' }}
              >
                <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold' }}>{quizId ? 'Back to Archive' : 'Exit Quiz Page'}</Text>
              </TouchableOpacity>

              {!quizId && (
                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={generating}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#8b5cf6', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  {generating ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="refresh" size={18} color="white" style={{ marginRight: 6 }} />}
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{generating ? 'Regenerating...' : 'Regenerate Quiz'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Footer Navigation (For moving through questions before ending) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
            >
              <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold' }}>Previous</Text>
            </TouchableOpacity>

            {!isLastQuestion ? (
              <TouchableOpacity
                onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
                style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#8b5cf6' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Next Question</Text>
              </TouchableOpacity>
            ) : !submitted ? (
              <TouchableOpacity
                onPress={handleSubmit}
                style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#10b981' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit Quiz</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>

        {/* SIDEBAR NAVIGATION GRID */}
        <View style={{ width: isDesktop ? 300 : '100%', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 24, height: isDesktop ? '100%' : 'auto' }}>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Question Navigator</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {quiz.questions.map((q: any, idx: number) => {
                const isAnswered = !!selectedAnswers[q._id];
                const isCurrent = currentQuestionIndex === idx;
                const isVisited = visitedQuestions.has(idx);
                const isCorrect = q.correctAnswer?.trim() === selectedAnswers[q._id]?.trim();

                let bgColor = isDark ? '#374151' : '#f3f4f6';
                let textColor = isDark ? '#d1d5db' : '#6b7280';
                let borderColor = isDark ? '#4b5563' : '#e5e7eb';

                if (isCurrent) {
                  bgColor = '#8b5cf6';
                  textColor = 'white';
                  borderColor = '#8b5cf6';
                } else if (submitted) {
                  if (isCorrect) {
                    bgColor = '#10b98120'; textColor = '#10b981'; borderColor = '#10b981';
                  } else if (isAnswered) {
                    bgColor = '#ef444420'; textColor = '#ef4444'; borderColor = '#ef4444';
                  }
                } else if (isAnswered) {
                  bgColor = '#10b98120'; textColor = '#10b981'; borderColor = '#10b981';
                } else if (isVisited) {
                  bgColor = '#f59e0b20'; textColor = '#f59e0b'; borderColor = '#f59e0b';
                }

                return (
                  <TouchableOpacity
                    key={q._id}
                    onPress={() => setCurrentQuestionIndex(idx)}
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: bgColor,
                      borderWidth: isCurrent ? 0 : 1.5, borderColor,
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
}
