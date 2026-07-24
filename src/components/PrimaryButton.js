import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii } from '../theme/colors';

export default function PrimaryButton({ title, icon, onPress, style, variant = 'primary' }) {
  const getGradientColors = () => {
    switch (variant) {
      case 'success':
        return ['#00D084', '#00B37A'];
      case 'warning':
        return ['#FFD700', '#FFC107'];
      case 'danger':
        return ['#FF4757', '#E53E3E'];
      case 'info':
        return ['#00C6FF', '#0099CC'];
      case 'purple':
        return ['#9B59B6', '#8E44AD'];
      case 'pink':
        return ['#E91E63', '#C2185B'];
      default:
        return [colors.primary, colors.primaryAlt];
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[{ borderRadius: radii.md, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }, style]}>
      <LinearGradient colors={getGradientColors()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
        {icon}
        <Text style={{ color: '#1E1E2F', fontWeight: '800', marginLeft: icon ? 8 : 0, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

