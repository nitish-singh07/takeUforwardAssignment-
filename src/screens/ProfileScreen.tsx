/**
 * ProfileScreen
 *
 * Thin orchestrator — owns state and handlers only.
 * All UI is delegated to dedicated components in src/components/profile/.
 */

import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CentralModal }    from '../components/common/CentralModal';
import { ThemePickerSheet } from '../components/common/ThemePickerSheet';
import {
  ProfileHeroCard,
  ProfileStatsRow,
  ProfilePreferencesCard,
  ProfileAccountCard,
  EditProfileSheet,
  EditProfileSheetHandle,
} from '../components/profile';

import { useAuthStore }     from '../store/authStore';
import { useTheme }         from '../context/ThemeContext';
import * as Haptics         from 'expo-haptics';
import BottomSheet          from '@gorhom/bottom-sheet';
import { Typography }       from '../components/common/Typography';
import { Spacing }          from '../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalInfo = {
  visible:  boolean;
  title:    string;
  message:  string;
  type:     'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  confirmLabel?: string;
};

const CLOSED_MODAL: ModalInfo = {
  visible: false, title: '', message: '', type: 'info',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile, deleteAccount, loading } = useAuthStore();
  const { colors, themeMode } = useTheme();

  // Sheet refs
  const editSheetRef    = useRef<EditProfileSheetHandle>(null);
  const themePickerRef  = useRef<BottomSheet>(null);

  // Edit-form state
  const [editName,  setEditName]  = useState(user?.fullName ?? '');
  const [editEmail, setEditEmail] = useState(user?.email    ?? '');

  // Single modal state handles both info and confirm flows
  const [modal, setModal] = useState<ModalInfo>(CLOSED_MODAL);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showInfo = (
    title:   string,
    message: string,
    type:    ModalInfo['type'] = 'info',
  ) => setModal({ visible: true, title, message, type });

  const closeModal = () => setModal(CLOSED_MODAL);

  // ── Edit profile ───────────────────────────────────────────────────────────

  const openEditSheet = () => {
    setEditName(user?.fullName  ?? '');
    setEditEmail(user?.email    ?? '');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    editSheetRef.current?.open();
  };

  const handleSaveProfile = async () => {
    editSheetRef.current?.close();
    const result = await updateProfile(editName.trim(), editEmail.trim());

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showInfo('Profile Updated', 'Your details have been saved.', 'success');
    } else {
      showInfo('Update Failed', result.error ?? 'Could not save changes.', 'error');
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────

  const handleSignOutPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setModal({
      visible:      true,
      title:        'Sign Out',
      message:      'Are you sure you want to sign out of your account?',
      type:         'warning',
      confirmLabel: 'Sign Out',
      onConfirm: () => {
        closeModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        logout();
      },
    });
  };

  // ── Delete account ─────────────────────────────────────────────────────────

  const handleDeletePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setModal({
      visible:      true,
      title:        'Delete Account',
      message:      'This will permanently erase your account and all transactions. This action cannot be undone.',
      type:         'error',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        closeModal();
        const result = await deleteAccount();
        if (!result.success) {
          showInfo('Error', result.error ?? 'Failed to delete account.', 'error');
        }
      },
    });
  };

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!user) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Discord-style hero */}
          <ProfileHeroCard user={user} onEditPress={openEditSheet} />

          {/* Balance / spending stats */}
          <ProfileStatsRow
            balance={user.balance}
            totalSpendings={user.totalSpendings}
          />

          {/* Appearance & haptics */}
          <ProfilePreferencesCard
            themeMode={themeMode}
            onAppearancePress={() => themePickerRef.current?.expand()}
          />

          {/* Sign out, delete account */}
          <ProfileAccountCard
            onSignOutPress={handleSignOutPress}
            onDeletePress={handleDeletePress}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Typography variant="caption" style={{ color: colors.textTertiary }}>
              PayU Finance Manager • LocalFirst
            </Typography>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Universal modal — info, success, error, confirm */}
      <CentralModal
        visible={modal.visible}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmLabel={modal.confirmLabel}
      />

      {/* Edit profile sheet */}
      <EditProfileSheet
        ref={editSheetRef}
        name={editName}
        email={editEmail}
        onNameChange={setEditName}
        onEmailChange={setEditEmail}
        onSave={handleSaveProfile}
        loading={loading}
      />

      {/* Theme picker sheet */}
      <ThemePickerSheet sheetRef={themePickerRef} />
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    opacity: 0.4,
  },
});
