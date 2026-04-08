import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii } from '../../constants/theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';

interface CentralModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDuration?: number;
  onConfirm?: () => void;
  confirmLabel?: string;
}

const { width } = Dimensions.get('window');

export const CentralModal: React.FC<CentralModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  autoClose = false,
  autoCloseDuration = 3000,
  onConfirm,
  confirmLabel = 'Confirm',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });

      if (autoClose) {
        const timer = setTimeout(onClose, autoCloseDuration);
        return () => clearTimeout(timer);
      }
    } else {
      scale.value = withTiming(0.8);
      opacity.value = withTiming(0);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: colors.success };
      case 'error': return { name: 'alert-circle', color: colors.error };
      case 'warning': return { name: 'warning', color: colors.warning };
      default: return { name: 'information-circle', color: colors.primary };
    }
  };

  const icon = getIcon();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Semi-transparent Backdrop (Replacing unstable BlurView) */}
        <Pressable 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]} 
          onPress={onClose} 
        />

        <Animated.View style={[
        styles.modalContainer,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        animatedStyle,
      ]}>
          <View style={styles.content}>
            <View style={[styles.iconWrapper, { backgroundColor: icon.color + '20' }]}>
              <Ionicons name={icon.name as any} size={48} color={icon.color} />
            </View>

            <Typography variant="heading3" style={styles.title}>
              {title}
            </Typography>

            <Typography variant="body" color="textSecondary" style={styles.message}>
              {message}
            </Typography>

            {onConfirm ? (
              <View style={styles.buttonRow}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={onClose}
                  style={styles.buttonHalf}
                />
                <Button
                  label={confirmLabel!}
                  variant={type === 'error' ? 'error' : 'primary'}
                  onPress={onConfirm}
                  style={styles.buttonHalf}
                />
              </View>
            ) : (
              <Button
                label="Dismiss"
                variant="primary"
                onPress={onClose}
                style={styles.button}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    overflow: 'hidden',
    borderRadius: Radii.xl,
    borderWidth: 1,

    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  content: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
});

