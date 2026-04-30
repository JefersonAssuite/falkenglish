import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120,
    };

    // Size styles
    switch (size) {
      case 'sm':
        return {
          ...baseStyle,
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 36,
        };
      case 'lg':
        return {
          ...baseStyle,
          paddingHorizontal: 24,
          paddingVertical: 16,
          minHeight: 52,
        };
      default:
        return {
          ...baseStyle,
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 44,
        };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#64748b',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#2196f3',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: '#2196f3',
        };
    }
  };

  const getDisabledStyle = (): ViewStyle => {
    if (disabled) {
      return {
        opacity: 0.5,
        backgroundColor: variant === 'outline' ? 'transparent' : '#9ca3af',
      };
    }
    return {};
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
    };

    const variantTextStyle: TextStyle = {
      color: variant === 'outline' || variant === 'ghost' ? '#2196f3' : '#ffffff',
    };

    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        getVariantStyle(),
        getDisabledStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <Text style={getTextStyle()}>Carregando...</Text>
      ) : (
        <Text style={getTextStyle()}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Styles can be added here if needed
});

export default Button;
