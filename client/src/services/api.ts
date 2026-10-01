import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getBackendURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:5000/api`;
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto-retry network errors / 5xx up to 2 times
    const isNetworkError = !error.response || error.response.status >= 500;
    if (isNetworkError && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (isNetworkError && originalRequest && originalRequest._retryCount < 2) {
      originalRequest._retryCount += 1;
      console.log(`🌐 Network error. Retrying request... (${originalRequest._retryCount}/2)`);
      return new Promise((resolve) => setTimeout(() => resolve(api(originalRequest)), 1000));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        await AsyncStorage.setItem('token', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        if (Platform.OS === 'web') {
          window.dispatchEvent(new Event('FORCE_LOGOUT'));
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.code === 'LIMIT_REACHED') {
      if (Platform.OS === 'web') {
        window.dispatchEvent(new CustomEvent('LIMIT_REACHED', { detail: error.response.data.message }));
      } else {
        alert(error.response.data.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
