import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'question', label: 'Question' },
    { value: 'complaint', label: 'Complaint' },
  ];

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      Alert.alert(
        'Feedback Sent!',
        'Thank you for your feedback. We\'ll review it and get back to you if needed.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              setCategory('general');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Send Feedback</Text>
              <Text style={styles.subtitle}>
                We'd love to hear from you! Share your thoughts, report issues,
                or suggest new features.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'name' && styles.inputFocused,
                  ]}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'email' && styles.inputFocused,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="you@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryButton,
                        category === cat.value && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCategory(cat.value)}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat.value && styles.categoryTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'subject' && styles.inputFocused,
                  ]}
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setFocusedInput('subject')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Brief description of your feedback"
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    focusedInput === 'message' && styles.inputFocused,
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setFocusedInput('message')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Tell us more about your feedback..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Feedback</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerTitle}>Other Ways to Reach Us</Text>
                <Text style={styles.footerText}>
                  Email: info@race-pilot.app
                </Text>
                <Text style={styles.footerText}>
                  Website: race-pilot.app
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
  },
  form: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: '#fff',
  },
  inputFocused: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  categoryText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
});
