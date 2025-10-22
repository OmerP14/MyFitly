import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { Tabs, RootStack } from './src/navigation/Tabs';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { LanguageProvider } from './src/context/LanguageContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import DietPlanScreen from './src/screens/DietPlanScreen';
import AddFoodScreen from './src/screens/AddFoodScreen';
import WaterTrackingScreen from './src/screens/WaterTrackingScreen';
import DietSettingsScreen from './src/screens/DietSettingsScreen';
import DietNotificationsScreen from './src/screens/DietNotificationsScreen';
import { colors } from './src/theme/colors';
import * as Notifications from 'expo-notifications';
import { initializeAds } from './src/services/adService';
import { checkPermissionStatus } from './src/services/notificationService';

const AuthStack = createNativeStackNavigator();

// Loading Screen Component (optimize edilmiş)
function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ 
        color: colors.text, 
        marginTop: 16, 
        fontSize: 16 
      }}>
        Yükleniyor...
      </Text>
      <Text style={{ 
        color: colors.textMuted, 
        marginTop: 8, 
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 32
      }}>
        Bu işlem genellikle 2-3 saniye sürer
      </Text>
    </View>
  );
}

function AppContent() {
  const { isDarkMode, colors: themeColors } = useTheme();
  const { session, isLoading, needsProfileCompletion } = useUser();
  const notificationListener = useRef();
  const responseListener = useRef();
  
  // Bildirim dinleyicileri
  useEffect(() => {
    // Bildirim geldiğinde
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Bildirim alındı:', notification);
    });

    // Bildirime tıklandığında
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Bildirime tıklandı:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
  
  // Loading durumunda loading screen göster
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  const AppTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: themeColors.background,
      card: themeColors.card,
      text: themeColors.text,
      primary: themeColors.primary,
      border: themeColors.border
    }
  };

  return (
    <NavigationContainer theme={AppTheme}>
      {!session ? (
        // Kullanıcı giriş yapmamışsa Login/Register ekranları
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      ) : needsProfileCompletion ? (
        // Kullanıcı giriş yapmış ama profili tamamlamamış
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </AuthStack.Navigator>
      ) : (
        // Kullanıcı giriş yapmış ve profili tamamlamış - Ana uygulama
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Root" component={Tabs} />
          <RootStack.Screen name="DietPlan" component={DietPlanScreen} />
          <RootStack.Screen name="AddFood" component={AddFoodScreen} />
          <RootStack.Screen name="WaterTracking" component={WaterTrackingScreen} />
          <RootStack.Screen name="DietSettings" component={DietSettingsScreen} />
          <RootStack.Screen name="DietNotifications" component={DietNotificationsScreen} />
        </RootStack.Navigator>
      )}
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      // Reklamları başlat
      initializeAds();
      
      // Bildirim izin durumunu kontrol et (kullanıcıdan sormadan)
      console.log('🔔 Bildirim izin durumu kontrol ediliyor...');
      const hasPermission = await checkPermissionStatus();
      if (hasPermission) {
        console.log('✅ Bildirim izinleri zaten verilmiş');
      } else {
        console.log('ℹ️ Bildirim izni henüz verilmemiş (profil veya ayarlardan istenecek)');
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
