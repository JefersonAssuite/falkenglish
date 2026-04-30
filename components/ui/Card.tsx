import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
  margin?: number;
  onPress?: () => void;
  pressable?: boolean;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  padding = 16,
  margin = 0,
  onPress,
  pressable = false,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      padding,
      margin,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        };
    }
  };

  const cardStyle = [getCardStyle(), style];

  if (onPress || pressable) {
    return (
      <TouchableOpacity onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles can be added here if needed
});

export default Card;
