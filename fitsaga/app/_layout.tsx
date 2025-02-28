import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../components/ui/ThemeProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { currentUser, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'theme-showcase';
    
    if (!initialRoute) {
      // Set initial route only once after loading completes
      if (!currentUser && inAuthGroup) {
        setInitialRoute('/login');
        router.replace('/login' as any);
      } else if (currentUser && !inAuthGroup) {
        setInitialRoute('/(tabs)');
        router.replace('/(tabs)' as any);
      } else {
        // Already on the correct route
        setInitialRoute(segments.join('/'));
      }
    }
  }, [currentUser, segments, isLoading, initialRoute]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="theme-showcase" options={{ title: 'Theme Showcase' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeProvider forceDark={true}>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="light" />
        </AuthProvider>
      </ThemeProvider>
    </NavigationThemeProvider>
  );
}
