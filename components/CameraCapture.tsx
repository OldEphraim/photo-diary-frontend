import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native'
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { Audio } from 'expo-av'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import CaptureView from './CaptureView'
import ReviewView from './ReviewView'
import useAudioRecording from '@/hooks/useAudioRecording'
import useVideoRecording from '@/hooks/useVideoRecording'
import API_URL from '@/constants/api'

export default function CameraCapture() {
  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  // Media states
  const [mediaUri, setMediaUri] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isVideo, setIsVideo] = useState(false)
  
  // Auth and navigation
  const { getToken } = useAuth()
  const router = useRouter()

  // Hooks
  const {
    audioUri,
    setAudioUri,
  } = useAudioRecording();

  const {
    isRecordingVideo,
    recordingDuration,
    cameraRef,
    takePhoto,
    recordVideo,
  } = useVideoRecording(setMediaUri, setIsVideo, setAudioUri);

  // Debug logging for state changes
  useEffect(() => {
    console.log("State changed - mediaUri:", mediaUri, "isVideo:", isVideo);
  }, [mediaUri, isVideo]);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      console.log("Requesting camera and microphone permissions...");
      await requestCameraPermission();
      await requestMicrophonePermission();
      // Also request audio permissions for audio recording
      await Audio.requestPermissionsAsync();
    })();
  }, [requestCameraPermission, requestMicrophonePermission]);

  const uploadMedia = async () => {
    if (!mediaUri) return;

    setIsUploading(true);
    console.log("Starting upload for:", mediaUri);

    try {
      const token = await getToken();
      console.log("Got token:", token?.slice(0, 20) + "...");

      const formData = new FormData();
      if (Platform.OS === 'web') {
        const blob = await (await fetch(mediaUri)).blob();
        formData.append('file', new File([blob], isVideo ? 'upload.mp4' : 'upload.jpg', {
          type: isVideo ? 'video/mp4' : 'image/jpeg'
        }));
      } else {
        formData.append('file', {
          uri: mediaUri,
          name: isVideo ? 'upload.mp4' : 'upload.jpg',
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        } as any);
      }      

      if (!isVideo && audioUri) {
        formData.append('audio', {
          uri: audioUri,
          name: 'audio.m4a',
          type: 'audio/x-m4a',
        } as any);
      }

      formData.append('caption', caption);

      console.log("FormData ready. Sending request...");

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Got response:", response.status);

      if (response.ok) {
        Alert.alert('Success', 'Entry uploaded successfully!');
        setMediaUri(null);
        setAudioUri(null);
        setCaption('');
        router.replace('/(tabs)');
      } else {
        const text = await response.text();
        console.error('Upload failed:', text);
        Alert.alert('Error', 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  }

  // Check if permissions are still loading
  if (!cameraPermission || !microphonePermission) {
    return <Text>Requesting permissions...</Text>;
  }

  // Check if permissions were denied
  if (!cameraPermission.granted || !microphonePermission.granted) {
    return <Text>No access to camera or microphone</Text>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {mediaUri ? (
        // Media preview and upload UI
        <CaptureView
          mediaUri={mediaUri}
          isVideo={isVideo}
          caption={caption}
          setCaption={setCaption}
          isUploading={isUploading}
          uploadMedia={uploadMedia}
          setMediaUri={setMediaUri}
          setIsVideo={setIsVideo}
        />
      ) : (
        <ReviewView
          cameraRef={cameraRef}
          isRecordingVideo={isRecordingVideo}
          recordingDuration={recordingDuration}
          takePhoto={takePhoto}
          recordVideo={recordVideo}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: 'black',
      justifyContent: 'center',
    }
  });