import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'home-outline';
          if (route.name === 'Ana Ekran') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Program') iconName = focused ? 'barbell' : 'barbell-outline';
          if (route.name === 'Takip') iconName = focused ? 'analytics' : 'analytics-outline';
          if (route.name === 'Motivasyon') iconName = focused ? 'flame' : 'flame-outline';
          if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarItemStyle: { paddingTop: 6 }
      })}
    >
      <Tab.Screen name="Ana Ekran" component={DashboardScreen} />
      <Tab.Screen name="Program" component={ProgramScreen} />
      <Tab.Screen name="Takip" component={TrackingScreen} />
      <Tab.Screen name="Motivasyon" component={MotivationScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

