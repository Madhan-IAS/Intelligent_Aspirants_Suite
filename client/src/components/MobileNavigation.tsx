import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, ScrollView, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function MobileNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === 'android' 
    ? (StatusBar.currentHeight || insets.top || 24) + 6 
    : (insets.top || 12);

  return (
    <>
      {/* Top Mobile Header Navigation Bar */}
      <View 
        style={[
          styles.topHeader, 
          { 
            backgroundColor: isDark ? '#111827' : '#ffffff', 
            borderColor: isDark ? '#1f2937' : '#e5e7eb',
            paddingTop: topPadding,
            paddingBottom: 10,
            paddingHorizontal: 16,
          }
        ]}
      >
        {/* Logo & Brand Name */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image 
            source={require('../../assets/ias_logo.png')} 
            style={{ width: 36, height: 36, marginRight: 10 }} 
            resizeMode="contain"
          />
          <Text style={{ color: isDark ? '#ffffff' : '#111827', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 }}>
            IAS
          </Text>
        </View>

        {/* Hamburger Menu Button */}
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
          style={[
            styles.menuButton, 
            { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderColor: isDark ? '#374151' : '#e5e7eb' }
          ]}
        >
          <Ionicons name="menu" size={24} color={isDark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Full Screen Navigation Drawer Modal */}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setDrawerOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#ffffff' }}>
          {/* Drawer Top Bar */}
          <View style={[styles.drawerHeader, { borderColor: isDark ? '#1f2937' : '#e5e7eb', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require('../../assets/ias_logo.png')} 
                style={{ width: 36, height: 36, marginRight: 10 }} 
                resizeMode="contain"
              />
              <Text style={[styles.drawerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                IAS Navigator
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDrawerOpen(false)}
              style={[styles.closeButton, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}
            >
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#111827'} />
            </TouchableOpacity>
          </View>

          {/* Drawer Scrollable Content */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 100,
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
});
