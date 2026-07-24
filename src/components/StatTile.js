import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function StatTile({ label, value, icon, style, color, children }) {
  const { colors } = useTheme();
  const tileColor = color || colors.primary;
  
  return (
    <View style={[{ backgroundColor: `rgba(${tileColor.replace('#', '')}, 0.15)`, borderRadius: radii.md, padding: 16, minHeight: 100 }, style]}>
      {children}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon && <Ionicons name={icon} size={16} color={tileColor} style={{ marginRight: 6 }} />}
        <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', lineHeight: 20 }} numberOfLines={2}>{value}</Text>
    </View>
  );
}

