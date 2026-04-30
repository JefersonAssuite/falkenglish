import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface HStackProps {
  children: React.ReactNode;
  space?: number;
  style?: ViewStyle;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

export function HStack({
  children,
  space = 0,
  style,
  alignItems = 'center',
  justifyContent = 'flex-start',
}: HStackProps) {
  const getStackStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems,
      justifyContent,
    };
  };

  return (
    <View style={[getStackStyle(), style]}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const childStyle = index > 0 ? { marginLeft: space } : {};
        
        return React.cloneElement(child, {
          style: Array.isArray(child.props.style) 
            ? [...child.props.style, childStyle]
            : child.props.style 
              ? [child.props.style, childStyle]
              : childStyle,
        });
      })}
    </View>
  );
}

export default HStack;
