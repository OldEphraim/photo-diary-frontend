import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function AuthLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href="/" />
  }

  return <Stack />
}
