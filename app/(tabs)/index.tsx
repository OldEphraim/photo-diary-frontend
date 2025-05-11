import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  Image,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { SignOutButton } from '@/components/SignOutButton'
import API_URL from '@/constants/api'

interface DiaryEntry {
  id: string
  created_at: string
  media_url: string
  caption: string
}

export default function DiaryHomeScreen() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchEntries()
    setRefreshing(false)
  }  

  const fetchEntries = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      data.sort((a: DiaryEntry, b: DiaryEntry) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setEntries(data)
    } catch (err) {
      console.error('❌ Failed to fetch entries:', err)
      Alert.alert('Error', 'Could not fetch your diary entries.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEntry(id),
      },
    ])
  }  

  const deleteEntry = async (id: string) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/entry/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id))
        Alert.alert('Deleted', 'Diary entry removed.')
      } else {
        throw new Error('Server rejected deletion')
      }
    } catch (err) {
      console.error('❌ Delete error:', err)
      Alert.alert('Error', 'Failed to delete entry.')
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchEntries()
    }, [])
  )  

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  if (entries.length === 0) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Hello, {user?.emailAddresses[0].emailAddress}</Text>
        <Text>Here's your diary overview (soon)</Text>
        <SignOutButton />
      </View>
    )
  }

  return (
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >  
{entries.map((entry) => {
  const isVideo = entry.media_url.endsWith('.mp4') || entry.media_url.includes('.mp4')

  return (
    <View key={entry.id} style={{ marginBottom: 20 }}>
      {isVideo ? (
        <Video
          source={{ uri: entry.media_url }}
          style={{ height: 200, borderRadius: 10 }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      ) : (
        <Image
          source={{ uri: entry.media_url }}
          style={{ height: 200, borderRadius: 10 }}
        />
      )}
      <Text
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: '#000',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
          marginVertical: 5,
        }}
      >
        {entry.caption}
      </Text>
      <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
        {new Date(entry.created_at).toLocaleString()}
      </Text>
      <Button title="Delete" onPress={() => confirmDelete(entry.id)} />
    </View>
      )
    })}
    </ScrollView>
  )
}
