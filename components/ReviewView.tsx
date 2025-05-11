import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import formatDuration from '@/utils/formatDuration';

interface ReviewViewProps {
  cameraRef: React.RefObject<CameraView | null>;
  isRecordingVideo: boolean;
  recordingDuration: number;
  takePhoto: () => void;
  recordVideo: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({
  cameraRef,
  isRecordingVideo,
  recordingDuration,
  takePhoto,
  recordVideo,
}) => {
  return (
    <>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
      />
      <View style={styles.controlsContainer}>
        {isRecordingVideo && (
          <View style={styles.recordingIndicatorContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTimer}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          {!isRecordingVideo ? (
            <>
              <Button 
                title="Take Photo" 
                onPress={takePhoto}
              />
              <Button
                title="Record Video"
                onPress={recordVideo}
                color="#4285F4"
              />
            </>
          ) : (
            <Button
              title="Stop Video"
              onPress={recordVideo}
              color="#ff4444"
            />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
    camera: {
      flex: 1,
      aspectRatio: 3 / 4,
      borderRadius: 10,
      overflow: 'hidden',
    },
    controlsContainer: {
      marginTop: 15,
      width: '100%',
      alignItems: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginVertical: 10,
      gap: 20,
    },
    recordingIndicatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderRadius: 20,
      alignSelf: 'center',
    },
    recordingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ff4444',
      marginRight: 8,
    },
    recordingTimer: {
      color: 'white',
      fontWeight: 'bold',
    }
  });
  
  export default ReviewView;  