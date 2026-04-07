import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { TabSwitch } from '../components/common/TabSwitch';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import * as Haptics from 'expo-haptics';

export const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Preview, 1: Edit
  const { user, logout } = useAuthStore();
  const { hapticsEnabled, setHapticsEnabled, triggerHaptic } = useSettingsStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleLogout = () => {
    triggerHaptic(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          triggerHaptic(Haptics.NotificationFeedbackType.Success);
          logout();
        },
      },
    ]);
  };

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    if (val) triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Typography variant="heading2" color="black" style={styles.avatarText}>
                {user?.fullName?.charAt(0) || 'P'}
              </Typography>
            </View>
            <View>
              <Typography variant="heading3" style={styles.profileName}>
                {user?.fullName || 'User Name'}
              </Typography>
              <Typography variant="body" color="textSecondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </View>
          </View>

          {/* Mode Switch */}
          <TabSwitch
            options={['Preview', 'Edit']}
            activeIndex={activeTab}
            onSelect={setActiveTab}
            style={styles.tabSwitch}
          />

          {/* Dynamic Content */}
          {activeTab === 0 ? (
            <View style={styles.previewContainer}>
              <Typography variant="heading4" style={styles.sectionTitle}>
                Account Summary
              </Typography>
              <Card variant="solid" style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Typography variant="body" color="textSecondary">Total balance:</Typography>
                  <Typography variant="heading3" color="text">${user?.balance?.toLocaleString() || '0'}</Typography>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Typography variant="body" color="textSecondary">Total spendings:</Typography>
                  <Typography variant="heading4" color="text">${user?.totalSpendings?.toLocaleString() || '0'}</Typography>
                </View>
              </Card>

              <Typography
                variant="heading4"
                style={StyleSheet.flatten([styles.sectionTitle, { marginTop: Spacing.xl }]) as TextStyle}
              >
                Settings
              </Typography>
              <Card variant="solid" style={styles.infoCard}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                      <Ionicons name="notifications" size={20} color="#4F46E5" />
                    </View>
                    <Typography variant="bodySemiBold">Haptic Feedback</Typography>
                  </View>
                  <Switch
                    value={hapticsEnabled}
                    onValueChange={handleToggleHaptics}
                    trackColor={{ false: Colors.dark.border, true: Colors.dark.text }}
                  />
                </View>
              </Card>

              <Button
                label="Sign Out"
                variant="ghost"
                onPress={handleLogout}
                style={styles.logoutButton}
              />
            </View>
          ) : (
            <View style={styles.editContainer}>
              <Card variant="solid" style={styles.formCard}>
                 <Input 
                   label="Full Name" 
                   placeholder="Enter your full name" 
                   value={fullName}
                   onChangeText={setFullName}
                 />
                 <Input 
                   label="Email" 
                   placeholder="Enter your email" 
                   value={email}
                   onChangeText={setEmail}
                   keyboardType="email-address"
                   autoCapitalize="none"
                 />
                
                <Button 
                  label="Update Details" 
                  variant="primary" 
                  style={styles.updateButton}
                  onPress={() => {
                    triggerHaptic(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('Profile', 'Feature coming soon: Local updates are saved in the DB but state sync is next.');
                  }}
                />
              </Card>
            </View>
          )}
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
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  avatarText: {
    fontWeight: '900',
  },
  profileName: {
    fontWeight: '700',
  },
  tabSwitch: {
    marginBottom: Spacing['4xl'],
  },
  previewContainer: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  infoCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: Spacing['3xl'],
    borderColor: Colors.dark.error,
  },
  editContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  updateButton: {
    marginTop: Spacing.xl,
  },
});
