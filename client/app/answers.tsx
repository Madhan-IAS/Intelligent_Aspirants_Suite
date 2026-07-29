import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function AnswerWorkspace() {
  const router = useRouter();
  const { pyqId } = useLocalSearchParams();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [answer, setAnswer] = useState('');
  const [pyq, setPyq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  // Timer & History State
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [rightPanelTab, setRightPanelTab] = useState<'structure' | 'quotes'>('structure');
  const [allDirectives, setAllDirectives] = useState<any[]>([]);
  const [selectedDirectiveName, setSelectedDirectiveName] = useState<string>('');
  const [directiveDetail, setDirectiveDetail] = useState<any>(null);
  const [recommendedQuotes, setRecommendedQuotes] = useState<any[]>([]);
  const [modelOutline, setModelOutline] = useState<any>(null);
  const [fetchingOutline, setFetchingOutline] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    fetchAllDirectives();
    if (pyqId) {
      fetchPYQ();
      fetchPreviousAttempts();
    } else {
      setLoading(false);
      fetchRecommendedQuotes('');
    }
  }, [pyqId]);

  useEffect(() => {
    if (pyq) {
      if (pyq.directive) {
        setSelectedDirectiveName(pyq.directive);
        fetchDirectiveDetail(pyq.directive);
      }
      fetchRecommendedQuotes(pyq.subjectId?.name || '', pyq.question || '');
    }
  }, [pyq]);

  const fetchAllDirectives = async () => {
    try {
      const res = await api.get('/directives');
      setAllDirectives(res.data);
    } catch (error) {
      console.error('Error fetching directives list:', error);
    }
  };

  const fetchDirectiveDetail = async (name: string) => {
    try {
      const res = await api.get(`/directives/${encodeURIComponent(name)}`);
      setDirectiveDetail(res.data);
    } catch (error) {
      console.error('Error fetching directive details:', error);
      setDirectiveDetail(null);
    }
  };

  const fetchRecommendedQuotes = async (subjectName: string, questionText: string = '') => {
    try {
      const res = await api.get(`/quotes/recommend?subject=${encodeURIComponent(subjectName)}&question=${encodeURIComponent(questionText)}`);
      setRecommendedQuotes(res.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleDirectiveSelect = (name: string) => {
    setSelectedDirectiveName(name);
    fetchDirectiveDetail(name);
  };

  const fetchPYQ = async () => {
    try {
      const res = await api.get(`/pyqs/${pyqId}`);
      setPyq(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAttempts = async () => {
    if (!pyqId) return;
    try {
      const res = await api.get(`/answers/pyq/${pyqId}`);
      setPreviousAttempts(res.data);
      // Auto-load latest answer content if editor is empty
      if (res.data.length > 0 && !answer) {
        setAnswer(res.data[0].content);
        if (res.data[0].aiEvaluation) {
          setAiFeedback(res.data[0].aiEvaluation);
        }
      }
    } catch (error) {
      console.error('Error fetching previous attempts:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (text: string) => {
    setAnswer(text);
    if (!timerActive && text.trim().length > 0) {
      setTimerActive(true);
    }
  };

  const handleFetchModelOutline = async () => {
    if (!pyqId) return;
    setFetchingOutline(true);
    try {
      const res = await api.post('/ai/generate-outline', { pyqId });
      setModelOutline(res.data);
    } catch (error) {
      console.error('Error fetching model outline:', error);
      alert("Failed to generate model outline.");
    } finally {
      setFetchingOutline(false);
    }
  };

  const handleEvaluate = async () => {
    if (!pyqId || !answer.trim()) {
      alert("Please write an answer first.");
      return;
    }
    
    setSaving(true);
    setEvaluating(true);
    setTimerActive(false); // Pause timer
    try {
      // 1. Save Answer
      const saveRes = await api.post('/answers', {
        pyqId,
        content: answer,
        timeTaken: timeElapsed
      });
      const savedAnswer = saveRes.data;

      // 2. Evaluate with AI
      const evalRes = await api.post('/ai/evaluate', {
        answerId: savedAnswer._id
      });
      
      setAiFeedback(evalRes.data.aiEvaluation);
      alert('AI Evaluation Complete!');
      fetchPreviousAttempts();
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      alert(error.response?.data?.message || 'Failed to evaluate answer. Make sure API key is set.');
    } finally {
      setSaving(false);
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Workspace</Text>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Answer Writing</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleEvaluate} 
            disabled={saving || evaluating}
            style={{ 
              backgroundColor: saving || evaluating ? (isDark ? '#374151' : '#d1d5db') : '#8b5cf6', 
              paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' 
            }}
          >
            {evaluating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="sparkles" size={18} color="white" />
            )}
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
              {evaluating ? 'AI Evaluating...' : 'Submit & Evaluate'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: Platform.OS === 'web' && window.innerWidth > 1024 ? 'row' : 'column', flex: 1, gap: 24 }}>
          
          {/* Editor Area (Left Split) */}
          <View style={{ flex: 2, backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', padding: 16, display: 'flex', flexDirection: 'column' }}>
            <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, lineHeight: 28, fontFamily: 'serif' }}>
                {pyq ? pyq.question : 'No question selected. Please go back to the PYQ Database and select a question to answer.'}
              </Text>
              {pyq && (
                <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>Directive: {pyq.directive || 'N/A'}</Text>
                  <Text style={{ color: isDark ? '#4b5563' : '#d1d5db', marginHorizontal: 12 }}>|</Text>
                  <Text style={{ color: '#f59e0b', fontSize: 14, fontWeight: '500' }}>Word Limit: {pyq.wordLimit || 150}</Text>
                </View>
              )}
            </View>

            {/* Timer & History Bar */}
            {pyq && (
              <View style={{ marginBottom: 16, gap: 12 }}>
                {/* Timer Component */}
                {(() => {
                  const allowedTime = (pyq.marks || 10) === 15 ? 720 : 420;
                  const timeRemaining = Math.max(0, allowedTime - timeElapsed);
                  const pct = Math.min(100, Math.max(0, (timeRemaining / allowedTime) * 100));
                  const isWarning = pct < 20 || timeRemaining === 0;
                  const timerColor = isWarning ? '#ef4444' : (pct < 50 ? '#f59e0b' : '#10b981');

                  return (
                    <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isWarning ? '#ef4444' : (isDark ? '#374151' : '#e5e7eb') }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="stopwatch" size={18} color={timerColor} />
                          <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>
                            Practice Timer ({pyq.marks || 10} Marks = {(pyq.marks || 10) === 15 ? '12' : '7'} Mins Target)
                          </Text>
                        </View>
                        <Text style={{ color: timerColor, fontWeight: 'bold', fontSize: 13 }}>
                          Spent: {formatTime(timeElapsed)} | Left: {formatTime(timeRemaining)}
                        </Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: timerColor }} />
                      </View>
                      {isWarning && (
                        <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: 'bold', marginTop: 4, textAlign: 'right' }}>
                          ⚠️ Target time elapsed! Wrap up your conclusion.
                        </Text>
                      )}
                    </View>
                  );
                })()}

                {/* Previous Attempts Bar */}
                {previousAttempts.length > 0 && (
                  <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden' }}>
                    <TouchableOpacity 
                      onPress={() => setShowHistory(!showHistory)}
                      style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={18} color="#8b5cf6" />
                        <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>
                          Previous Attempts ({previousAttempts.length})
                        </Text>
                      </View>
                      <Ionicons name={showHistory ? "chevron-up" : "chevron-down"} size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>

                    {showHistory && (
                      <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 8 }}>
                        {previousAttempts.map((att: any, idx: number) => {
                          const totalMarks = pyq.marks || 10;
                          const score = att.aiEvaluation?.score;
                          const pct = score ? (score / totalMarks) * 100 : 0;
                          const badgeColor = pct >= 60 ? '#10b981' : (pct >= 40 ? '#f59e0b' : '#ef4444');

                          return (
                            <TouchableOpacity
                              key={att._id}
                              onPress={() => {
                                setAnswer(att.content);
                                if (att.aiEvaluation) setAiFeedback(att.aiEvaluation);
                              }}
                              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}
                            >
                              <View>
                                <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937', fontWeight: 'bold', fontSize: 12 }}>
                                  Attempt #{previousAttempts.length - idx} • {new Date(att.createdAt).toLocaleDateString()}
                                </Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>
                                  Words: {att.content?.split(/\s+/).length || 0} | Time: {formatTime(att.timeTaken || 0)}
                                </Text>
                              </View>
                              {score !== undefined ? (
                                <View style={{ backgroundColor: `${badgeColor}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: badgeColor }}>
                                  <Text style={{ color: badgeColor, fontWeight: 'bold', fontSize: 12 }}>{score}/{totalMarks}</Text>
                                </View>
                              ) : (
                                <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontStyle: 'italic' }}>Unevaluated</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
            
            <TextInput
              style={{ flex: 1, color: isDark ? '#d1d5db' : '#374151', fontSize: 16, textAlignVertical: 'top', lineHeight: 24, fontFamily: 'serif', outlineStyle: 'none' } as any}
              multiline
              placeholder="Start your answer here... (Structure: Intro -> Body -> Conclusion)"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={answer}
              onChangeText={handleTextChange}
            />
            
            {/* Word count footer */}
            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: answer.split(/\s+/).filter(w => w.length > 0).length > (pyq?.wordLimit || 150) ? '#ef4444' : (isDark ? '#9ca3af' : '#6b7280') }}>
                {answer.split(/\s+/).filter(w => w.length > 0).length} / {pyq?.wordLimit || 150} words
              </Text>
            </View>
          </View>

          {/* Guidelines & Evaluation (Right Split) */}
          <View style={{ flex: 1, gap: 24 }}>
            
            {aiFeedback ? (
              /* AI Feedback Panel */
              <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#8b5cf6' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="sparkles" size={24} color="#8b5cf6" />
                  <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>AI Mentor Feedback</Text>
                </View>
                
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 }}>Score</Text>
                  {(() => {
                    const totalMarks = pyq?.marks || 10;
                    const pct = (aiFeedback.score / totalMarks) * 100;
                    const scoreColor = pct >= 60 ? '#10b981' : (pct >= 40 ? '#f59e0b' : '#ef4444');
                    return (
                      <Text style={{ color: scoreColor, fontSize: 48, fontWeight: 'bold' }}>
                        {aiFeedback.score}<Text style={{ fontSize: 24, color: isDark ? '#4b5563' : '#d1d5db' }}>/{totalMarks}</Text>
                      </Text>
                    );
                  })()}
                </View>

                {aiFeedback.rubricBreakdown && (
                  <View style={{ marginBottom: 20, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 16 }}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontWeight: 'bold', fontSize: 14, marginBottom: 12 }}>Rubric Breakdown</Text>
                    {[
                      { key: 'contentAndConcepts', label: 'Content & Concepts', desc: 'Syllabus depth, accuracy, relevant examples' },
                      { key: 'structureAndPresentation', label: 'Structure & Flow', desc: 'Intro, Body subheadings, balanced Conclusion' },
                      { key: 'directiveAdherence', label: 'Directive Adherence', desc: 'Addressed the key task (e.g. critically analyze)' },
                      { key: 'valueAddition', label: 'Value Addition', desc: 'Quotes, Case Studies, SDGs, Constitutional articles' }
                    ].map(item => {
                      const data = aiFeedback.rubricBreakdown[item.key];
                      if (!data) return null;
                      const ratio = data.max > 0 ? data.score / data.max : 0;
                      const pct = Math.min(100, Math.max(0, ratio * 100));
                      const barColor = pct >= 60 ? '#10b981' : (pct >= 40 ? '#f59e0b' : '#ef4444');
                      return (
                        <View key={item.key} style={{ marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937', fontSize: 13, fontWeight: '600' }}>{item.label}</Text>
                              <Text style={{ color: isDark ? '#9ca3af' : '#9ca3af', fontSize: 10 }}>{item.desc}</Text>
                            </View>
                            <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: 'bold' }}>{data.score} / {data.max}</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: 3 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 14, lineHeight: 22, marginBottom: 16, fontStyle: 'italic' }}>
                  "{aiFeedback.feedback}"
                </Text>

                {aiFeedback.strengths?.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#10b981', fontWeight: 'bold', marginBottom: 4 }}>Strengths:</Text>
                    {aiFeedback.strengths.map((s: string, i: number) => (
                      <Text key={i} style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 2 }}>• {s}</Text>
                    ))}
                  </View>
                )}

                {aiFeedback.weaknesses?.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: 4 }}>Weaknesses:</Text>
                    {aiFeedback.weaknesses.map((w: string, i: number) => (
                      <Text key={i} style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 2 }}>• {w}</Text>
                    ))}
                  </View>
                )}
                {aiFeedback.suggestedPoints?.length > 0 && (
                  <View>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: 4 }}>Points to Add:</Text>
                    {aiFeedback.suggestedPoints.map((p: string, i: number) => (
                      <Text key={i} style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 2 }}>+ {p}</Text>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* Custom Writing Helper Panel */
              <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                
                {/* Tab switcher inside the panel */}
                <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#111827' : '#f3f4f6', padding: 4, borderRadius: 10, marginBottom: 18 }}>
                  <TouchableOpacity onPress={() => setRightPanelTab('structure')} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: rightPanelTab === 'structure' ? (isDark ? '#1f2937' : '#ffffff') : 'transparent', borderRadius: 8 }}>
                    <Text style={{ color: rightPanelTab === 'structure' ? (isDark ? 'white' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'), fontSize: 13, fontWeight: 'bold' }}>Directive Blueprint</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setRightPanelTab('quotes')} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: rightPanelTab === 'quotes' ? (isDark ? '#1f2937' : '#ffffff') : 'transparent', borderRadius: 8 }}>
                    <Text style={{ color: rightPanelTab === 'quotes' ? (isDark ? 'white' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'), fontSize: 13, fontWeight: 'bold' }}>Subject Quotes</Text>
                  </TouchableOpacity>
                </View>

                {rightPanelTab === 'structure' ? (
                  <View>
                    {directiveDetail ? (
                      /* Directive Specific Guide */
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 18 }}>
                            {directiveDetail.name}
                          </Text>
                          <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                            <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}>{directiveDetail.depth} Depth</Text>
                          </View>
                        </View>

                        <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
                          "What you should do: {directiveDetail.definition}"
                        </Text>

                        <View style={{ gap: 12, marginBottom: 16 }}>
                          <View style={{ borderLeftWidth: 3, borderLeftColor: '#3b82f6', paddingLeft: 10 }}>
                            <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>Introduction</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, marginTop: 2 }}>{directiveDetail.structure?.intro}</Text>
                          </View>
                          <View style={{ borderLeftWidth: 3, borderLeftColor: '#f59e0b', paddingLeft: 10 }}>
                            <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 12 }}>Body Blueprint</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, marginTop: 2 }}>{directiveDetail.structure?.body}</Text>
                          </View>
                          <View style={{ borderLeftWidth: 3, borderLeftColor: '#10b981', paddingLeft: 10 }}>
                            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>Conclusion</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, marginTop: 2 }}>{directiveDetail.structure?.conclusion}</Text>
                          </View>
                        </View>

                        {directiveDetail.smartAddon && (
                          <View style={{ backgroundColor: isDark ? '#111827' : '#eff6ff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#bfdbfe', marginBottom: 16 }}>
                            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Value-Addition Strategy</Text>
                            <Text style={{ color: isDark ? '#d1d5db' : '#1e3a8a', fontSize: 12 }}>{directiveDetail.smartAddon}</Text>
                          </View>
                        )}

                        {/* Model Outline Generator block */}
                        {modelOutline ? (
                          <View style={{ backgroundColor: isDark ? '#111827' : '#f0fdf4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', marginTop: 16, gap: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: isDark ? '#1f2937' : '#d1fae5', paddingBottom: 8 }}>
                              <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 14 }}>Perfect Model Outline</Text>
                              <TouchableOpacity onPress={() => setModelOutline(null)}>
                                <Ionicons name="close-circle" size={18} color="#ef4444" />
                              </TouchableOpacity>
                            </View>

                            <View>
                              <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Introduction (Define/Context)</Text>
                              {modelOutline.introductionOutline?.map((pt: string, idx: number) => (
                                <Text key={idx} style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 2 }}>• {pt}</Text>
                              ))}
                            </View>

                            {modelOutline.bodyOutline?.map((sec: any, idx: number) => (
                              <View key={idx}>
                                <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>{sec.heading}</Text>
                                {sec.points?.map((pt: string, pidx: number) => (
                                  <Text key={pidx} style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 2 }}>• {pt}</Text>
                                ))}
                              </View>
                            ))}

                            <View>
                              <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Conclusion (Way Forward)</Text>
                              {modelOutline.conclusionOutline?.map((pt: string, idx: number) => (
                                <Text key={idx} style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 12, marginBottom: 2 }}>• {pt}</Text>
                              ))}
                            </View>

                            {modelOutline.valueAdds?.length > 0 && (
                              <View style={{ backgroundColor: isDark ? '#1f2937' : '#f0fdf4', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10b981' }}>
                                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Value addition keywords/SC cases</Text>
                                <Text style={{ color: isDark ? '#a7f3d0' : '#065f46', fontSize: 11 }}>{modelOutline.valueAdds.join(', ')}</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <TouchableOpacity 
                            onPress={handleFetchModelOutline} 
                            disabled={fetchingOutline}
                            style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                          >
                            {fetchingOutline ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <>
                                <Ionicons name="sparkles" size={16} color="white" />
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Generate perfect model outline</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      /* Default Fallback */
                      <View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Structure Guide</Text>
                        
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>Intro (10%)</Text>
                          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>Define key concepts or set the context with a current affairs hook.</Text>
                        </View>
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 12 }}>Body (80%)</Text>
                          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>Address all parts of the prompt in structured bullet points with maps/data.</Text>
                        </View>
                        <View style={{ marginBottom: 16 }}>
                          <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>Conclusion (10%)</Text>
                          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>End with a balanced way forward and link to SDGs or constitutional values.</Text>
                        </View>
                      </View>
                    )}

                    {/* Quick selector of other directives */}
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', paddingTop: 12 }}>
                      Explore Other Directives
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }}>
                      {allDirectives.map((d) => (
                        <TouchableOpacity
                          key={d._id}
                          onPress={() => handleDirectiveSelect(d.name)}
                          style={{
                            backgroundColor: selectedDirectiveName === d.name ? '#2563eb' : (isDark ? '#111827' : '#f3f4f6'),
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: selectedDirectiveName === d.name ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb')
                          }}
                        >
                          <Text style={{ color: selectedDirectiveName === d.name ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontSize: 11, fontWeight: '500' }}>
                            {d.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  /* Subject Recommended Quotes */
                  <View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>
                      Recommended Quotes
                    </Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginBottom: 16 }}>
                      Authoritative quotes curated for {pyq?.subjectId?.name || 'General Studies'} answers:
                    </Text>

                    <View style={{ gap: 12 }}>
                      {recommendedQuotes.map((q) => (
                        <View key={q._id} style={{ padding: 12, backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                          <Text style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: 13, lineHeight: 18, fontStyle: 'italic', fontFamily: 'serif' }}>
                            "{q.text}"
                          </Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <Text style={{ color: '#2563eb', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                              #{q.index} • {q.category}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => {
                                if (Platform.OS === 'web') {
                                  navigator.clipboard.writeText(q.text);
                                  alert('Quote copied to clipboard!');
                                }
                              }}
                              style={{ padding: 2 }}
                            >
                              <Ionicons name="copy-outline" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                      {recommendedQuotes.length === 0 && (
                        <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', paddingVertical: 12 }}>
                          No quotes found for this subject.
                        </Text>
                      )}
                    </View>
                  </View>
                )}

              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
