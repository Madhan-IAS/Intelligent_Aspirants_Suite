import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const TOTAL_STEPS = 5;

const TARGET_YEARS = [
    { label: 'UPSC CSE 2027', value: 2027 },
    { label: 'UPSC CSE 2028', value: 2028 },
    { label: 'UPSC CSE 2029', value: 2029 },
    { label: 'UPSC CSE 2030+', value: 2030 },
    { label: 'Not decided yet', value: 0 },
];

const ATTEMPT_OPTIONS = [
    { label: '1st Attempt', value: 1 },
    { label: '2nd Attempt', value: 2 },
    { label: '3rd Attempt', value: 3 },
    { label: '4th Attempt', value: 4 },
    { label: '5th Attempt', value: 5 },
    { label: '6th Attempt', value: 6 },
];

const STAGE_OPTIONS = [
    { label: 'Beginner', value: 'Beginner', icon: '🌱', desc: 'Just starting my UPSC journey' },
    { label: 'First Reading', value: 'First Reading', icon: '📖', desc: 'Going through the syllabus for the first time' },
    { label: 'Revision', value: 'Revision', icon: '🔄', desc: 'Revising and consolidating knowledge' },
    { label: 'Test Phase', value: 'Test Phase', icon: '📝', desc: 'Focusing on mock tests and answer writing' },
    { label: 'Interview', value: 'Interview', icon: '🎤', desc: 'Preparing for the Personality Test' },
];

const POPULAR_OPTIONALS = [
    'Political Science & International Relations',
    'Anthropology',
    'Sociology',
    'Geography',
];

const OTHER_OPTIONALS = [
    'Mathematics', 'History', 'Public Administration', 'Philosophy',
    'Economics', 'Law', 'Commerce & Accountancy', 'Psychology',
    'Medical Science', 'Mechanical Engineering', 'Physics',
    'Electrical Engineering', 'Chemistry', 'Civil Engineering',
    'Agriculture', 'Management', 'Zoology',
    'Animal Husbandry & Veterinary Science', 'Botany', 'Geology', 'Statistics',
];

const LITERATURE_OPTIONALS = [
    'Hindi Literature', 'English Literature', 'Telugu Literature', 'Tamil Literature',
    'Kannada Literature', 'Malayalam Literature', 'Marathi Literature', 'Gujarati Literature',
    'Bengali Literature', 'Punjabi Literature', 'Sanskrit Literature', 'Urdu Literature',
    'Assamese Literature', 'Bodo Literature', 'Dogri Literature', 'Kashmiri Literature',
    'Konkani Literature', 'Maithili Literature', 'Manipuri Literature', 'Nepali Literature',
    'Odia Literature', 'Pali Literature', 'Persian Literature', 'Santhali Literature',
    'Sindhi Literature',
];

const DAILY_HOURS = [4, 6, 8, 10, 12, 14, 16];
const SESSION_OPTIONS = ['Morning', 'Afternoon', 'Night'];

export default function Onboarding() {
    const router = useRouter();
    const { updateProfile, user } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    // Form state
    const [targetYear, setTargetYear] = useState<number>(2027);
    const [attemptNumber, setAttemptNumber] = useState<number>(1);
    const [examStage, setExamStage] = useState<string>('Beginner');
    const [optionalSubject, setOptionalSubject] = useState<string>('');
    const [dailyHours, setDailyHours] = useState<number>(10);
    const [preferredSession, setPreferredSession] = useState<string>('Morning');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLiterature, setShowLiterature] = useState(false);

    const bg = isDark ? '#111827' : '#f3f4f6';
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    const border = isDark ? '#374151' : '#e5e7eb';
    const textPrimary = isDark ? 'white' : '#111827';
    const textSecondary = isDark ? '#9ca3af' : '#6b7280';

    const canProceed = () => {
        if (step === 1) return targetYear > 0 || targetYear === 0;
        if (step === 2) return attemptNumber >= 1;
        if (step === 3) return !!examStage;
        if (step === 4) return !!optionalSubject;
        return true;
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            await updateProfile({
                targetAttempt: targetYear || undefined,
                attemptNumber,
                examStage,
                optionalSubject,
                dailyTargetHours: dailyHours,
                studyPreferences: { preferredSession, answerWriting: 'Daily', mockTest: 'Sunday' },
                onboardingComplete: true
            });
            router.replace('/');
        } catch (error) {
            console.error('Onboarding save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const filteredOther = searchQuery
        ? OTHER_OPTIONALS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : OTHER_OPTIONALS;
    const filteredLiterature = searchQuery
        ? LITERATURE_OPTIONALS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : LITERATURE_OPTIONALS;
    const filteredPopular = searchQuery
        ? POPULAR_OPTIONALS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : POPULAR_OPTIONALS;

    const renderOptionalItem = (subject: string) => {
        const isSelected = optionalSubject === subject;
        return (
            <TouchableOpacity
                key={subject}
                onPress={() => setOptionalSubject(subject)}
                style={{
                    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8,
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : (isDark ? '#111827' : '#f9fafb'),
                    borderWidth: 1.5, borderColor: isSelected ? '#3b82f6' : border,
                }}
            >
                <View style={{
                    width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12,
                    borderColor: isSelected ? '#3b82f6' : (isDark ? '#4b5563' : '#d1d5db'),
                    backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: isSelected ? 'bold' : '500' }}>{subject}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

                {/* Progress Bar */}
                <View style={{ width: '100%', maxWidth: 560, marginBottom: 32, marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ color: textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Step {step} of {TOTAL_STEPS}
                        </Text>
                        <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>
                            {Math.round((step / TOTAL_STEPS) * 100)}%
                        </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: '#3b82f6', borderRadius: 3 }} />
                    </View>
                    {/* Step Dots */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={{
                                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                                backgroundColor: i <= step ? '#3b82f6' : (isDark ? '#374151' : '#d1d5db'),
                            }} />
                        ))}
                    </View>
                </View>

                {/* Card Container */}
                <View style={{ width: '100%', maxWidth: 560, backgroundColor: cardBg, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: border, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>

                    {/* ====== STEP 1: TARGET YEAR ====== */}
                    {step === 1 && (
                        <View>
                            <Text style={{ fontSize: 28, marginBottom: 6 }}>🎯</Text>
                            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Which year are you aiming for?</Text>
                            <Text style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}>We'll align your preparation timeline accordingly.</Text>
                            <View style={{ gap: 10 }}>
                                {TARGET_YEARS.map(opt => {
                                    const isSelected = targetYear === opt.value;
                                    return (
                                        <TouchableOpacity key={opt.value} onPress={() => setTargetYear(opt.value)} style={{
                                            padding: 16, borderRadius: 14, borderWidth: 1.5,
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : (isDark ? '#111827' : '#f9fafb'),
                                            borderColor: isSelected ? '#3b82f6' : border,
                                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <Text style={{ color: textPrimary, fontSize: 16, fontWeight: isSelected ? 'bold' : '500' }}>{opt.label}</Text>
                                            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 2: ATTEMPT NUMBER ====== */}
                    {step === 2 && (
                        <View>
                            <Text style={{ fontSize: 28, marginBottom: 6 }}>📊</Text>
                            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Which attempt are you preparing for?</Text>
                            <Text style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}>This helps us calibrate the intensity of your study plan.</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {ATTEMPT_OPTIONS.map(opt => {
                                    const isSelected = attemptNumber === opt.value;
                                    return (
                                        <TouchableOpacity key={opt.value} onPress={() => setAttemptNumber(opt.value)} style={{
                                            flex: 1, minWidth: 140, padding: 16, borderRadius: 14, borderWidth: 1.5, alignItems: 'center',
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : (isDark ? '#111827' : '#f9fafb'),
                                            borderColor: isSelected ? '#3b82f6' : border,
                                        }}>
                                            <Text style={{ color: textPrimary, fontSize: 16, fontWeight: isSelected ? 'bold' : '500' }}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 3: PREPARATION STAGE ====== */}
                    {step === 3 && (
                        <View>
                            <Text style={{ fontSize: 28, marginBottom: 6 }}>📍</Text>
                            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Where are you in your preparation?</Text>
                            <Text style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}>We'll tailor features and recommendations to your current stage.</Text>
                            <View style={{ gap: 10 }}>
                                {STAGE_OPTIONS.map(opt => {
                                    const isSelected = examStage === opt.value;
                                    return (
                                        <TouchableOpacity key={opt.value} onPress={() => setExamStage(opt.value)} style={{
                                            padding: 16, borderRadius: 14, borderWidth: 1.5,
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : (isDark ? '#111827' : '#f9fafb'),
                                            borderColor: isSelected ? '#3b82f6' : border,
                                            flexDirection: 'row', alignItems: 'center',
                                        }}>
                                            <Text style={{ fontSize: 24, marginRight: 14 }}>{opt.icon}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: textPrimary, fontSize: 16, fontWeight: isSelected ? 'bold' : '500' }}>{opt.label}</Text>
                                                <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>{opt.desc}</Text>
                                            </View>
                                            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 4: OPTIONAL SUBJECT ====== */}
                    {step === 4 && (
                        <View>
                            <Text style={{ fontSize: 28, marginBottom: 6 }}>📚</Text>
                            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Select your Optional Subject</Text>
                            <Text style={{ color: textSecondary, fontSize: 13, marginBottom: 16 }}>Most selected optionals are shown first.</Text>

                            {/* Search */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: border, paddingHorizontal: 12, marginBottom: 20 }}>
                                <Ionicons name="search" size={18} color={textSecondary} />
                                <TextInput
                                    style={{ flex: 1, color: textPrimary, padding: 12, outlineStyle: Platform.OS === 'web' ? 'none' : undefined } as any}
                                    placeholder="Search subjects..."
                                    placeholderTextColor={textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery ? (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={18} color={textSecondary} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {/* Popular */}
                            {filteredPopular.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <Text style={{ fontSize: 14 }}>🔥</Text>
                                        <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Popular</Text>
                                    </View>
                                    {filteredPopular.map(renderOptionalItem)}
                                </View>
                            )}

                            {/* Other Subjects */}
                            {filteredOther.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ color: textSecondary, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Other Subjects</Text>
                                    {filteredOther.map(renderOptionalItem)}
                                </View>
                            )}

                            {/* Literature (Expandable) */}
                            {(!searchQuery || filteredLiterature.length > 0) && (
                                <View style={{ marginBottom: 20 }}>
                                    <TouchableOpacity onPress={() => setShowLiterature(!showLiterature)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={{ fontSize: 14 }}>📖</Text>
                                            <Text style={{ color: textSecondary, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Literature ({filteredLiterature.length})</Text>
                                        </View>
                                        <Ionicons name={showLiterature ? 'chevron-up' : 'chevron-down'} size={18} color={textSecondary} />
                                    </TouchableOpacity>
                                    {(showLiterature || searchQuery) && filteredLiterature.map(renderOptionalItem)}
                                </View>
                            )}

                            {/* Not Decided */}
                            <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 16 }}>
                                {renderOptionalItem('Not decided yet')}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 5: STUDY PREFERENCES ====== */}
                    {step === 5 && (
                        <View>
                            <Text style={{ fontSize: 28, marginBottom: 6 }}>⚙️</Text>
                            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Study Preferences</Text>
                            <Text style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}>You can always change these later in Settings.</Text>

                            {/* Daily Hours */}
                            <Text style={{ color: textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>How many hours can you study daily?</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                                {DAILY_HOURS.map(h => {
                                    const isSelected = dailyHours === h;
                                    return (
                                        <TouchableOpacity key={h} onPress={() => setDailyHours(h)} style={{
                                            paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : (isDark ? '#111827' : '#f9fafb'),
                                            borderColor: isSelected ? '#3b82f6' : border,
                                        }}>
                                            <Text style={{ color: isSelected ? '#3b82f6' : textPrimary, fontWeight: isSelected ? 'bold' : '500', fontSize: 15 }}>{h}h</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Preferred Session */}
                            <Text style={{ color: textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>When do you study best?</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {SESSION_OPTIONS.map(s => {
                                    const isSelected = preferredSession === s;
                                    const icon = s === 'Morning' ? '☀️' : s === 'Afternoon' ? '🌤️' : '🌙';
                                    return (
                                        <TouchableOpacity key={s} onPress={() => setPreferredSession(s)} style={{
                                            flex: 1, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, alignItems: 'center',
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : (isDark ? '#111827' : '#f9fafb'),
                                            borderColor: isSelected ? '#3b82f6' : border,
                                        }}>
                                            <Text style={{ fontSize: 22, marginBottom: 4 }}>{icon}</Text>
                                            <Text style={{ color: isSelected ? '#3b82f6' : textPrimary, fontWeight: isSelected ? 'bold' : '500', fontSize: 14 }}>{s}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>

                {/* Navigation Buttons */}
                <View style={{ width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                    {step > 1 ? (
                        <TouchableOpacity onPress={() => setStep(step - 1)} style={{
                            flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
                            backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderWidth: 1, borderColor: border,
                        }}>
                            <Text style={{ color: textPrimary, fontWeight: 'bold', fontSize: 16 }}>← Back</Text>
                        </TouchableOpacity>
                    ) : <View style={{ flex: 1 }} />}

                    {step < TOTAL_STEPS ? (
                        <TouchableOpacity
                            onPress={() => { if (canProceed()) setStep(step + 1); }}
                            disabled={!canProceed()}
                            style={{
                                flex: 2, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
                                backgroundColor: canProceed() ? '#3b82f6' : (isDark ? '#374151' : '#d1d5db'),
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Continue →</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleFinish}
                            disabled={saving}
                            style={{
                                flex: 2, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
                                backgroundColor: saving ? '#1e40af' : '#10b981', flexDirection: 'row', justifyContent: 'center', gap: 8
                            }}
                        >
                            {saving ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="rocket" size={20} color="white" />}
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{saving ? 'Personalizing...' : 'Launch My Dashboard 🚀'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Skip for Step 5 */}
                {step === 5 && (
                    <TouchableOpacity onPress={handleFinish} style={{ marginTop: 16 }}>
                        <Text style={{ color: textSecondary, fontSize: 13 }}>Skip for now →</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </View>
    );
}
