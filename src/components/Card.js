import React from 'react';
import { View } from 'react-native';
import { radii } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Card({ style, children }) {
  const { colors } = useTheme();
  
  return (
    <View style={[{ 
      backgroundColor: colors.card, 
      borderRadius: radii.lg, 
      padding: 16,
      // Beyaz temada gölge ekle
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
      shadowRadius: 4,
      elevation: colors.background === '#FFFFFF' ? 2 : 0
    }, style]}>
      {children}
    </View>
  );
}

