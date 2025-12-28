import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './AuthContext';
import TrackingScreen from './TrackingScreen';
import CourseSetupScreen from './CourseSetupScreen';
import ProfileScreen from './ProfileScreen';
import FeedbackScreen from './FeedbackScreen';
import LoginScreen from './LoginScreen';
import OnboardingWalkthrough from './OnboardingWalkthrough';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('onboarding_complete');
      if (!completed && user) {
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, [user]);

  if (isLoading || !onboardingChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <NavigationContainer>
        <TabNavigatorWithInsets />
      </NavigationContainer>
      <OnboardingWalkthrough
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

function TabNavigatorWithInsets() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          height: 60 + insets.bottom,
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
      <Tab.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          tabBarLabel: 'Feedback',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="💬" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="👤" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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
