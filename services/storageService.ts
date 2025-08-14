import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = 'video_queue';
const LAST_FETCH_KEY = 'last_gist_fetch';

interface VideoItem {
  id: string;
  url: string;
  title?: string;
}

export const saveQueueToStorage = async (queue: VideoItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    console.log(`Saved ${queue.length} videos to local storage`);
  } catch (error) {
    console.error('Error saving queue to storage:', error);
  }
};

export const loadQueueFromStorage = async (): Promise<VideoItem[]> => {
  try {
    const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (storedQueue) {
      const queue = JSON.parse(storedQueue);
      console.log(`Loaded ${queue.length} videos from local storage`);
      return queue;
    }
  } catch (error) {
    console.error('Error loading queue from storage:', error);
  }
  return [];
};

export const removeVideoFromStorage = async (videoId: string): Promise<void> => {
  try {
    const currentQueue = await loadQueueFromStorage();
    const updatedQueue = currentQueue.filter(video => video.id !== videoId);
    await saveQueueToStorage(updatedQueue);
    console.log(`Removed video ${videoId} from storage. Queue now has ${updatedQueue.length} videos`);
  } catch (error) {
    console.error('Error removing video from storage:', error);
  }
};

export const clearQueueFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    console.log('Cleared queue from local storage');
  } catch (error) {
    console.error('Error clearing queue from storage:', error);
  }
};

export const saveLastFetchTime = async (): Promise<void> => {
  try {
    const timestamp = Date.now();
    await AsyncStorage.setItem(LAST_FETCH_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving last fetch time:', error);
  }
};

export const getLastFetchTime = async (): Promise<number> => {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_FETCH_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    console.error('Error getting last fetch time:', error);
    return 0;
  }
};
