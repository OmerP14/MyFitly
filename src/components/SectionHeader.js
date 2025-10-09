import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SectionHeader({ title, subtitle, right }) {
  const { colors } = useTheme();
  
  return (
    <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.textMuted, marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {right || null}
    </View>
  );
}

