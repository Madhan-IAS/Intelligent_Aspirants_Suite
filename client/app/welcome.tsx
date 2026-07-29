import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { mode } = useTheme();
  const { user } = useAuth();
  const isDark = mode === 'dark';

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If user is already logged in, redirect to Dashboard immediately
    if (user) {
      router.replace('/');
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto navigate to login page after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [user]);

  const handlePress = () => {
    router.replace('/login');
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      onPress={handlePress}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0b0f17' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {/* Rounded Center Logo Container */}
        <View 
          style={{
            width: 220,
            height: 220,
            borderRadius: 48,
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
            marginBottom: 40,
          }}
        >
          <Image 
            source={require('../assets/ias_logo.png')} 
            style={{ width: 170, height: 170, resizeMode: 'contain' }}
          />
        </View>

        {/* Title */}
        <Text 
          style={{
            color: isDark ? '#ffffff' : '#000000',
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          IAS — Intelligent Aspirant's Suite
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
