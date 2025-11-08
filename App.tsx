import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TrackingScreen from './TrackingScreen';
import CourseSetupScreen from './CourseSetupScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Tracking"
          component={TrackingScreen}
          options={{
            tabBarLabel: 'Live Tracking',
            tabBarIcon: ({ color, size }) => (
              <TabIcon icon="📍" color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CourseSetup"
          component={CourseSetupScreen}
          options={{
            tabBarLabel: 'Course Setup',
            tabBarIcon: ({ color, size }) => (
              <TabIcon icon="🎯" color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Simple icon component using emojis
function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={{ fontSize: 24, opacity: color === '#2196F3' ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}
