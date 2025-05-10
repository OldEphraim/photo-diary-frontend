import React, { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Button,
  StyleSheet,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { CameraView, Camera } from 'expo-camera'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import API_URL from '@/constants/api'

export default function CameraCapture() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [caption, setCaption] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)
  const { getToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync()
      console.log("📸 Captured photo URI:", photo.uri)
      setPhotoUri(photo.uri)
    }
  }

  const uploadPhoto = async () => {
    if (!photoUri) return
  
    setIsUploading(true)
    console.log("🛫 Starting upload...")
  
    try {
      const token = await getToken()
      console.log("🔐 Got token:", token?.slice(0, 20) + "...")
  
      const formData = new FormData()
      formData.append('file', {
        uri: photoUri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      } as any)
      formData.append('caption', caption)
  
      console.log("📦 FormData ready. Sending request...")
  
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
  
      console.log("📬 Got response:", response.status)
  
      if (response.ok) {
        Alert.alert('Success', 'Photo uploaded successfully!')
        setPhotoUri(null)
        setCaption('')
        router.replace('/(tabs)')
      } else {
        const text = await response.text()
        console.error('❌ Upload failed:', text)
        Alert.alert('Error', 'Upload failed.')
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      Alert.alert('Error', 'An error occurred during upload.')
    } finally {
      setIsUploading(false)
    }
  }  

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>
  if (hasPermission === false) return <Text>No access to camera</Text>

  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <TextInput
            style={styles.input}
            placeholder="Enter a caption"
            placeholderTextColor="#aaa"
            value={caption}
            onChangeText={setCaption}
          />
          {isUploading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Button title="Save Entry" onPress={uploadPhoto} />
              <Button title="Retake Photo" onPress={() => setPhotoUri(null)} />
            </>
          )}
        </>
      ) : (
        <>
          <CameraView style={styles.camera} ref={cameraRef} />
          <Button title="Take Photo" onPress={takePhoto} />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
})
