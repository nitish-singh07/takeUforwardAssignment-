import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { TabSwitch } from '../components/common/TabSwitch';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import * as Haptics from 'expo-haptics';
import { LoginSchema, SignupSchema } from '../utils/validation';
import { CentralModal } from '../components/common/CentralModal';

export const WelcomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Sign In, 1: Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error' as any });

  const { login, signup, loading, clearError } = useAuthStore();
  const { colors } = useTheme();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);

  const showError = (title: string, message: string) => {
    setModalConfig({ title, message, type: 'error' });
    setModalVisible(true);
    triggerHaptic(Haptics.NotificationFeedbackType.Error);
  };

  const handleAction = async () => {
    // Validation with Zod (as a fallback)
    if (activeTab === 1) {
      const result = SignupSchema.safeParse({ fullName, email, password });
      if (!result.success) {
        showError('Validation Error', result.error.issues[0].message);
        return;
      }
    } else {
      const result = LoginSchema.safeParse({ email, password });
      if (!result.success) {
        showError('Validation Error', result.error.issues[0].message);
        return;
      }
    }

    let result;
    if (activeTab === 0) {
      result = await login(email, password);
    } else {
      result = await signup(fullName, email, password);
    }

    if (!result.success) {
      showError('Authentication Failed', result.error || 'An unexpected error occurred.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    clearError();
  };

  // Form Validation State for UI disabling
  const isFormValid = useMemo(() => {
    if (activeTab === 0) {
      return LoginSchema.safeParse({ email, password }).success;
    }
    return SignupSchema.safeParse({ fullName, email, password }).success;
  }, [activeTab, email, password, fullName]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <CentralModal
        visible={modalVisible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: colors.text }]}>
              <Typography variant="heading2" color="textInverse" style={styles.logoText}>
                P
              </Typography>
            </View>
            <View style={styles.headerInfo}>
              <Typography variant="heading1" style={styles.welcomeTitle}>
                Welcome to PayU
              </Typography>
              <Typography variant="body" color="textSecondary" style={styles.subTitle}>
                Send money globally with the real exchange rate
              </Typography>
            </View>
          </View>

          {/* Form Card */}
          <Card variant="solid" style={styles.formCard}>
            <Typography variant="heading3" style={styles.cardTitle}>
              Get started
            </Typography>
            <Typography variant="bodySmall" color="textSecondary" style={styles.cardSubTitle}>
              Sign in to your account or create a new one
            </Typography>

            <TabSwitch
              options={['Sign In', 'Sign Up']}
              activeIndex={activeTab}
              onSelect={setActiveTab}
              style={styles.tabSwitch}
            />

            {activeTab === 1 && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            {activeTab === 0 && (
              <Typography variant="caption" color="text" style={styles.forgotPassword}>
                Forgot password?
              </Typography>
            )}

            <Button
              label={activeTab === 0 ? 'Sign In' : 'Sign Up'}
              variant={isFormValid ? 'primary' : 'secondary'}
              onPress={handleAction}
              loading={loading}
              disabled={!isFormValid && !loading}
              style={styles.actionButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background, // overridden by inline in JSX
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing['2xl'],
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: 'transparent', // overridden by inline in JSX
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontWeight: '900',
  },
  headerInfo: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeTitle: {
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  formCard: {
    backgroundColor: 'transparent', // overridden by inline in JSX
    padding: Spacing.xl,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardSubTitle: {
    marginBottom: Spacing.xl,
  },
  tabSwitch: {
    marginBottom: Spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: Spacing.md,
  },
});
