import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [clubCode, setClubCode] = useState('');
  const [sailNumber, setSailNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && (!name || !clubCode)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, name, password, clubCode, sailNumber || undefined);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>⛵</Text>
                <Text style={styles.logo}>RacePilot</Text>
              </View>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome back, sailor!' : 'Join the fleet'}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <View style={styles.form}>
                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'name' && styles.inputFocused,
                      ]}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Your name"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
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
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedInput === 'password' && styles.inputFocused,
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {!isLogin && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Club Code</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === 'clubCode' && styles.inputFocused,
                        ]}
                        value={clubCode}
                        onChangeText={(text) => setClubCode(text.toUpperCase())}
                        onFocus={() => setFocusedInput('clubCode')}
                        onBlur={() => setFocusedInput(null)}
                        placeholder="e.g., BRYC"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                      <Text style={styles.hint}>
                        Ask your club admin for the club code
                      </Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Sail Number (Optional)</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === 'sailNumber' && styles.inputFocused,
                        ]}
                        value={sailNumber}
                        onChangeText={setSailNumber}
                        onFocus={() => setFocusedInput('sailNumber')}
                        onBlur={() => setFocusedInput(null)}
                        placeholder="e.g., 12345"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchText}>
                    {isLogin
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Text style={styles.switchTextBold}>
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Professional race analysis at your fingertips
              </Text>
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
    backgroundColor: '#1e40af', // Solid blue background
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 48,
    marginRight: 12,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#fff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
  },
  switchText: {
    color: '#64748b',
    fontSize: 15,
  },
  switchTextBold: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '500',
  },
});
