import React from 'react';
import { View } from 'react-native';
import { radii } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Card({ style, children, variant = 'default' }) {
  const { colors } = useTheme();
  
  // Kart varyantlarına göre stil
  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.card, 
      borderRadius: radii.lg, 
      padding: 16,
      // Modern border ve gölge
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    };

    switch (variant) {
      case 'highlighted':
        return {
          ...baseStyle,
          backgroundColor: colors.cardTertiary,
          borderColor: colors.borderMedium,
          borderWidth: 2
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.cardSecondary,
          borderColor: colors.borderLight
        };
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.highlightBg,
          borderColor: colors.borderMedium,
          borderWidth: 2
        };
      default:
        return baseStyle;
    }
  };
  
  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}

