declare module 'react-native-video-processing' {
  export interface VideoManager {
    createVideoFromImageAndAudio(options: {
      imagePath: string;
      audioPath: string;
      outputPath: string;
      duration: number;
    }): Promise<void>;
  }

  export const VideoManager: VideoManager;
} 