import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="warning" size={64} color="#ef4444" style={styles.icon} />
                    <Text style={styles.title}>Oops! Something went wrong.</Text>
                    <Text style={styles.message}>
                        We've encountered an unexpected error. Our team has been notified.
                    </Text>
                    {this.state.error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => window.location.reload()}
                    >
                        <Text style={styles.buttonText}>Reload Application</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#111827',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        maxWidth: 400,
        marginBottom: 24,
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
        marginBottom: 24,
        maxWidth: 500,
        width: '100%',
    },
    errorText: {
        color: '#fca5a5',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    icon: {
        marginBottom: 8,
    },
});
