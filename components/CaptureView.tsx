import React, { useState } from 'react';
import { View, Image, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { VideoManager } from 'react-native-video-processing';
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

  const handleStopAudio = async () => {
    await stopAudioRecording();
    console.log("Before stitching - mediaUri:", mediaUri);
    console.log("Before stitching - audioUri:", audioUri);
    if (audioUri && mediaUri) {
      setIsStitching(true);
      try {
        const outputPath = FileSystem.cacheDirectory + `stitched_${Date.now()}.mp4`;
        console.log("🎬 Creating video from image and audio");
        
        // Use VideoManager instead of FFmpegKit
        await VideoManager.createVideoFromImageAndAudio({
          imagePath: mediaUri,
          audioPath: audioUri,
          outputPath: outputPath,
          duration: recordingDuration / 1000, // Convert ms to seconds
        });
        
        setMediaUri(outputPath);
        console.log("Stitched output saved to:", outputPath);
        setIsVideo(true);
      } catch (e) {
        console.error("❌ Video stitching failed:", e);
      } finally {
        setIsStitching(false);
      }
    }
  };

  return (
    <>
      <View style={styles.previewContainer}>
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
          />
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
        <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      )}

      {isUploading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.actionButtonContainer}>
          <Button title="Save Entry" onPress={uploadMedia} />
          <Button
            title="Start Over"
            onPress={() => {
              setMediaUri(null);
              setAudioUri(null);
              setAudioRecording(null);
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
});

export default CaptureView;