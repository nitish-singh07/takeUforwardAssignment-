import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { TabSwitch } from '../components/common/TabSwitch';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import * as Haptics from 'expo-haptics';

export const WelcomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Sign In, 1: Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const { login, signup, loading, error } = useAuthStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);

  const handleAction = async () => {
    if (!email || !password || (activeTab === 1 && !fullName)) {
      triggerHaptic(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    let success = false;
    if (activeTab === 0) {
      success = await login(email, password);
    } else {
      success = await signup(fullName, email, password);
    }

    if (success) {
      triggerHaptic(Haptics.NotificationFeedbackType.Success);
    } else {
      triggerHaptic(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <View style={styles.logoCircle}>
              <Typography variant="heading2" color="black" style={styles.logoText}>
                P
              </Typography>
            </View>
            <Typography variant="heading1" style={styles.welcomeTitle}>
              Welcome to PayU
            </Typography>
            <Typography variant="body" color="textSecondary" style={styles.subTitle}>
              Send money globally with the real exchange rate
            </Typography>
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

            {error && (
              <Typography variant="caption" color="error" style={styles.errorText}>
                {error}
              </Typography>
            )}

            <Button
              label={activeTab === 0 ? 'Sign In' : 'Sign Up'}
              variant="primary"
              onPress={handleAction}
              loading={loading}
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
    backgroundColor: Colors.dark.background,
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
    backgroundColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontWeight: '900',
  },
  welcomeTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
    maxWidth: '80%',
  },
  formCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardSubTitle: {
    marginBottom: Spacing.xl,
  },
  tabSwitch: {
    marginBottom: Spacing['2xl'],
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: Spacing['2xl'],
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
});
