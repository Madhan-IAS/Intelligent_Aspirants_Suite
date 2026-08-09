import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

export default function NotFoundScreen() {
    const router = useRouter();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Page Not Found</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                The page you're looking for doesn't exist or has been moved.
            </Text>
            <TouchableOpacity
                onPress={() => router.replace('/')}
                style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
                <Ionicons name="home" size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Go to Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}
