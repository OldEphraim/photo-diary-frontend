import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'
import { useClientOnlyValue } from '@/components/useClientOnlyValue'

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name'], color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const colorScheme = useColorScheme()
  const headerShown = useClientOnlyValue(false, true)

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="../sign-in" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Diary',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary-entry"
        options={{
          title: 'New Entry',
          tabBarIcon: ({ color }) => <TabBarIcon name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  )
}
