import React, { useState } from 'react';
import { View, Image, Text, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Video, ResizeMode, Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import formatDuration from '@/utils/formatDuration';
import useAudioRecording from '@/hooks/useAudioRecording';

interface CaptureViewProps {
  mediaUri: string;
  isVideo: boolean;
  caption: string;
  setCaption: (caption: string) => void;
  isUploading: boolean;
  uploadMedia: () => void;
  setMediaUri: (uri: string | null) => void;
  setIsVideo: (val: boolean) => void; 
}

const CaptureView: React.FC<CaptureViewProps> = ({
  mediaUri,
  isVideo,
  caption,
  setCaption,
  isUploading,
  uploadMedia,
  setMediaUri,
  setIsVideo,
}) => {
  const {
    audioUri,
    audioRecording,
    setAudioUri,
    setAudioRecording,
    startAudioRecording,
    stopAudioRecording,
    recordingDuration,
  } = useAudioRecording();

  const [isStitching, setIsStitching] = useState(false);

  const isCacheDirectory = (uri: string | null): uri is string => {
    const cacheDir = FileSystem.cacheDirectory;
    return uri !== null && typeof cacheDir === 'string' && uri.startsWith(cacheDir);
  };

  const processImageWithAudio = async () => {
    if (!audioUri || !mediaUri) return;
    
    setIsStitching(true);
    
    try {
      // Since we can't directly stitch in the client without FFmpeg, 
      // we'll use a different approach:
      // 1. Create a modified version of the image (optional)
      // 2. Store both files together
      // 3. Set isVideo to true and use mediaUri for the image, but play the audio separately
      
      // 1. Process the image if needed
      const processedImage = await ImageManipulator.manipulateAsync(
        mediaUri,
        [{ resize: { width: 1080 } }], // Resize to standard width
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // 2. Create a directory to store both files
      const dirName = `${FileSystem.cacheDirectory}media_${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(dirName, { intermediates: true });
      
      // 3. Copy files to the directory
      const newImagePath = `${dirName}image.jpg`;
      const newAudioPath = `${dirName}audio.m4a`;
      
      await FileSystem.copyAsync({
        from: processedImage.uri,
        to: newImagePath
      });
      
      await FileSystem.copyAsync({
        from: audioUri,
        to: newAudioPath
      });
      
      // 4. Create a metadata file to link them
      const metadata = {
        image: newImagePath,
        audio: newAudioPath,
        duration: recordingDuration,
        created: new Date().toISOString()
      };
      
      await FileSystem.writeAsStringAsync(
        `${dirName}metadata.json`,
        JSON.stringify(metadata)
      );
      
      console.log("Media package created at:", dirName);
      
      // 5. Store references for the component to use
      // We'll pass the directory as the new mediaUri
      setMediaUri(dirName);
      setIsVideo(true);
      
      Alert.alert(
        "Media Ready",
        "Your image and audio have been processed. You can preview them together before uploading.",
        [{ text: "OK" }]
      );
      
    } catch (e) {
      console.error("❌ Media processing failed:", e);
      Alert.alert("Processing Failed", "There was an error creating your media package.");
    } finally {
      setIsStitching(false);
    }
  };

  const handleStopAudio = async () => {
    await stopAudioRecording();
    console.log("Before processing - mediaUri:", mediaUri);
    console.log("Before processing - audioUri:", audioUri);
    
    if (audioUri && mediaUri) {
      // Process the image and audio
      await processImageWithAudio();
    }
  };
  
  // For audio playback with the image
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const playAudioForImage = async () => {
    // If we're already playing, stop
    if (isPlayingAudio && sound) {
      await sound.stopAsync();
      setIsPlayingAudio(false);
      setSound(null);
      return;
    }
    
    // If this is a processed package with separate audio
    if (isVideo && mediaUri && isCacheDirectory(mediaUri)) {
      try {
        // Read the metadata
        const metadataPath = `${mediaUri}metadata.json`;
        const metadataExists = await FileSystem.getInfoAsync(metadataPath);
        
        if (metadataExists.exists) {
          const metadataString = await FileSystem.readAsStringAsync(metadataPath);
          const metadata = JSON.parse(metadataString);
          
          // Play the audio
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: metadata.audio },
            { shouldPlay: true }
          );
          
          setSound(newSound);
          setIsPlayingAudio(true);
          
          // When playback finishes - with fixed type checking
          newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            // Check if status is a success status (not an error) and has didJustFinish
            if ('didJustFinish' in status && status.didJustFinish) {
              setIsPlayingAudio(false);
              setSound(null);
            }
          });
        }
      } catch (e) {
        console.error("Failed to play audio:", e);
      }
    }
  };
  
  // Clean up sound when component unmounts
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <>
      <View style={styles.previewContainer}>
        {isVideo ? (
          mediaUri && isCacheDirectory(mediaUri) ? (
            <>
              <Image 
                source={{ uri: `${mediaUri}image.jpg` }} 
                style={styles.preview} 
              />
              <View style={styles.audioControls}>
                <Button
                  title={isPlayingAudio ? "Stop Audio" : "Play Audio"}
                  onPress={playAudioForImage}
                  color={isPlayingAudio ? "#ff4444" : "#4285F4"}
                />
              </View>
            </>
          ) : (
            <Video
              source={{ uri: mediaUri }}
              style={styles.preview}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
          )
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.preview} />
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter a caption"
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />

      {!isVideo && !isStitching && (
        <>
          {audioRecording ? (
            <>
              <Text style={{ color: 'white', marginBottom: 6 }}>{formatDuration(recordingDuration)}</Text>
              <Button title="Stop Recording Audio" onPress={handleStopAudio} color="#ff4444" />
            </>
          ) : (
            <Button title="Record Audio" onPress={() => {
              startAudioRecording();
            }} />
          )}
        </>
      )}

      {isStitching && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 10 }} />
          <Text style={styles.processingText}>Processing your media...</Text>
        </View>
      )}

      {isUploading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.actionButtonContainer}>
          <Button title="Save Entry" onPress={uploadMedia} />
          <Button
            title="Start Over"
            onPress={() => {
              if (sound) {
                sound.unloadAsync();
              }
              setMediaUri(null);
              setAudioUri(null);
              setAudioRecording(null);
              setIsPlayingAudio(false);
              setSound(null);
            }}
            color="#888"
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
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
  actionButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  processingText: {
    color: 'white',
    marginTop: 5,
  },
  audioControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  }
});

export default CaptureView;