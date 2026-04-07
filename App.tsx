import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import { Colors } from './src/constants/theme';

// Stores & DB
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { initMigrations } from './src/database/client';

// Components & Screens
import { Header } from './src/components/Header';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BalancesScreen } from './src/screens/BalancesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Simple LogBox silence for recurring reanimated/gesture warnings in dev
LogBox.ignoreAllLogs();

const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);

  return (
    <View style={styles.tabWrapper}>
      <Header />
      <View style={styles.navigatorWrapper}>
        <Tab.Navigator
          tabBarPosition="bottom"
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: Colors.dark.text,
            tabBarInactiveTintColor: Colors.dark.textTertiary,
            tabBarShowIcon: true,
            tabBarIndicatorStyle: {
              top: 0,
              backgroundColor: Colors.dark.text,
              height: 3,
              borderRadius: 3,
            },
            tabBarStyle: {
              backgroundColor: Colors.dark.background,
              height: 70 + insets.bottom,
              paddingBottom: insets.bottom + 5,
              paddingTop: 5,
              borderTopWidth: 1,
              borderTopColor: Colors.dark.border,
              elevation: 0,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
              textTransform: 'none',
              marginTop: 4,
            },
            tabBarIcon: ({ color, focused }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Balances') iconName = focused ? 'wallet' : 'wallet-outline';
              else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
              else iconName = 'alert-circle-outline';
              
              return <Ionicons name={iconName} size={22} color={color} />;
            },
            tabBarPressColor: 'transparent',
          })}
          screenListeners={{
            state: () => {
              triggerHaptic('selection');
            },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Balances" component={BalancesScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </View>
    </View>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initMigrations();
        setIsDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
      }
    };
    setup();
  }, []);

  if (!isDbReady) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <View style={styles.container}>
            <StatusBar style="light" />
            <NavigationContainer
              theme={{
                dark: true,
                colors: {
                  background: Colors.dark.background,
                  text: Colors.dark.text,
                  primary: Colors.dark.text,
                  card: Colors.dark.background,
                  border: Colors.dark.border,
                  notification: Colors.dark.error,
                },
                fonts: {
                  regular: { fontFamily: 'System', fontWeight: '400' },
                  medium: { fontFamily: 'System', fontWeight: '500' },
                  bold: { fontFamily: 'System', fontWeight: '700' },
                  heavy: { fontFamily: 'System', fontWeight: '900' },
                }
              }}
            >
              {!isAuthenticated ? (
                <WelcomeScreen />
              ) : (
                <MainTabs />
              )}
            </NavigationContainer>
          </View>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  tabWrapper: {
    flex: 1,
  },
  navigatorWrapper: {
    flex: 1,
  },
});
