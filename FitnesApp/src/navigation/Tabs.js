import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';

import DashboardScreen from '../screens/DashboardScreen';
import ProgramScreen from '../screens/ProgramScreen';
import TrackingScreen from '../screens/TrackingScreen';
import MotivationScreen from '../screens/MotivationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutScreen from '../screens/WorkoutScreen';

const Tab = createBottomTabNavigator();
export const RootStack = createNativeStackNavigator();

export function Tabs() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'home-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Program') iconName = focused ? 'barbell' : 'barbell-outline';
          if (route.name === 'Workout') iconName = focused ? 'fitness' : 'fitness-outline';
          if (route.name === 'Tracking') iconName = focused ? 'analytics' : 'analytics-outline';
          if (route.name === 'Motivation') iconName = focused ? 'flame' : 'flame-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarItemStyle: { paddingTop: 6 }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: t.dashboard_tab }}
      />
      <Tab.Screen 
        name="Program" 
        component={ProgramScreen} 
        options={{ title: t.program_tab }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen} 
        options={{ title: t.workout_tab }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen} 
        options={{ title: t.tracking_tab }}
      />
      <Tab.Screen 
        name="Motivation" 
        component={MotivationScreen} 
        options={{ title: t.motivation_tab }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t.profile_tab }}
      />
    </Tab.Navigator>
  );
}

