import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import React, { useEffect, useState } from 'react';

// Stores & DB
import { useAuthStore }    from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { initMigrations }  from './src/database/client';

// Theme
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens & components
import { Header }               from './src/components/Header';
import { WelcomeScreen }         from './src/screens/WelcomeScreen';
import { HomeScreen }            from './src/screens/HomeScreen';
import { BalancesScreen }        from './src/screens/BalancesScreen';
import { ProfileScreen }         from './src/screens/ProfileScreen';
import { SearchScreen }          from './src/screens/SearchScreen';
import { AddTransactionScreen }  from './src/screens/AddTransactionScreen';
import { TransactionDetailsScreen } from './src/screens/TransactionDetailsScreen';

LogBox.ignoreAllLogs();

// ─── Navigators ───────────────────────────────────────────────────────────────

const Tab   = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

// ─── HOC: screen + Header ─────────────────────────────────────────────────────

function WithHeader({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function HomeWithHeader()     { return <WithHeader><HomeScreen /></WithHeader>; }
function BalancesWithHeader() { return <WithHeader><BalancesScreen /></WithHeader>; }

// ─── Bottom-tab navigator ─────────────────────────────────────────────────────

function MainTabs() {
  const insets        = useSafeAreaInsets();
  const { colors }    = useTheme();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor:   colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowIcon:          true,
        tabBarIndicatorStyle: {
          top:             0,
          backgroundColor: colors.text,
          height:          3,
          borderRadius:    3,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          height:          70 + insets.bottom,
          paddingBottom:   insets.bottom + 5,
          paddingTop:      5,
          borderTopWidth:  1,
          borderTopColor:  colors.border,
          elevation:       0,
        },
        tabBarLabelStyle: {
          fontSize:      10,
          fontWeight:    '700',
          textTransform: 'none',
          marginTop:     4,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if      (route.name === 'Home')     iconName = focused ? 'home'     : 'home-outline';
          else if (route.name === 'Balances') iconName = focused ? 'wallet'   : 'wallet-outline';
          else if (route.name === 'Profile')  iconName = focused ? 'person'   : 'person-outline';
          else                                iconName = 'alert-circle-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarPressColor: 'transparent',
      })}
      screenListeners={{ state: () => { triggerHaptic('selection'); } }}
    >
      <Tab.Screen name="Home"     component={HomeWithHeader} />
      <Tab.Screen name="Balances" component={BalancesWithHeader} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root stack (tabs + search) ───────────────────────────────────────────────

function AuthenticatedStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs — no header managed by Stack */}
      <Stack.Screen name="Main"           component={MainTabs} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: 'slide_from_right', headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ animation: 'slide_from_bottom', headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ animation: 'slide_from_right', headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </Stack.Navigator>
  );
}

// ─── App content ──────────────────────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated }  = useAuthStore();
  const [isDbReady, setIsDbReady] = useState(false);
  const { colors, scheme }   = useTheme();

  useEffect(() => {
    initMigrations()
      .then(() => setIsDbReady(true))
      .catch(err => console.error('DB init failed:', err));
  }, []);

  if (!isDbReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark:   scheme === 'dark',
          colors: {
            background:   colors.background,
            text:         colors.text,
            primary:      colors.text,
            card:         colors.background,
            border:       colors.border,
            notification: colors.error,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium:  { fontFamily: 'System', fontWeight: '500' },
            bold:    { fontFamily: 'System', fontWeight: '700' },
            heavy:   { fontFamily: 'System', fontWeight: '900' },
          },
        }}
      >
        {!isAuthenticated ? <WelcomeScreen /> : <AuthenticatedStack />}
      </NavigationContainer>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          {/* KeyboardProvider enables react-native-keyboard-controller throughout */}
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
});
