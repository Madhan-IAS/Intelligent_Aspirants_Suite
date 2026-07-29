import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBackendURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Automatically extract host IP from Expo hostUri on physical mobile devices
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const ip = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${ip}:5000/api`;
};

const API_URL = getBackendURL();

console.log('📡 API Base URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
