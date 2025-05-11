// hooks/useVideoRecording.ts
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import formatDuration from '@/utils/formatDuration';

export default function useVideoRecording(setMediaUri: (uri: string | null) => void, setIsVideo: (isVideo: boolean) => void, setAudioUri: (uri: string | null) => void) {
  // Video recording states
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // References
  const cameraRef = useRef<CameraView>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        console.log("Taking photo...");
        const photo = await cameraRef.current.takePictureAsync();
        console.log("📸 Captured photo URI:", photo.uri);
        
        setMediaUri(photo.uri);
        setIsVideo(false);
        setAudioUri(null);
      } catch (error) {
        console.error("❌ Failed to take photo:", error);
        Alert.alert('Error', 'Could not take photo.');
      }
    } else {
      console.error("Camera ref is null when taking photo");
    }
  };

  const recordVideo = async () => {
    if (!cameraRef.current) {
      console.log("Camera ref is null");
      return;
    }
    
    if (!isRecordingVideo) {
      // Start recording
      try {
        setIsRecordingVideo(true);
        setRecordingDuration(0);
        
        // Start a timer to track recording duration
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        
        console.log("Starting video recording...");
        
        // Create a timeout to force stop recording after maxDuration
        const maxDurationMs = 60 * 1000; // 60 seconds
        const recordingTimeout = setTimeout(() => {
          if (isRecordingVideo && cameraRef.current) {
            console.log("Max duration reached, stopping recording...");
            try {
              cameraRef.current.stopRecording();
            } catch (e) {
              console.error("Error stopping recording at timeout:", e);
            }
          }
        }, maxDurationMs);
        
        // Start recording in the background
        cameraRef.current.recordAsync({ maxDuration: 60 })
          .then(videoResult => {
            console.log("Video recording completed, result:", videoResult);
            
            // Clear the timer
            if (timerInterval) {
              clearInterval(timerInterval);
              setTimerInterval(null);
            }
            
            // Clear the timeout
            clearTimeout(recordingTimeout);
            
            // Process the recording result
            if (videoResult && videoResult.uri) {
              setMediaUri(videoResult.uri);
              setIsVideo(true);
              setAudioUri(null);
            } else {
              console.error("No video URI returned");
              Alert.alert('Error', 'Failed to get video.');
            }
            
            setIsRecordingVideo(false);
          })
          .catch(error => {
            console.error("Video recording error:", error);
            
            // Clear the timer
            if (timerInterval) {
              clearInterval(timerInterval);
              setTimerInterval(null);
            }
            
            // Clear the timeout
            clearTimeout(recordingTimeout);
            
            setIsRecordingVideo(false);
            Alert.alert('Error', 'Could not complete video recording.');
          });
      } catch (error) {
        console.error("Failed to start recording:", error);
        setIsRecordingVideo(false);
        
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        
        Alert.alert('Error', 'Could not start video recording.');
      }
    } else {
      // Stop recording
      try {
        console.log("Stopping video recording...");
        
        // This will cause the promise from recordAsync to resolve
        if (cameraRef.current) {
          cameraRef.current.stopRecording();
          console.log("Stop recording requested");
        }
        
        // Note: We don't set isRecordingVideo to false here
        // That will be done in the promise resolution from recordAsync
      } catch (error) {
        console.error("Error stopping recording:", error);
        setIsRecordingVideo(false);
        
        // Clear the timer
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      }
    }
  };

  return {
    isRecordingVideo,
    recordingDuration,
    cameraRef,
    takePhoto,
    recordVideo,
    formatDuration
  };
}