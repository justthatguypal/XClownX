const BASE_URL = '/api';

export const youtubeService = {
  async search(query) {
    try {
      const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (response.ok) return await response.json();
      throw new Error('Search failed');
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  // Returns a direct URL to our proxy endpoint - the browser plays audio from our server
  getStreamUrl(videoId) {
    return `${BASE_URL}/audio/${videoId}`;
  }
};
