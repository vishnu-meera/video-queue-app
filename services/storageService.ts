import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const QUEUE_STORAGE_KEY = 'video_queue';
const LAST_FETCH_KEY = 'last_gist_fetch';

interface VideoItem {
  id: string;
  url: string;
  title?: string;
}

// Simple localStorage fallback for web
const getWebStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      setItem: (key: string, value: any) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },
      getItem: (key: string) => {
        try {
          const item = window.localStorage.getItem(key);
          return Promise.resolve(item ? JSON.parse(item) : null);
        } catch (error) {
          return Promise.resolve(null);
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    };
  }
  return null;
};

export const saveQueueToStorage = async (queue: VideoItem[]): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        await webStorage.setItem(QUEUE_STORAGE_KEY, queue);
      } else {
        throw new Error('Web storage not available');
      }
    } else {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
    console.log('Queue saved to storage:', queue.length, 'videos');
  } catch (error) {
    console.error('Error saving queue to storage:', error);
    throw error;
  }
};

export const loadQueueFromStorage = async (): Promise<VideoItem[]> => {
  try {
    let data;
    
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        data = await webStorage.getItem(QUEUE_STORAGE_KEY);
      } else {
        return [];
      }
    } else {
      data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
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
    const currentQueue = await loadQueueFromStorage();
    const updatedQueue = currentQueue.filter(video => video.id !== videoId);
    
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        await webStorage.setItem(QUEUE_STORAGE_KEY, updatedQueue);
      } else {
        throw new Error('Web storage not available');
      }
    } else {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    }
    
    console.log('Video removed from storage:', videoId);
  } catch (error) {
    console.error('Error removing video from storage:', error);
    throw error;
  }
};

export const clearQueueFromStorage = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        await webStorage.removeItem(QUEUE_STORAGE_KEY);
      } else {
        throw new Error('Web storage not available');
      }
    } else {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    }
    console.log('Queue cleared from storage');
  } catch (error) {
    console.error('Error clearing queue from storage:', error);
    throw error;
  }
};

export const saveLastFetchTime = async (): Promise<void> => {
  try {
    const timestamp = Date.now();
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        await webStorage.setItem(LAST_FETCH_KEY, timestamp);
      } else {
        throw new Error('Web storage not available');
      }
    } else {
      await AsyncStorage.setItem(LAST_FETCH_KEY, timestamp.toString());
    }
    console.log('Last fetch time saved:', timestamp);
  } catch (error) {
    console.error('Error saving last fetch time:', error);
    throw error;
  }
};

export const getLastFetchTime = async (): Promise<number> => {
  try {
    let data;
    
    if (Platform.OS === 'web') {
      const webStorage = getWebStorage();
      if (webStorage) {
        data = await webStorage.getItem(LAST_FETCH_KEY);
      } else {
        return 0;
      }
    } else {
      data = await AsyncStorage.getItem(LAST_FETCH_KEY);
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
