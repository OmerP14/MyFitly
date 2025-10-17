import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { getCurrentWeather } from '../services/weatherService';

export default function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackPress,
  rightComponent,
  showProfile = false,
  onProfilePress,
  style,
  userName,
  isDashboard = false
}) {
  const { colors, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const [weather, setWeather] = useState(null);

  // Hava durumu verilerini al (gerçek konum bazlı)
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const result = await getCurrentWeather(language);
        if (result.success) {
          setWeather(result.data);
          console.log('🌤️ Hava durumu kaynağı:', result.source === 'location' ? 'Gerçek konum' : 'Demo veri');
          console.log('🌤️ Hava durumu verisi:', result.data);
        }
      } catch (error) {
        console.error('Hava durumu yüklenemedi:', error);
        // Hata durumunda demo veri göster
        const { getDemoWeather } = await import('../services/weatherService');
        const weatherData = getDemoWeather(language);
        setWeather(weatherData);
        console.log('🌤️ Hata nedeniyle demo hava durumu gösteriliyor');
      }
    };

    if (isDashboard) {
      loadWeather();
    }
  }, [isDashboard, language]);

  // Tarih bilgisi
  const getDateInfo = () => {
    const today = new Date();
    
    const todayStr = today.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    return { today: todayStr };
  };

  const dateInfo = getDateInfo();

  if (isDashboard) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <LinearGradient 
          colors={colors.gradient || [colors.primary, colors.primaryAlt]} 
          style={styles.dashboardHeader}
        >
          <View style={styles.dashboardContent}>
            {/* Sol taraf - Fitly Logo ve Tarih */}
            <View style={styles.leftSection}>
              <View style={styles.logoContainer}>
                <Text style={[
                  styles.logoText, 
                  { color: '#FF6B35' }
                ]}>Fitly</Text>
                <View style={[
                  styles.logoAccent, 
                  { backgroundColor: '#EC4899' }
                ]} />
              </View>
              <View style={styles.dateContainer}>
                <Text style={[
                  styles.dateLabel,
                  { color: colors.textMuted }
                ]}>
                  {language === 'en' ? 'Today' : 'Bugün'}
                </Text>
                <Text style={[
                  styles.dateText,
                  { color: colors.text }
                ]}>
                  {dateInfo.today}
                </Text>
                {weather && (
                  <Text style={[
                    styles.weatherText,
                    { 
                      color: weather.condition === 'sunny' || weather.condition === 'clear' 
                        ? '#FF6B35'  // Güneşli/Açık = Turuncu
                        : weather.condition === 'rain' 
                        ? '#06B6D4'  // Yağmurlu = Mavi
                        : weather.condition === 'clouds'
                        ? '#A3A3A3'  // Bulutlu = Gri
                        : colors.info  // Diğer durumlar için varsayılan
                    }
                  ]}>
                    {weather.icon} {weather.temperature}°C • {weather.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Sağ taraf - Kullanıcı Adı ve Profil */}
            <View style={styles.rightSection}>
              <View style={styles.userContainer}>
                <Text style={[
                  styles.greetingText,
                  { color: colors.textMuted }
                ]}>
                  {language === 'en' ? 'Hello' : 'Merhaba'}
                </Text>
                <Text style={[
                  styles.userNameText,
                  { color: isDarkMode ? '#FFFFFF' : colors.primary }
                ]}>
                  {userName || (language === 'en' ? 'Athlete' : 'Sporcu')}
                </Text>
              </View>
              {showProfile && (
                <TouchableOpacity 
                  style={[
                    styles.profileButton,
                    { backgroundColor: isDarkMode ? '#FFFFFF' : colors.primary }
                  ]}
                  onPress={onProfilePress}
                >
                  <Ionicons 
                    name="person" 
                    size={20} 
                    color={isDarkMode ? '#000000' : colors.background} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, style]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={onBackPress}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightComponent || (
            showProfile && (
              <TouchableOpacity 
                style={[styles.profileButton, { backgroundColor: colors.primary }]}
                onPress={onProfilePress}
              >
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  // Dashboard Header Styles
  dashboardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dashboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoAccent: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
    marginRight: 15,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
