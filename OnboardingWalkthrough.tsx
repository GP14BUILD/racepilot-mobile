import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingWalkthroughProps {
  visible: boolean;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function OnboardingWalkthrough({
  visible,
  onComplete,
}: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: '⛵',
      title: 'Welcome to RacePilot!',
      description:
        'Professional GPS sailing analytics platform that helps you track, analyze, and improve your racing performance with 10Hz precision data.',
    },
    {
      emoji: '📍',
      title: 'Live Tracking',
      description:
        'Start recording your sessions with high-precision GPS tracking. Mount your device on the mast for best reception and hit record before you head out.',
    },
    {
      emoji: '🎯',
      title: 'Course Setup',
      description:
        'Mark your race course with waypoints and buoys. Set up start lines, marks, and gates to analyze your tactical decisions and optimize your racing line.',
    },
    {
      emoji: '📊',
      title: 'Performance Analytics',
      description:
        'Your sessions automatically sync to the web dashboard where you can analyze speed, VMG, maneuver efficiency, and compare with other sailors.',
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const skipOnboarding = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    onComplete();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={skipOnboarding}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  index === currentStep && styles.progressBarActive,
                  index < currentStep && styles.progressBarCompleted,
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.emoji}>{steps[currentStep].emoji}</Text>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.description}>
              {steps[currentStep].description}
            </Text>
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipOnboarding}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  progressBarActive: {
    backgroundColor: '#38bdf8',
  },
  progressBarCompleted: {
    backgroundColor: '#0284c7',
  },
  progressText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
