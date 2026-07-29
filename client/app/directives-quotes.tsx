import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function DirectivesQuotesHub() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [activeTab, setActiveTab] = useState<'directives' | 'quotes' | 'cheat_sheet'>('directives');
  
  // Directives states
  const [directives, setDirectives] = useState<any[]>([]);
  const [expandedDirective, setExpandedDirective] = useState<string | null>(null);
  const [directivesSearch, setDirectivesSearch] = useState('');

  // Quotes states
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Polity');
  const [quotesSearch, setQuotesSearch] = useState('');
  const [quotesLoading, setQuotesLoading] = useState(false);

  const categories = ['Polity', 'International Relations', 'Economy', 'Social Issues', 'Environment', 'Security', 'Ethics'];

  useEffect(() => {
    fetchDirectives();
    fetchQuotes(selectedCategory);
  }, []);

  const fetchDirectives = async () => {
    try {
      const res = await api.get('/directives');
      setDirectives(res.data);
    } catch (error) {
      console.error('Error fetching directives:', error);
    }
  };

  const fetchQuotes = async (cat: string) => {
    try {
      setQuotesLoading(true);
      const res = await api.get(`/quotes?category=${encodeURIComponent(cat)}`);
      setQuotes(res.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchQuotes(cat);
  };

  const getDepthColor = (depth: string) => {
    const d = depth.toLowerCase();
    if (d.includes('very high')) return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
    if (d.includes('high')) return { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: 'rgba(249, 115, 22, 0.4)' };
    if (d.includes('medium')) return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
    return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
  };

  const filteredDirectives = directives.filter((d: any) =>
    d.name.toLowerCase().includes(directivesSearch.toLowerCase()) ||
    d.definition.toLowerCase().includes(directivesSearch.toLowerCase())
  );

  const filteredQuotes = quotes.filter((q: any) =>
    q.text.toLowerCase().includes(quotesSearch.toLowerCase())
  );

  const sdgs = [
    { number: 1, name: 'No Poverty', subjects: 'GS2 Social Issues, GS3 Economy', conclusion: 'This initiative strengthens poverty alleviation and social equity, supporting SDG 1.' },
    { number: 2, name: 'Zero Hunger', subjects: 'GS2 Health & Nutrition, GS3 Agriculture', conclusion: 'The scheme ensures food security and nutritional well-being, aligning with SDG 2.' },
    { number: 3, name: 'Good Health & Well-being', subjects: 'GS2 Health Policies, GS3 Health Sector', conclusion: 'It promotes accessible and quality healthcare for all, fulfilling SDG 3.' },
    { number: 4, name: 'Quality Education', subjects: 'GS2 Education, GS3 Human Capital', conclusion: 'This reform advances inclusive and equitable education, in line with SDG 4.' },
    { number: 5, name: 'Gender Equality', subjects: 'GS2 Women & Child, GS3 Governance', conclusion: 'It empowers women and fosters gender justice, contributing to SDG 5.' },
    { number: 6, name: 'Clean Water & Sanitation', subjects: 'GS3 Environment, Water Resources', conclusion: 'The policy ensures sustainable water access and sanitation, supporting SDG 6.' },
    { number: 7, name: 'Affordable & Clean Energy', subjects: 'GS3 Energy, Infrastructure', conclusion: 'It strengthens clean energy access, promoting SDG 7.' },
    { number: 8, name: 'Decent Work & Economic Growth', subjects: 'GS3 Economy, Employment', conclusion: 'The initiative fosters employment and sustainable economic growth, aligned with SDG 8.' },
    { number: 9, name: 'Industry, Innovation & Infrastructure', subjects: 'GS3 Economy, Science & Tech', conclusion: 'It builds resilient infrastructure and innovation-led development, supporting SDG 9.' },
    { number: 10, name: 'Reduced Inequalities', subjects: 'GS2 Social Justice, GS3 Economy', conclusion: 'The measure reduces disparities and promotes social inclusion, in line with SDG 10.' },
    { number: 11, name: 'Sustainable Cities & Communities', subjects: 'GS3 Urban Development, Environment', conclusion: 'It advances inclusive, safe, and sustainable urbanization, fulfilling SDG 11.' },
    { number: 12, name: 'Responsible Consumption & Production', subjects: 'GS3 Environment, Industry', conclusion: 'The policy promotes sustainable production and consumption patterns, contributing to SDG 12.' },
    { number: 13, name: 'Climate Action', subjects: 'GS3 Environment, Disaster Mgmt, IR', conclusion: 'It mitigates climate risks and promotes environmental resilience, aligned with SDG 13.' },
    { number: 14, name: 'Life Below Water', subjects: 'GS3 Environment, Fisheries', conclusion: 'The initiative conserves marine ecosystems and sustainable fisheries, supporting SDG 14.' },
    { number: 15, name: 'Life on Land', subjects: 'GS3 Environment, Forests, Agriculture', conclusion: 'It protects terrestrial ecosystems and biodiversity, in line with SDG 15.' },
    { number: 16, name: 'Peace, Justice & Strong Institutions', subjects: 'GS2 Polity, Governance', conclusion: 'It strengthens institutions and ensures justice and rule of law, fulfilling SDG 16.' },
    { number: 17, name: 'Partnerships for the Goals', subjects: 'GS2 International Relations', conclusion: 'It enhances global and national partnerships for sustainable development, supporting SDG 17.' }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={{ marginBottom: 32, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>UPSC Mains Booster</Text>
          <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 24, fontWeight: 'bold' }}>Directives & Quotes Hub</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1f2937' : '#e5e7eb', padding: 4, borderRadius: 12, marginBottom: 24 }}>
        <TouchableOpacity onPress={() => setActiveTab('directives')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'directives' ? (isDark ? '#374151' : '#ffffff') : 'transparent', borderRadius: 8 }}>
          <Text style={{ color: activeTab === 'directives' ? (isDark ? 'white' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold' }}>Directives & Skeletons</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('quotes')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'quotes' ? (isDark ? '#374151' : '#ffffff') : 'transparent', borderRadius: 8 }}>
          <Text style={{ color: activeTab === 'quotes' ? (isDark ? 'white' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold' }}>Subject Quotes Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('cheat_sheet')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'cheat_sheet' ? (isDark ? '#374151' : '#ffffff') : 'transparent', borderRadius: 8 }}>
          <Text style={{ color: activeTab === 'cheat_sheet' ? (isDark ? 'white' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'), fontWeight: 'bold' }}>Cheat Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR (Only for Directives and Quotes tabs) */}
      {activeTab !== 'cheat_sheet' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1f2937' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, marginBottom: 24 }}>
          <Ionicons name="search" size={20} color={isDark ? '#6b7280' : '#9ca3af'} style={{ marginRight: 12 }} />
          <TextInput
            placeholder={activeTab === 'directives' ? "Search directives..." : "Search quotes..."}
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ flex: 1, color: isDark ? 'white' : '#111827', paddingVertical: 12, fontSize: 16, outlineStyle: 'none' } as any}
            value={activeTab === 'directives' ? directivesSearch : quotesSearch}
            onChangeText={activeTab === 'directives' ? setDirectivesSearch : setQuotesSearch}
          />
        </View>
      )}

      {/* TAB CONTENTS */}

      {/* 1. Directives Tab */}
      {activeTab === 'directives' && (
        <View style={{ gap: 16 }}>
          {filteredDirectives.map((d: any) => {
            const isExpanded = expandedDirective === d._id;
            const colors = getDepthColor(d.depth);
            
            return (
              <View key={d._id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setExpandedDirective(isExpanded ? null : d._id)} style={{ padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                      <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>{d.name}</Text>
                      <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.text, fontSize: 10, fontWeight: 'bold' }}>{d.depth} Depth</Text>
                      </View>
                    </View>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14 }}>{d.definition}</Text>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ padding: 18, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#e5e7eb', backgroundColor: isDark ? '#1a2333' : '#f9fafb' }}>
                    <View style={{ gap: 14 }}>
                      <View>
                        <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Introduction (20%)</Text>
                        <Text style={{ color: isDark ? 'white' : '#374151', lineHeight: 20 }}>{d.structure?.intro}</Text>
                      </View>
                      <View>
                        <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Body (60%)</Text>
                        <Text style={{ color: isDark ? 'white' : '#374151', lineHeight: 20 }}>{d.structure?.body}</Text>
                      </View>
                      <View>
                        <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Conclusion (20%)</Text>
                        <Text style={{ color: isDark ? 'white' : '#374151', lineHeight: 20 }}>{d.structure?.conclusion}</Text>
                      </View>
                      <View style={{ backgroundColor: isDark ? '#1f2937' : '#eff6ff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#bfdbfe', marginTop: 4 }}>
                        <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Smart Value-Add</Text>
                        <Text style={{ color: isDark ? '#d1d5db' : '#1e3a8a', fontSize: 13 }}>{d.smartAddon}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* 2. Quotes Tab */}
      {activeTab === 'quotes' && (
        <View>
          {/* Categories Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 24, paddingBottom: 4 }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleCategorySelect(cat)}
                  style={{
                    backgroundColor: isActive ? '#2563eb' : (isDark ? '#1f2937' : '#ffffff'),
                    borderWidth: 1,
                    borderColor: isActive ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20
                  }}
                >
                  <Text style={{ color: isActive ? 'white' : (isDark ? '#d1d5db' : '#4b5563'), fontWeight: 'bold' }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {quotesLoading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : (
            <View style={{ gap: 16 }}>
              {filteredQuotes.map((q: any) => (
                <View key={q._id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', position: 'relative' }}>
                  <View style={{ position: 'absolute', top: 12, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: isDark ? '#374151' : '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, fontWeight: 'bold' }}>#{q.index}</Text>
                  </View>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, lineHeight: 26, fontFamily: 'serif', paddingRight: 32 }}>
                    "{q.text}"
                  </Text>
                  <Text style={{ color: '#2563eb', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12 }}>
                    Subject: {q.category}
                  </Text>
                </View>
              ))}

              {filteredQuotes.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Text style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>No quotes matched your search.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* 3. Cheat Sheet Tab */}
      {activeTab === 'cheat_sheet' && (
        <View style={{ gap: 28 }}>
          {/* Universal Format Section */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="star" size={24} color="#f59e0b" style={{ marginRight: 10 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Universal Answer Structure</Text>
            </View>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', borderLeftWidth: 3, borderLeftColor: '#2563eb', paddingLeft: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 14 }}>Introduction (20%)</Text>
                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', marginTop: 2 }}>Definition of core concept, baseline data/stats, or a recent current affairs context hook.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', borderLeftWidth: 3, borderLeftColor: '#f59e0b', paddingLeft: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 14 }}>Body Section (60%)</Text>
                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', marginTop: 2 }}>Divide into subheadings (e.g. Pros vs Cons, Challenges, Causes & Effects). Use bullet points, case studies, and schemas.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', borderLeftWidth: 3, borderLeftColor: '#10b981', paddingLeft: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 14 }}>Conclusion (20%)</Text>
                  <Text style={{ color: isDark ? '#d1d5db' : '#4b5563', marginTop: 2 }}>Balanced judgment + future way forward + value-add SDG or Constitutional value reference.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Score Maximizer */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="rocket" size={24} color="#2563eb" style={{ marginRight: 10 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Quick Value-Add Map</Text>
            </View>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', paddingBottom: 8 }}>
                <Text style={{ color: isDark ? 'white' : '#374151', fontWeight: '500', flex: 1 }}>Maps (India/World)</Text>
                <Text style={{ color: '#2563eb', fontSize: 13, flex: 2, textAlign: 'right' }}>Geography, IR, Disaster Management, Security</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', paddingBottom: 8 }}>
                <Text style={{ color: isDark ? 'white' : '#374151', fontWeight: '500', flex: 1 }}>Data & Reports</Text>
                <Text style={{ color: '#2563eb', fontSize: 13, flex: 2, textAlign: 'right' }}>NITI Aayog, NCRB, WHO, Economic Survey</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#e5e7eb', paddingBottom: 8 }}>
                <Text style={{ color: isDark ? 'white' : '#374151', fontWeight: '500', flex: 1 }}>Articles & Laws</Text>
                <Text style={{ color: '#2563eb', fontSize: 13, flex: 2, textAlign: 'right' }}>Polity, Rights, Federalism, Basic Structure</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4 }}>
                <Text style={{ color: isDark ? 'white' : '#374151', fontWeight: '500', flex: 1 }}>Judgments (SC Cases)</Text>
                <Text style={{ color: '#2563eb', fontSize: 13, flex: 2, textAlign: 'right' }}>Fundamental Rights, Landmark Constitutional cases</Text>
              </View>
            </View>
          </View>

          {/* SDG Cheat Sheet */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="globe" size={24} color="#10b981" style={{ marginRight: 10 }} />
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>SDG Reference Cheat Sheet</Text>
            </View>
            
            <View style={{ gap: 16 }}>
              {sdgs.map((sdg) => (
                <View key={sdg.number} style={{ padding: 12, backgroundColor: isDark ? '#111827' : '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{sdg.number}</Text>
                    </View>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 14 }}>{sdg.name}</Text>
                  </View>
                  <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{sdg.subjects}</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#4b5563', fontStyle: 'italic', fontSize: 13 }}>
                    "{sdg.conclusion}"
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

    </ScrollView>
  );
}
