import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ClerkProvider } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack, Redirect, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from '@/components/useColorScheme'
import Constants from 'expo-constants'

SplashScreen.preventAutoHideAsync()

// Clerk token caching
const tokenCache = {
  async getToken(key: string) {
    return await SecureStore.getItemAsync(key)
  },
  async saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value)
  },
}

export default function RootLayout() {
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