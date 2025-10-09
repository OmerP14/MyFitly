import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function MiniChart({ trend, color }) {
  const { colors } = useTheme();
  
  const getTrendIcon = () => {
    if (trend > 0) return 'arrow-up';
    if (trend < 0) return 'arrow-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend > 0) return '#00D084';
    if (trend < 0) return '#FF4757';
    return colors.textMuted;
  };

  const getTrendBgColor = () => {
    if (trend > 0) return 'rgba(0, 208, 132, 0.15)';
    if (trend < 0) return 'rgba(255, 71, 87, 0.15)';
    return 'rgba(255, 255, 255, 0.15)';
  };

  return (
    <View style={{ 
      position: 'absolute', 
      top: 6, 
      right: 6, 
      backgroundColor: getTrendBgColor(),
      borderRadius: 6, 
      paddingHorizontal: 4, 
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: getTrendColor(),
      minWidth: 28,
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      zIndex: 10
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons 
          name={getTrendIcon()} 
          size={7} 
          color={getTrendColor()} 
          style={{ marginRight: 1 }} 
        />
        <Text style={{ 
          color: getTrendColor(), 
          fontSize: 7, 
          fontWeight: '700' 
        }}>
          {Math.abs(trend)}%
        </Text>
      </View>
    </View>
  );
}
