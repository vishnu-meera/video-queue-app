import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useResponsive } from '../hooks/useResponsive';

interface VideoPlayerProps {
  videoId: string;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  onEnd, 
  onError 
}) => {
  const playerRef = useRef<any>(null);
  const [playerError, setPlayerError] = useState(false);
  const [playing, setPlaying] = useState(true);
  const responsive = useResponsive();

  const onReady = useCallback(() => {
    console.log('Video player ready for video:', videoId);
    setPlayerError(false);
    setPlaying(true);
  }, [videoId]);

  const onChangeState = useCallback((event: string) => {
    console.log('Video state changed:', event);
    if (event === 'ended') {
      onEnd?.();
    }
  }, [onEnd]);

  const onErrorHandler = useCallback((error: string) => {
    console.error('Video player error:', error);
    setPlayerError(true);
    onError?.(error);
  }, [onError]);

  // Reset player state when videoId changes
  useEffect(() => {
    setPlayerError(false);
    setPlaying(true);
  }, [videoId]);

  // Web-specific fallback
  if (Platform.OS === 'web' && playerError) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Video Player Unavailable</Text>
          <Text style={styles.fallbackSubtext}>
            Video ID: {videoId}
          </Text>
          <Text style={styles.fallbackSubtext}>
            YouTube URL: https://youtube.com/watch?v={videoId}
          </Text>
        </View>
      </View>
    );
  }

  // Web-specific player configuration
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <YoutubePlayer
          key={videoId} // Force re-render when videoId changes
          ref={playerRef}
          height={responsive.videoHeight}
          width={responsive.videoMaxWidth}
          videoId={videoId}
          play={playing}
          onReady={onReady}
          onChangeState={onChangeState}
          onError={onErrorHandler}
          initialPlayerParams={{
            preventFullScreen: false,
          }}
          webViewProps={{
            androidLayerType: 'hardware',
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>
    );
  }

  // Mobile player configuration
  return (
    <View style={styles.container}>
      <YoutubePlayer
        key={videoId} // Force re-render when videoId changes
        ref={playerRef}
        height={responsive.videoHeight}
        width={responsive.videoMaxWidth}
        videoId={videoId}
        play={playing}
        onReady={onReady}
        onChangeState={onChangeState}
        onError={onErrorHandler}
        initialPlayerParams={{
            preventFullScreen: false,
            cc_lang_pref: 'us',
            showClosedCaptions: true,
            rel: 0, // Don't show related videos
            modestbranding: 1, // Remove YouTube logo
            showinfo: 0, // Hide video title and uploader info
            iv_load_policy: 3, // Hide video annotations
            fs: 0, // Hide fullscreen button
            controls: 1, // Show player controls
            disablekb: 0, // Enable keyboard controls
            autoplay: 0, // Don't autoplay
            loop: 0, // Don't loop
            playlist: '', // No playlist
            start: 0, // Start from beginning
            end: 0, // Play to end
            color: 'white', // White progress bar
            hl: 'en', // English interface
            playsinline: 1, // Play inline on mobile
          }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fallbackSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});
