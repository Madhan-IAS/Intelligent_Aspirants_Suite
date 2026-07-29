import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  targetAttempt?: number;
  optionalSubject?: string;
  dailyTargetHours?: number;
  preferredRevisionPattern?: string;
  examStage?: string;
  theme?: string;
  studyPreferences?: any;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, userData: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/profile');
        setUser(res.data);
      }
    } catch (error) {
      console.log('No valid session found');
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: UserProfile) => {
    await AsyncStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.replace('/login');
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
