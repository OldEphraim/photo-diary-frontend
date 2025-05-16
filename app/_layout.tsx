import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ClerkProvider } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack, Redirect, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { useColorScheme } from '@/components/useColorScheme'
import Constants from 'expo-constants'
import { Text, View, Platform } from 'react-native'
import * as Linking from 'expo-linking'

SplashScreen.preventAutoHideAsync()

// Clerk token caching
const tokenCache = {
  async getToken(key: string) {
    try {
      // console.log(`Reading token: ${key.substring(0, 5)}...`);
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('Token cache read error:', e);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      // console.log(`Saving token: ${key.substring(0, 5)}...`);
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Token cache save error:', e);
    }
  },
}

// Error boundary component
function ErrorFallback({ error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
      <Text style={{ marginBottom: 20 }}>{error.message}</Text>
      <Text>Check console for more details</Text>
    </View>
  );
}

export default function RootLayout() {
  const [authError, setAuthError] = useState(null);
  
  // useEffect(() => {
  //   console.log('========================');
  //   console.log('🚀 ROOT LAYOUT MOUNTED');
  //   console.log('========================');
    
  //   // Log all environment variables
  //   console.log('Constants:', Constants.expoConfig?.extra);
  //   console.log('Clerk Key:', Constants.expoConfig?.extra?.clerkPublishableKey ? 
  //     `${Constants.expoConfig?.extra?.clerkPublishableKey.substring(0, 5)}...` : 'NOT FOUND');
  //   console.log('API URL:', Constants.expoConfig?.extra?.apiUrl || 'NOT FOUND');
    
  //   // Check deep linking setup
  //   const url = Linking.createURL('');
  //   console.log('Deep linking URL:', url);
    
  //   // More thorough Clerk package inspection
  //   try {
  //     const clerk = require('@clerk/clerk-expo');
  //     console.log('Clerk exports:', Object.keys(clerk));
  //     console.log('ClerkProvider type:', typeof clerk.ClerkProvider);
      
  //     // Check if we have the expected interfaces
  //     if (!clerk.ClerkProvider) {
  //       console.error('ClerkProvider not found in clerk exports!');
  //     }
  //   } catch (e) {
  //     console.error('Failed to load or inspect Clerk:', e);
  //     setAuthError(e);
  //   }
  // }, [])

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  const clerkKey = Constants.expoConfig?.extra?.clerkPublishableKey;
  const colorScheme = useColorScheme()
  const pathname = usePathname()

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null
  
  // Show error component if we had an auth setup error
  if (authError) {
    return <ErrorFallback error={authError} />;
  }

  // If we don't have a clerk key, show an error
  if (!clerkKey) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Missing Clerk API key. Check your configuration.</Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      tokenCache={tokenCache}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {pathname === '/' && <Redirect href="/(tabs)" />}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </ClerkProvider>
  )
}
