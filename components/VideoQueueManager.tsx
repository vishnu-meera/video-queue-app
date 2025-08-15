import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { extractVideoId, fetchVideoQueue } from '../services/gistService';
import {
  loadQueueFromStorage,
  removeVideoFromStorage,
  saveLastFetchTime,
  saveQueueToStorage
} from '../services/storageService';
import { VideoPlayer } from './VideoPlayer';

interface VideoItem {
  id: string;
  url: string;
  title?: string;
}

export const VideoQueueManager: React.FC = () => {
  const [videoQueue, setVideoQueue] = useState<VideoItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const responsive = useResponsive();

  const loadVideoQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting to load video queue...');
      
      // First try to load from local storage
      let videos = await loadQueueFromStorage();
      console.log(`Loaded ${videos.length} videos from local storage`);
      
      // If no videos in storage, fetch from Gist
      if (videos.length === 0) {
        console.log('No videos in local storage, fetching from Gist...');
        const urls = await fetchVideoQueue();
        console.log(`Fetched ${urls.length} URLs from Gist:`, urls);
        
        videos = urls
          .map(url => {
            const videoId = extractVideoId(url);
            return videoId ? { id: videoId, url } : null;
          })
          .filter((video): video is VideoItem => video !== null);

        console.log(`Processed ${videos.length} valid videos`);

        // Save to local storage
        await saveQueueToStorage(videos);
        await saveLastFetchTime();
        console.log(`Fetched and saved ${videos.length} videos from Gist`);
      } else {
        console.log(`Using ${videos.length} videos from local storage`);
      }

      setVideoQueue(videos);
      setCurrentVideoIndex(0);
      console.log('Video queue loaded successfully');
    } catch (err) {
      console.error('Error loading video queue:', err);
      setError(`Failed to load video queue: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false');
    }
  }, []);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing error state');
        setError('Loading timeout - please check your internet connection');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    loadVideoQueue();

    return () => clearTimeout(timeoutId);
  }, [loadVideoQueue, isLoading]);

  // Debug log when current video changes
  useEffect(() => {
    if (videoQueue.length > 0 && currentVideoIndex < videoQueue.length) {
      const currentVideo = videoQueue[currentVideoIndex];
      console.log(`Now playing video ${currentVideoIndex + 1}/${videoQueue.length}: ${currentVideo.id}`);
    }
  }, [currentVideoIndex, videoQueue]);

  const handleVideoEnd = useCallback(async () => {
    console.log('Video ended, removing from queue and moving to next');
    
    if (videoQueue.length > 0 && currentVideoIndex < videoQueue.length) {
      const currentVideo = videoQueue[currentVideoIndex];
      
      // Remove the watched video from storage
      await removeVideoFromStorage(currentVideo.id);
      
      // Update local state
      const updatedQueue = videoQueue.filter(video => video.id !== currentVideo.id);
      setVideoQueue(updatedQueue);
      
      // If there are more videos, continue to next
      if (updatedQueue.length > 0) {
        // Stay at same index if possible, otherwise go to last video
        const newIndex = Math.min(currentVideoIndex, updatedQueue.length - 1);
        setCurrentVideoIndex(newIndex);
      } else {
        // Queue is empty, fetch new videos from Gist
        console.log('Queue is empty, fetching new videos from Gist...');
        setCurrentVideoIndex(0);
        await loadVideoQueue();
      }
    }
  }, [currentVideoIndex, videoQueue, loadVideoQueue]);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video error:', error);
    // Skip to next video on error (same as handleVideoEnd)
    handleVideoEnd();
  }, [handleVideoEnd]);

  const skipToNext = useCallback(() => {
    console.log('Manual skip to next video');
    if (currentVideoIndex < videoQueue.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  }, [currentVideoIndex, videoQueue.length]);

  const skipToPrevious = useCallback(() => {
    console.log('Manual skip to previous video');
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
  }, [currentVideoIndex]);

  const restartQueue = useCallback(() => {
    console.log('Restarting queue from beginning');
    setCurrentVideoIndex(0);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading video queue...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={[styles.errorText, { fontSize: 14, marginTop: 10, color: '#ccc' }]}>
          This might be due to network issues or CORS restrictions.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideoQueue}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (videoQueue.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No videos available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideoQueue}>
          <Text style={styles.retryButtonText}>Load Videos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentVideo = videoQueue[currentVideoIndex];

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <VideoPlayer
          videoId={currentVideo.id}
          onEnd={handleVideoEnd}
          onError={handleVideoError}
        />
      </View>
      
      <View style={[styles.controls, { padding: responsive.spacing.controls }]}>
        <Text style={[styles.queueInfo, { 
          fontSize: responsive.fontSize.queueInfo,
          marginBottom: responsive.spacing.queueInfo 
        }]}>
          Video {currentVideoIndex + 1} of {videoQueue.length}
        </Text>
        <Text style={[styles.videoIdInfo, { 
          fontSize: responsive.fontSize.videoId,
          marginBottom: responsive.spacing.videoId 
        }]}>
          ID: {currentVideo.id}
        </Text>
        
        <View style={[styles.buttonRow, { marginBottom: responsive.spacing.buttonRow }]}>
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                paddingHorizontal: responsive.buttonPadding.horizontal,
                paddingVertical: responsive.buttonPadding.vertical,
              },
              currentVideoIndex === 0 && styles.buttonDisabled
            ]} 
            onPress={skipToPrevious}
            disabled={currentVideoIndex === 0}
          >
            <Text style={[styles.buttonText, { fontSize: responsive.fontSize.button }]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button,
              { 
                paddingHorizontal: responsive.buttonPadding.horizontal,
                paddingVertical: responsive.buttonPadding.vertical,
              }
            ]} 
            onPress={restartQueue}
          >
            <Text style={[styles.buttonText, { fontSize: responsive.fontSize.button }]}>
              Restart
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                paddingHorizontal: responsive.buttonPadding.horizontal,
                paddingVertical: responsive.buttonPadding.vertical,
              },
              currentVideoIndex === videoQueue.length - 1 && styles.buttonDisabled
            ]} 
            onPress={skipToNext}
            disabled={currentVideoIndex === videoQueue.length - 1}
          >
            <Text style={[styles.buttonText, { fontSize: responsive.fontSize.button }]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: Platform.OS === 'ios' ? 0 : 1, // Don't take all space on iOS
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    minHeight: Platform.OS === 'ios' ? 250 : undefined, // Minimum height for iOS
  },
  controls: {
    backgroundColor: '#1a1a1a',
    minHeight: Platform.OS === 'ios' ? 120 : undefined, // Ensure minimum height for controls on iOS
  },
  queueInfo: {
    color: '#fff',
    textAlign: 'center',
  },
  videoIdInfo: {
    color: '#ccc',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 3,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
