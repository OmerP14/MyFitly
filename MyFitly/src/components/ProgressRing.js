import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export default function ProgressRing({ size = 80, stroke = 8, progress = 0.6, trackColor = '#2F2F4A', color }) {
  const { colors } = useTheme();
  const ringColor = color || colors.primary;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = (1 - progress) * circumference;
  const center = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={ringColor}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
}

