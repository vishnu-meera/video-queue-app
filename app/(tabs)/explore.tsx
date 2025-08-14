import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { extractVideoId, fetchVideoQueue } from '../../services/gistService';

interface VideoItem {
  id: string;
  url: string;
  index: number;
}

export default function ExploreScreen() {
  const [videoQueue, setVideoQueue] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideoQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const urls = await fetchVideoQueue();
      
      const videos: VideoItem[] = urls
        .map((url, index) => {
          const videoId = extractVideoId(url);
          return videoId ? { id: videoId, url, index: index + 1 } : null;
        })
        .filter((video): video is VideoItem => video !== null);

      setVideoQueue(videos);
    } catch (err) {
      setError('Failed to load video queue');
      console.error('Error loading video queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideoQueue();
  }, [loadVideoQueue]);

  const handleVideoSelect = (video: VideoItem) => {
    Alert.alert(
      'Video Selected',
      `Selected video ${video.index}: ${video.url}`,
      [
        { text: 'OK', onPress: () => console.log('Video selected:', video.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity 
      style={styles.videoItem} 
      onPress={() => handleVideoSelect(item)}
    >
      <Text style={styles.videoNumber}>#{item.index}</Text>
      <View style={styles.videoInfo}>
        <Text style={styles.videoId}>ID: {item.id}</Text>
        <Text style={styles.videoUrl} numberOfLines={2}>
          {item.url}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadVideoQueue}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Queue</Text>
        <Text style={styles.subtitle}>{videoQueue.length} videos loaded</Text>
      </View>
      
      <FlatList
        data={videoQueue}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.refreshButton} onPress={loadVideoQueue}>
        <Text style={styles.refreshButtonText}>Refresh Queue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    color: '#333',
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
  list: {
    flex: 1,
  },
  videoItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  videoNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 15,
    minWidth: 30,
  },
  videoInfo: {
    flex: 1,
  },
  videoId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  videoUrl: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
