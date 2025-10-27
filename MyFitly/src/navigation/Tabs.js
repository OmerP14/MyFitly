import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';

import DashboardScreen from '../screens/DashboardScreen';
import TrainingScreen from '../screens/TrainingScreen';
import TrackingScreen from '../screens/TrackingScreen';
import DietScreen from '../screens/DietScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
export const RootStack = createNativeStackNavigator();

export function Tabs() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const CustomTabIcon = ({ route, color, size, focused }) => {
    let iconName = 'home-outline';
    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
    if (route.name === 'Training') iconName = focused ? 'flash' : 'flash-outline';
    if (route.name === 'Tracking') iconName = focused ? 'analytics' : 'analytics-outline';
    if (route.name === 'Diet') iconName = focused ? 'restaurant' : 'restaurant-outline';
    if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
    
    return (
      <View style={[
        styles.tabIconContainer,
        focused && styles.activeTabIconContainer,
        { backgroundColor: focused ? colors.primary : 'transparent' }
      ]}>
        <Ionicons 
          name={iconName} 
          color={focused ? '#FFFFFF' : color} 
          size={focused ? 22 : size} 
        />
      </View>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          borderRadius: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <CustomTabIcon route={route} color={color} size={size} focused={focused} />
        ),
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 2
        },
        tabBarItemStyle: { 
          paddingTop: 4,
          paddingBottom: 2
        }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: t.dashboard_tab }}
      />
      <Tab.Screen 
        name="Training" 
        component={TrainingScreen} 
        options={{ title: t.training_tab || 'Training' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen} 
        options={{ title: t.tracking_tab }}
      />
      <Tab.Screen 
        name="Diet" 
        component={DietScreen} 
        options={{ title: t.diet_tab }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t.profile_tab }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeTabIconContainer: {
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

