import * as Haptics from 'expo-haptics';

/**
 * Trigger a light impact haptic feedback.
 */
export const tap = (): void => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Trigger a success notification feedback.
 */
export const success = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Trigger a warning notification feedback.
 */
export const warning = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Trigger an error notification feedback.
 */
export const error = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Trigger a selection change haptic feedback.
 */
export const select = (): void => {
  Haptics.selectionAsync();
};
