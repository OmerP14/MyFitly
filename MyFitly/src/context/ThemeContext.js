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

  // Açık tema - Yumuşak tonlar, beyazlık kırıldı
  const lightColors = {
    background: '#FAFAFA', // Çok hafif gri - bembeyaz değil
    backgroundAlt: '#F5F5F5', // Biraz daha koyu gri
    card: '#F8F9FA', // Hafif gri kart - bembeyaz değil
    text: '#2D2D2D', // Koyu gri metin
    textMuted: '#6B7280',
    primary: '#FF6600', // Turuncu - görseldeki gibi
    primaryAlt: '#FF8800',
    secondary: '#00C6FF',
    success: '#FF6600', // Turuncu
    warning: '#FFD700',
    error: '#FF4757',
    danger: '#FF4757',
    info: '#7B68EE',
    purple: '#9B59B6',
    border: 'rgba(255,102,0,0.15)', // Daha hafif turuncu kenarlık
    tabBarBackground: '#F8F9FA', // Hafif gri - bembeyaz değil
    tabBarBorder: 'rgba(255,102,0,0.15)',
    accent: '#FF6600',
    gradient: ['#FAFAFA', '#F5F5F5'] // Yumuşak gri gradient
  };

  // Modern simsiyah tema - Parlak fosforlu turuncu vurgu
  const darkColors = {
    background: '#000000', // Tam siyah arka plan
    backgroundAlt: '#111111', // Çok koyu gri ikincil arka plan
    card: '#1A1A1A', // Koyu gri kart rengi - borderlar belli olsun
    text: '#FFFFFF', // Beyaz metin
    textMuted: '#CCCCCC', // Açık gri ikincil metin
    primary: '#FF6600', // Parlak fosforlu turuncu
    primaryAlt: '#FF8800', // Biraz daha açık fosforlu turuncu
    secondary: '#00C6FF', // Mavi
    success: '#FF6600', // Parlak fosforlu turuncu
    warning: '#FFD700', // Altın sarı
    error: '#FF4757', // Kırmızı
    danger: '#FF4757', // Kırmızı
    info: '#7B68EE', // Mor
    purple: '#9B59B6', // Mor
    border: 'rgba(255,102,0,0.4)', // Fosforlu turuncu kenarlık - daha belli
    tabBarBackground: '#000000', // Alt navigasyon arka planı
    tabBarBorder: 'rgba(255,102,0,0.4)', // Fosforlu turuncu alt navigasyon kenarlığı
    accent: '#FF6600', // Ana vurgu rengi - fosforlu turuncu
    gradient: ['#000000', '#111111'], // Siyahdan koyu griye gradient
    // Ek renkler modern tonlarda
    progressFill: '#FF6600', // Progress bar dolu kısmı - fosforlu turuncu
    progressEmpty: '#2A2A2A', // Progress bar boş kısmı - daha belli gri
    tabBarActive: '#FF6600', // Aktif tab rengi - fosforlu turuncu
    tabBarInactive: '#CCCCCC', // Pasif tab rengi - açık gri
    onlineIndicator: '#FF6600', // Online gösterge rengi - fosforlu turuncu
    // Modern kart tonları
    cardSecondary: '#1A1A1A', // İkincil kart rengi - koyu gri
    cardTertiary: '#2A2A2A', // Üçüncül kart rengi - daha açık gri
    textSecondary: '#CCCCCC', // Açık gri ikincil metin
    borderSecondary: 'rgba(255,102,0,0.3)', // Fosforlu turuncu kenarlık
    // Borderlar belli olsun - modern tasarım
    borderStrong: 'rgba(255,102,0,0.6)', // Güçlü fosforlu turuncu kenarlık
    borderMedium: 'rgba(255,102,0,0.4)', // Orta fosforlu turuncu kenarlık
    borderLight: 'rgba(255,102,0,0.2)', // Hafif fosforlu turuncu kenarlık
    // Kart ayrımları için
    cardBorder: 'rgba(255,255,255,0.1)', // Kart kenarlığı - beyaz şeffaf
    cardShadow: 'rgba(255,102,0,0.1)', // Kart gölgesi - turuncu şeffaf
    // Özel vurgu renkleri
    highlight: '#FF6600', // Vurgu rengi
    highlightBg: 'rgba(255,102,0,0.1)', // Vurgu arka planı
    // Metin tonları
    textPrimary: '#FFFFFF', // Ana metin
    textSecondary: '#CCCCCC', // İkincil metin
    textTertiary: '#999999' // Üçüncül metin
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    colors,
    toggleTheme,
    spacing: {
      xs: 6,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
