import React, { useState, useEffect } from 'react';
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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [clubCode, setClubCode] = useState('');
  const [sailNumber, setSailNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showClubCodeModal, setShowClubCodeModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState('');
  const [googleClubCode, setGoogleClubCode] = useState('');

  const { login, register } = useAuth();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '48572885130-9pofupt5pdodpr9kam3mt9f13eqvo53v.apps.googleusercontent.com',
    // For Android: Add your Android client ID from Google Cloud Console
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (credential: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (res.status === 400 && data.detail?.includes('Club code required')) {
        // New user - need club code
        setGoogleCredential(credential);
        setShowClubCodeModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || 'Google sign-in failed');
      }

      // Store token and user data
      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Reload app to show main screens
      window.location.reload?.();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleRegistration = async () => {
    if (!googleClubCode.trim()) {
      Alert.alert('Error', 'Club code is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: googleCredential,
          club_code: googleClubCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Google registration failed');
      }

      // Store token and user data
      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setShowClubCodeModal(false);
      // Reload app to show main screens
      window.location.reload?.();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Check Your Email',
          'If that email address is registered, we\'ve sent you a password reset link. Please check your email.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowForgotPassword(false);
                setResetEmail('');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to send reset email');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

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
                <Image
                  source={{ uri: 'https://raw.githubusercontent.com/GP14BUILD/racepilotimages/main/ChatGPT%20Image%20Nov%208%2C%202025%2C%2002_34_49%20PM.png' }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
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
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        focusedInput === 'password' && styles.inputFocused,
                      ]}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isLogin && (
                    <TouchableOpacity
                      onPress={() => setShowForgotPassword(true)}
                      style={styles.forgotPasswordButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  )}
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

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-in Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => promptAsync()}
                  disabled={!request || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.googleButtonText}>
                    {isLogin ? '🔐 Sign in with Google' : '🔐 Sign up with Google'}
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

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, resetLoading && styles.buttonDisabled]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
                activeOpacity={0.8}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Club Code Modal for Google Sign-up */}
      <Modal
        visible={showClubCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClubCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome to RacePilot!</Text>
            <Text style={styles.modalSubtitle}>
              Please enter your club code to complete registration.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Club Code</Text>
              <TextInput
                style={styles.input}
                value={googleClubCode}
                onChangeText={(text) => setGoogleClubCode(text.toUpperCase())}
                placeholder="e.g., BRYC"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus={true}
              />
              <Text style={styles.hint}>
                Ask your club admin for the club code
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowClubCodeModal(false);
                  setGoogleClubCode('');
                  setGoogleCredential('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, loading && styles.buttonDisabled]}
                onPress={completeGoogleRegistration}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Complete Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  logoImage: {
    width: 80,
    height: 80,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 1,
  },
  passwordToggleText: {
    fontSize: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  googleButtonText: {
    color: '#1e293b',
    fontSize: 17,
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
  forgotPasswordButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    padding: 4,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonSecondary: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonTextSecondary: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '700',
  },
});
