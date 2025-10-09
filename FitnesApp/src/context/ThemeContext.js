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
    background: '#FFFFFF',
    backgroundAlt: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6C757D',
    primary: '#FF7A00',
    primaryAlt: '#FF9A3D',
    secondary: '#FF7A00',
    success: '#00D084',
    warning: '#FFD700',
    error: '#FF4757',
    danger: '#FF4757',
    info: '#FF7A00',
    purple: '#9B59B6',
    border: 'rgba(0,0,0,0.1)'
  };

  const darkColors = {
    background: '#1E1E2F',
    backgroundAlt: '#171725',
    card: '#24243A',
    text: '#FFFFFF',
    textMuted: '#B3B3B3',
    primary: '#FF7A00',
    primaryAlt: '#FF9A3D',
    secondary: '#00C6FF',
    success: '#00D084',
    warning: '#FFD700',
    error: '#FF4757',
    danger: '#FF4757',
    info: '#7B68EE',
    purple: '#9B59B6',
    border: 'rgba(255,255,255,0.1)'
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
