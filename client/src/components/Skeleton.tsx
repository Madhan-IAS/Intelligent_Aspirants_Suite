import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
}

export default function Skeleton({ width = '100%', height = 20, style, borderRadius = 4 }: SkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7]
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                    opacity,
                    borderRadius,
                },
                style
            ]}
        />
    );
}
