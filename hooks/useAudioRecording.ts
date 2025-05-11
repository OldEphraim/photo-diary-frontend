// hooks/useAudioRecording.ts
import { useState } from 'react';
import { Audio } from 'expo-av';
import type { Recording } from 'expo-av/build/Audio';
import { Alert } from 'react-native';

export default function useAudioRecording() {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioRecording, setAudioRecording] = useState<Recording | null>(null);

  const startAudioRecording = async () => {
    try {
      console.log("Starting audio recording...");
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setAudioRecording(recording);
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      Alert.alert('Error', 'Could not start audio recording.');
    }
  };

  const stopAudioRecording = async () => {
    try {
      console.log("Stopping audio recording...");
      if (audioRecording) {
        await audioRecording.stopAndUnloadAsync();
        const uri = audioRecording.getURI();
        console.log("Audio recording saved:", uri);
        setAudioUri(uri);
        setAudioRecording(null);
      }
    } catch (error) {
      console.error("Failed to stop audio recording:", error);
    }
  };

  return {
    audioUri,
    audioRecording,
    setAudioUri,
    setAudioRecording,
    startAudioRecording,
    stopAudioRecording,
  };
}
