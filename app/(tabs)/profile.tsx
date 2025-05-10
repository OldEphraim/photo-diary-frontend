import { View, Text } from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { SignOutButton } from '@/components/SignOutButton'

export default function ProfileTab() {
  const { user } = useUser()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Signed in as: {user?.emailAddresses[0].emailAddress}
      </Text>
      <SignOutButton />
    </View>
  )
}
