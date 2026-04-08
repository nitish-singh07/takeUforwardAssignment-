/**
 * WelcomeScreen — thin orchestrator.
 *
 * All UI is delegated to components in src/components/auth/.
 * This file owns: state, validation logic, keyboard animation, submit flow.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { CentralModal } from '../components/common/CentralModal';
import { WelcomeHero } from '../components/auth/WelcomeHero';
import { AuthTabSwitch, AuthTab } from '../components/auth/AuthTabSwitch';
import { AuthFormField, PasswordHintRow } from '../components/auth/AuthFormField';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { LoginSchema, SignupSchema } from '../utils/validation';
import * as Haptics from 'expo-haptics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldErrors {
  fullName?: string;
  email?:    string;
  password?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractErrors(
  schema: typeof LoginSchema | typeof SignupSchema,
  data:   Record<string, string | undefined>,
): FieldErrors {
  const result = (schema as any).safeParse(data);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FieldErrors;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const WelcomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { login, signup, loading, clearError } = useAuthStore();
  const triggerHaptic = useSettingsStore(s => s.triggerHaptic);

  // ── Tab ──────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState<AuthTab>('signin');

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setFullName(''); setEmail(''); setPassword('');
    setFieldErrors({}); setSubmitted(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ── Fields ───────────────────────────────────────────────────────────────────

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // ── Validation ───────────────────────────────────────────────────────────────

  const [submitted,   setSubmitted]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = useCallback((): FieldErrors => {
    const data = tab === 'signin'
      ? { email, password }
      : { fullName, email, password };
    const schema = tab === 'signin' ? LoginSchema : SignupSchema;
    return extractErrors(schema, data);
  }, [tab, fullName, email, password]);

  // Live-revalidate after first submit attempt
  useEffect(() => {
    if (submitted) setFieldErrors(validate());
  }, [fullName, email, password, submitted, validate]);

  const isFormValid = Object.keys(validate()).length === 0;

  // ── Modal ────────────────────────────────────────────────────────────────────

  const [modal, setModal] = useState({ visible: false, title: '', message: '' });

  const showModal = (title: string, message: string) => {
    setModal({ visible: true, title, message });
    triggerHaptic(Haptics.NotificationFeedbackType.Error);
  };

  const closeModal = () => {
    setModal(m => ({ ...m, visible: false }));
    clearError();
  };

  // ── Input refs for focus chain ────────────────────────────────────────────────

  const emailRef    = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitted(true);
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Keyboard.dismiss();

    const result = tab === 'signin'
      ? await login(email.trim(), password)
      : await signup(fullName.trim(), email.trim(), password);

    if (!result.success) {
      showModal(
        tab === 'signin' ? 'Sign In Failed' : 'Sign Up Failed',
        result.error ?? 'An unexpected error occurred. Please try again.',
      );
    }
  };

  // ── Keyboard animation ────────────────────────────────────────────────────────

  const heroVisibility = useRef(new Animated.Value(1)).current;

  const animateHero = (show: boolean) => {
    Animated.parallel([
      Animated.timing(heroVisibility, {
        toValue:         show ? 1 : 0,
        duration:        show ? 300 : 250,
        easing:          Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => animateHero(false));
    const hide = Keyboard.addListener('keyboardDidHide', () => animateHero(true));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <CentralModal
        visible={modal.visible}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type="error"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero — collapses when keyboard opens */}
          <WelcomeHero visibility={heroVisibility} />

          {/* Form card */}
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>

            <AuthTabSwitch active={tab} onChange={switchTab} />

            {/* Full name — Sign Up only */}
            {tab === 'signup' && (
              <AuthFormField
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={fieldErrors.fullName}
                autoFocus
              />
            )}

            <AuthFormField
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="next"
              inputRef={emailRef}
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={fieldErrors.email}
              autoFocus={tab === 'signin'}
            />

            <AuthFormField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              returnKeyType="done"
              inputRef={passwordRef}
              onSubmitEditing={handleSubmit}
              error={fieldErrors.password}
            />

            {/* Password requirements — always visible on Sign Up */}
            {tab === 'signup' && <PasswordHintRow value={password} />}

            {/* Forgot password — Sign In only */}
            {tab === 'signin' && (
              <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
              <Typography variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
                  Forgot password?
                </Typography>
              </TouchableOpacity>
            )}

            <AuthSubmitButton
              label={tab === 'signin' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              enabled={isFormValid}
            />

            {/* Switch tab hint */}
            <View style={styles.switchHint}>
              <Typography variant="caption" style={{ color: colors.textTertiary }}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              </Typography>
              <TouchableOpacity
                onPress={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Typography variant="caption" style={{ color: colors.text, fontWeight: '700' }}>
                  {tab === 'signin' ? 'Sign Up' : 'Sign In'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex:   { flex: 1 },
  scroll: {
    flexGrow:       1,
    justifyContent: 'center',
    padding:        Spacing.lg,
    paddingBottom:  48,
  },
  card: {
    borderRadius: Radii['2xl'],
    borderWidth:  1,
    padding:      Spacing.xl,
  },
  forgotRow: {
    alignSelf:    'flex-end',
    marginTop:    Spacing.xs,
    marginBottom: Spacing.sm,
  },
  switchHint: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      Spacing.xl,
    gap:            2,
  },
});
