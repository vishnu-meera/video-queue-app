interface GistData {
  queue: string[];
}

const GIST_URL = 'https://gist.githubusercontent.com/vishnu-meera/be8676f942b4d59685a4ddb7e0ab10f9/raw/08779ebe39431cc3431547b7e8b503110e93814d/tabs_2025-08-14_youtube.json';

export const fetchVideoQueue = async (): Promise<string[]> => {
  try {
    const response = await fetch(GIST_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: GistData = await response.json();
    return data.queue || [];
  } catch (error) {
    console.error('Error fetching video queue:', error);
    return [];
  }
};

export const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
