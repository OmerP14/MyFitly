import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const lightColors = {
    background: '#FAFAFA',
    backgroundAlt: '#F0F0F0',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#666666',
    primary: '#6366F1',
    primaryAlt: '#818CF8',
    secondary: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    border: 'rgba(0,0,0,0.08)',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: 'rgba(0,0,0,0.08)',
    accent: '#EC4899',
    gradient: ['#FFFFFF', '#F0F0F0']
  };

  const darkColors = {
    background: '#000000',
    backgroundAlt: '#111111',
    card: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#A3A3A3',
    primary: '#FF6B35',
    primaryAlt: '#FF8A5C',
    secondary: '#FF6B35',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    danger: '#F87171',
    info: '#FF6B35',
    purple: '#FF6B35',
    border: 'rgba(255,255,255,0.1)',
    tabBarBackground: '#000000',
    tabBarBorder: 'rgba(255,255,255,0.1)',
    accent: '#FF6B35',
    gradient: ['#000000', '#111111']
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    colors,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
