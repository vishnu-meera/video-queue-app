import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localForage for web, AsyncStorage for mobile
let storage: any;

if (Platform.OS === 'web') {
  // Dynamic import for web to avoid bundling issues
  import('localforage').then((localForage) => {
    storage = localForage.default || localForage;
    storage.config({
      name: 'video-queue-app',
      storeName: 'video_queue_store'
    });
  });
} else {
  storage = AsyncStorage;
}

const QUEUE_STORAGE_KEY = 'video_queue';
const LAST_FETCH_KEY = 'last_gist_fetch';

interface VideoItem {
  id: string;
  url: string;
  title?: string;
}

// Helper function to ensure storage is ready
const ensureStorage = async () => {
  if (Platform.OS === 'web' && !storage) {
    const localForage = await import('localforage');
    storage = localForage.default || localForage;
    storage.config({
      name: 'video-queue-app',
      storeName: 'video_queue_store'
    });
  }
  return storage;
};

export const saveQueueToStorage = async (queue: VideoItem[]): Promise<void> => {
  try {
    const storageInstance = await ensureStorage();
    if (Platform.OS === 'web') {
      await storageInstance.setItem(QUEUE_STORAGE_KEY, queue);
    } else {
      await storageInstance.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
    console.log('Queue saved to storage:', queue.length, 'videos');
  } catch (error) {
    console.error('Error saving queue to storage:', error);
    throw error;
  }
};

export const loadQueueFromStorage = async (): Promise<VideoItem[]> => {
  try {
    const storageInstance = await ensureStorage();
    let data;
    
    if (Platform.OS === 'web') {
      data = await storageInstance.getItem(QUEUE_STORAGE_KEY);
    } else {
      data = await storageInstance.getItem(QUEUE_STORAGE_KEY);
      if (data) {
        data = JSON.parse(data);
      }
    }
    
    if (data && Array.isArray(data)) {
      console.log('Loaded queue from storage:', data.length, 'videos');
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error loading queue from storage:', error);
    return [];
  }
};

export const removeVideoFromStorage = async (videoId: string): Promise<void> => {
  try {
    const storageInstance = await ensureStorage();
    const currentQueue = await loadQueueFromStorage();
    const updatedQueue = currentQueue.filter(video => video.id !== videoId);
    
    if (Platform.OS === 'web') {
      await storageInstance.setItem(QUEUE_STORAGE_KEY, updatedQueue);
    } else {
      await storageInstance.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    }
    
    console.log('Video removed from storage:', videoId);
  } catch (error) {
    console.error('Error removing video from storage:', error);
    throw error;
  }
};

export const clearQueueFromStorage = async (): Promise<void> => {
  try {
    const storageInstance = await ensureStorage();
    if (Platform.OS === 'web') {
      await storageInstance.removeItem(QUEUE_STORAGE_KEY);
    } else {
      await storageInstance.removeItem(QUEUE_STORAGE_KEY);
    }
    console.log('Queue cleared from storage');
  } catch (error) {
    console.error('Error clearing queue from storage:', error);
    throw error;
  }
};

export const saveLastFetchTime = async (): Promise<void> => {
  try {
    const storageInstance = await ensureStorage();
    const timestamp = Date.now();
    if (Platform.OS === 'web') {
      await storageInstance.setItem(LAST_FETCH_KEY, timestamp);
    } else {
      await storageInstance.setItem(LAST_FETCH_KEY, timestamp.toString());
    }
    console.log('Last fetch time saved:', timestamp);
  } catch (error) {
    console.error('Error saving last fetch time:', error);
    throw error;
  }
};

export const getLastFetchTime = async (): Promise<number> => {
  try {
    const storageInstance = await ensureStorage();
    let data;
    
    if (Platform.OS === 'web') {
      data = await storageInstance.getItem(LAST_FETCH_KEY);
    } else {
      data = await storageInstance.getItem(LAST_FETCH_KEY);
      if (data) {
        data = parseInt(data, 10);
      }
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error getting last fetch time:', error);
    return 0;
  }
};
