import React from 'react';
import { View, ViewStyle } from 'react-native';

interface VStackProps {
  children: React.ReactNode;
  space?: number;
  style?: ViewStyle;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

export function VStack({
  children,
  space = 0,
  style,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
}: VStackProps) {
  const getStackStyle = (): ViewStyle => {
    return {
      flexDirection: 'column',
      alignItems,
      justifyContent,
    };
  };

  const renderChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return null;
      
      const childStyle = index > 0 ? { marginTop: space } : {};
      
      return React.cloneElement(child, {
        style: [child.props.style, childStyle],
      });
    });
  };

  return (
    <View style={[getStackStyle(), style]}>
      {renderChildren()}
    </View>
  );
}

export default VStack;
