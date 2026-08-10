import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const DEFAULT_START_HOUR = 23; // 11:00 PM
const DEFAULT_START_MIN = 0;
const DEFAULT_END_HOUR = 5;    // 05:30 AM
const DEFAULT_END_MIN = 30;

export default function NightOwlTimer() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    // Config State (Night Owl Hours)
    const [config, setConfig] = useState({
        startHour: DEFAULT_START_HOUR,
        startMin: DEFAULT_START_MIN,
        endHour: DEFAULT_END_HOUR,
        endMin: DEFAULT_END_MIN,
    });
    const [showConfig, setShowConfig] = useState(false);

    // Active Session State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [startTimeStamp, setStartTimeStamp] = useState<string | null>(null);

    // Selection state
    const [subject, setSubject] = useState('Sociology');
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [subtopicTitle, setSubtopicTitle] = useState('');
    const [topicLoading, setTopicLoading] = useState(false);

    // Visibility Check State
    const [isVisibleTime, setIsVisibleTime] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load config on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Time visibility checker (runs every minute or on mount)
    useEffect(() => {
        checkTimeVisibility();
        const timeInterval = setInterval(checkTimeVisibility, 60000);
        return () => clearInterval(timeInterval);
    }, [config]);

    // Load topics from server when subject changes
    useEffect(() => {
        fetchTopics();
    }, [subject]);

    // Timer logic
    useEffect(() => {
        if (isSessionActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setSecondsElapsed(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionActive, isPaused]);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem('night_owl_config');
            if (stored) {
                setConfig(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load night owl settings:', e);
        }
    };

    const saveSettings = async (newConfig: typeof config) => {
        try {
            await AsyncStorage.setItem('night_owl_config', JSON.stringify(newConfig));
            setConfig(newConfig);
            setShowConfig(false);
        } catch (e) {
            console.error('Failed to save night owl settings:', e);
        }
    };

    const checkTimeVisibility = () => {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        const startMins = config.startHour * 60 + config.startMin;
        const endMins = config.endHour * 60 + config.endMin;

        let active = false;
        if (startMins > endMins) {
            // Midnight Crossover (e.g. 11:00 PM to 5:30 AM)
            active = (currentMins >= startMins || currentMins <= endMins);
        } else {
            active = (currentMins >= startMins && currentMins <= endMins);
        }
        setIsVisibleTime(active);
    };

    const fetchTopics = async () => {
        if (!subject) return;
        setTopicLoading(true);
        try {
            const res = await api.get(`/topics/subject/${encodeURIComponent(subject)}`);
            setTopics(res.data);
            if (res.data.length > 0) {
                setSelectedTopicId(res.data[0]._id);
            } else {
                setSelectedTopicId('');
            }
        } catch (e) {
            console.error('Failed to fetch topics for subject:', subject, e);
        } finally {
            setTopicLoading(false);
        }
    };

    const startSession = () => {
        setIsSessionActive(true);
        setIsPaused(false);
        setSecondsElapsed(0);
        setStartTimeStamp(new Date().toISOString());
    };

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    const finishSession = async () => {
        if (secondsElapsed < 10 && Platform.OS !== 'web') {
            // Session too short
            resetSession();
            return;
        }

        const minutes = Math.ceil(secondsElapsed / 60);
        const payload = {
            subject,
            durationMinutes: minutes,
            type: 'NightOwl',
            startTime: startTimeStamp,
            endTime: new Date().toISOString(),
            topicId: selectedTopicId || undefined,
            subtopicTitle: subtopicTitle.trim() || undefined
        };

        try {
            await api.post('/focus', payload);
            alert(`🎉 Night session uploaded! Logged ${minutes} minutes of ${subject}.`);
        } catch (error) {
            console.error('Failed to log night owl session:', error);
            alert('⚠️ Failed to save night owl session in database.');
        } finally {
            resetSession();
        }
    };

    const resetSession = () => {
        setIsSessionActive(false);
        setIsPaused(false);
        setSecondsElapsed(0);
        setStartTimeStamp(null);
    };

    // If outside of Night Owl configured time AND no session is actively running, completely hide the widget
    if (!isVisibleTime && !isSessionActive) {
        return null;
    }

    // Format Helper
    const formatTime = (secs: number) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const subjects = ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology', 'Current Affairs', 'Other'];

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: '#0f0c29', // Neon Night Blue/Dark Purple theme
                borderColor: '#5b21b6'     // Royal Purple border
            }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="moon" size={20} color="#a78bfa" style={{ marginRight: 8 }} />
                    <Text style={styles.title}>🌙 Midnight Deep Work Hub</Text>
                </View>
                <TouchableOpacity onPress={() => setShowConfig(!showConfig)} style={styles.settingsBtn}>
                    <Ionicons name="settings-outline" size={18} color="#d1d5db" />
                </TouchableOpacity>
            </View>

            {/* Settings configuration Panel */}
            {showConfig && (
                <View style={styles.settingsPanel}>
                    <Text style={styles.label}>Configure Session Visibility Range:</Text>
                    <View style={styles.row}>
                        {/* Start Time Config */}
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.subLabel}>Starts at (24h format):</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={config.startHour.toString()}
                                    onChangeText={(val) => setConfig(prev => ({ ...prev, startHour: parseInt(val) || 0 }))}
                                />
                                <Text style={styles.colon}>:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={config.startMin.toString()}
                                    onChangeText={(val) => setConfig(prev => ({ ...prev, startMin: parseInt(val) || 0 }))}
                                />
                            </View>
                        </View>

                        {/* End Time Config */}
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.subLabel}>Ends at (24h format):</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={config.endHour.toString()}
                                    onChangeText={(val) => setConfig(prev => ({ ...prev, endHour: parseInt(val) || 0 }))}
                                />
                                <Text style={styles.colon}>:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={config.endMin.toString()}
                                    onChangeText={(val) => setConfig(prev => ({ ...prev, endMin: parseInt(val) || 0 }))}
                                />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => saveSettings(config)} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Save Night owl Schedule</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Active Session Display */}
            {isSessionActive ? (
                <View style={styles.sessionBox}>
                    {/* Active stats display */}
                    <Text style={styles.timerSub}>STUDYING: {subject}</Text>

                    <Text style={styles.timerBig}>
                        {formatTime(secondsElapsed)}
                    </Text>

                    <View style={styles.metaRow}>
                        {selectedTopicId ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    📖 {topics.find(t => t._id === selectedTopicId)?.title || 'Selected Topic'}
                                </Text>
                            </View>
                        ) : null}
                        {subtopicTitle ? (
                            <View style={[styles.badge, { backgroundColor: '#311042' }]}>
                                <Text style={styles.badgeText}>📝 {subtopicTitle}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Action Row */}
                    <View style={[styles.row, { justifyContent: 'center', marginTop: 16 }]}>
                        <TouchableOpacity onPress={togglePause} style={[styles.actionBtn, { backgroundColor: isPaused ? '#10b981' : '#f59e0b' }]}>
                            <Ionicons name={isPaused ? "play" : "pause"} size={18} color="white" />
                            <Text style={styles.actionBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={finishSession} style={[styles.actionBtn, { backgroundColor: '#ef4444', marginLeft: 16 }]}>
                            <Ionicons name="checkmark-circle" size={18} color="white" />
                            <Text style={styles.actionBtnText}>Complete & Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={resetSession} style={[styles.actionBtn, { backgroundColor: '#374151', marginLeft: 16 }]}>
                            <Ionicons name="close-circle" size={18} color="white" />
                            <Text style={styles.actionBtnText}>Discard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* Configuration & Setup of Session */
                <View style={styles.setupPanel}>
                    <Text style={styles.subTitle}>Select Subject and Syllabus Topic to study:</Text>

                    {/* Subject Horizontal Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                        {subjects.map(subj => {
                            const active = subject === subj;
                            return (
                                <TouchableOpacity
                                    key={subj}
                                    onPress={() => setSubject(subj)}
                                    style={[styles.subjTab, active && styles.subjTabActive]}
                                >
                                    <Text style={[styles.subjTabText, active && styles.subjTabTextActive]}>{subj}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Topic Selector */}
                    <Text style={styles.selectLabel}>Select Syllabus Topic:</Text>
                    {topicLoading ? (
                        <Text style={styles.loadingText}>Loading syllabus topics...</Text>
                    ) : topics.length > 0 ? (
                        <View style={styles.selectWrapper}>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#111827',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #374151',
                                    colorScheme: 'dark',
                                    outline: 'none'
                                }}
                                value={selectedTopicId}
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                            >
                                {topics.map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.topicCode ? `[${t.topicCode}] ` : ''}{t.title}
                                    </option>
                                ))}
                            </select>
                        </View>
                    ) : (
                        <Text style={styles.noTopicsText}>No database topics found for this subject.</Text>
                    )}

                    {/* Subtopic free text */}
                    <Text style={styles.selectLabel}>Subtopic Details / Pages (Customizable):</Text>
                    <TextInput
                        style={styles.fullTextInput}
                        placeholder="e.g. Chapter 4 indology notes, read 30 pages"
                        placeholderTextColor="#6b7280"
                        value={subtopicTitle}
                        onChangeText={(val) => setSubtopicTitle(val)}
                    />

                    {/* Start Session Trigger Button */}
                    <TouchableOpacity onPress={startSession} style={styles.startBtn}>
                        <Ionicons name="moon-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.startBtnText}>Start Late Night Session</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#a78bfa',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1b4b',
        paddingBottom: 8,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e9d5ff',
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#a78bfa',
        marginBottom: 8,
    },
    settingsBtn: {
        padding: 4,
    },
    settingsPanel: {
        backgroundColor: '#111827',
        padding: 12,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#374151',
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9ca3af',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    subLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        backgroundColor: '#1f2937',
        color: 'white',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 'bold',
        width: 44,
    },
    colon: {
        color: '#4b5563',
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
    saveBtn: {
        backgroundColor: '#4c1d95',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    setupPanel: {
        marginTop: 4,
    },
    tabsScroll: {
        gap: 8,
        paddingBottom: 8,
    },
    subjTab: {
        backgroundColor: '#1e1b4b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#312e81',
    },
    subjTabActive: {
        backgroundColor: '#4c1d95',
        borderColor: '#a78bfa',
    },
    subjTabText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    subjTabTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    selectLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 10,
        marginBottom: 4,
        fontWeight: '600',
    },
    selectWrapper: {
        backgroundColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#374151',
        overflow: 'hidden',
    },
    loadingText: {
        fontSize: 12,
        color: '#cbd5e1',
        fontStyle: 'italic',
        padding: 6,
    },
    noTopicsText: {
        fontSize: 12,
        color: '#ff8a8a',
        fontStyle: 'italic',
        padding: 6,
    },
    fullTextInput: {
        backgroundColor: '#111827',
        color: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#374151',
        padding: 10,
        fontSize: 13,
    },
    startBtn: {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 16,
    },
    startBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sessionBox: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    timerSub: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#a78bfa',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    timerBig: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        fontVariant: ['tabular-nums'],
        marginVertical: 4,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 6,
    },
    badge: {
        backgroundColor: '#231245',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#a78bfa',
    },
    badgeText: {
        color: '#ddd6fe',
        fontSize: 11,
        fontWeight: '500',
    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 6,
    },
});
