import React, { useRef, useMemo, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Keyboard,
  Easing,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditProfileSheetProps {
  /** Current name value to pre-fill the form. */
  name: string;
  /** Current email value to pre-fill the form. */
  email: string;
  /** Called when the user changes the name input. */
  onNameChange: (value: string) => void;
  /** Called when the user changes the email input. */
  onEmailChange: (value: string) => void;
  /** Called when the user taps "Save Changes". */
  onSave: () => void;
  /** Whether the save action is in progress. */
  loading: boolean;
  /** Initial name to compare for changes. */
  originalName: string;
  /** Initial email to compare for changes. */
  originalEmail: string;
}

export interface EditProfileSheetHandle {
  open: () => void;
  close: () => void;
}

// ─── Shared input field ───────────────────────────────────────────────────────

interface SheetInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
}

const SheetInput: React.FC<SheetInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={inputStyles.group}>
      <Typography
        variant="label"
        style={{ ...inputStyles.label, color: colors.textSecondary }}
      >
        {label}
      </Typography>

      <View
        style={[
          inputStyles.inputWrapper,
          {
            backgroundColor: colors.backgroundTertiary,
            borderColor: isFocused ? colors.text : colors.border,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={{ flex: 1, color: colors.text, fontSize: 16 }}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  group: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    height: 52,
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Edit profile bottom sheet.
 *
 * Exposes `open()` and `close()` via a ref (EditProfileSheetHandle)
 * so the parent screen never touches BottomSheet internals directly.
 */
export const EditProfileSheet = forwardRef<EditProfileSheetHandle, EditProfileSheetProps>(
  ({ name, email, onNameChange, onEmailChange, onSave, loading, originalName, originalEmail }, ref) => {
    const { colors } = useTheme();

    const sheetRef    = useRef<BottomSheet>(null);
    const snapPoints  = useMemo(() => ['75%'], []);

    // ── Keyboard Animation ──
    const headerVisibility = useRef(new Animated.Value(1)).current;

    const animateHeader = (show: boolean) => {
      Animated.timing(headerVisibility, {
        toValue: show ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Height animation needs JS driver
      }).start();
    };

    useEffect(() => {
      const showSub = Keyboard.addListener('keyboardDidShow', () => animateHeader(false));
      const hideSub = Keyboard.addListener('keyboardDidHide', () => animateHeader(true));
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    // Expose open / close to the parent
    useImperativeHandle(ref, () => ({
      open:  () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    const hasChanges = name.trim() !== originalName.trim() || email.trim() !== originalEmail.trim();
    const isDisabled = !name.trim() || !email.trim() || !hasChanges;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
          />
        )}
        backgroundStyle={{ backgroundColor: colors.backgroundSecondary }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <BottomSheetScrollView contentContainerStyle={styles.content}>
            {/* ── Header ── */}
            <Animated.View
              style={[
                styles.sheetHeader,
                {
                  opacity: headerVisibility,
                  maxHeight: headerVisibility.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                  }),
                  marginBottom: headerVisibility.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Spacing['2xl']],
                  }),
                },
              ]}
            >
              <View>
                <Typography variant="heading3">Edit Profile</Typography>
                <Typography
                  variant="bodySmall"
                  style={{ color: colors.textSecondary, marginTop: 2 }}
                >
                  Update your name and email address
                </Typography>
              </View>

              {/* Close button */}
              <TouchableOpacity
                onPress={() => sheetRef.current?.close()}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.backgroundTertiary },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </Animated.View>

            {/* ── Form ── */}
            <View style={styles.form}>
              <SheetInput
                label="FULL NAME"
                value={name}
                onChangeText={onNameChange}
                placeholder="Your full name"
                autoCapitalize="words"
              />

              <SheetInput
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={onEmailChange}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* ── Action ── */}
            <Button
              label="Save Changes"
              variant="primary"
              onPress={onSave}
              loading={loading}
              disabled={isDisabled}
              style={styles.saveButton}
            />
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

EditProfileSheet.displayName = 'EditProfileSheet';

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing['2xl'],
    paddingBottom: 48,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 0,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
