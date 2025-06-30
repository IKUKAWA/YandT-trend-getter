import axios from 'axios'
import { YouTubeVideo } from '@/types'

interface YouTubeAPIResponse {
  items: Array<{
    id: string
    snippet: {
      title: string
      channelTitle: string
      publishedAt: string
      tags?: string[]
      categoryId: string
      thumbnails: {
        high: {
          url: string
        }
      }
    }
    statistics: {
      viewCount: string
      likeCount: string
      commentCount: string
    }
  }>
  nextPageToken?: string
}

export class YouTubeAPI {
  private apiKey: string
  private baseURL = 'https://www.googleapis.com/youtube/v3'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getTrendingVideos(regionCode = 'JP', maxResults = 50): Promise<YouTubeVideo[]> {
    try {
      const response = await axios.get<YouTubeAPIResponse>(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults,
          key: this.apiKey,
        },
      })

      return response.data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId,
        thumbnail: item.snippet.thumbnails.high.url,
      }))
    } catch (error) {
      console.error('YouTube API Error:', error)
      throw new Error('Failed to fetch YouTube trending videos')
    }
  }

  async getVideosByCategory(categoryId: string, maxResults = 25): Promise<YouTubeVideo[]> {
    try {
      const searchResponse = await axios.get(`${this.baseURL}/search`, {
        params: {
          part: 'snippet',
          type: 'video',
          videoCategoryId: categoryId,
          order: 'viewCount',
          publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxResults,
          key: this.apiKey,
        },
      })

      const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(',')
      
      const videoResponse = await axios.get<YouTubeAPIResponse>(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics',
          id: videoIds,
          key: this.apiKey,
        },
      })

      return videoResponse.data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId,
        thumbnail: item.snippet.thumbnails.high.url,
      }))
    } catch (error) {
      console.error('YouTube Category API Error:', error)
      throw new Error('Failed to fetch YouTube videos by category')
    }
  }

  async getCategories(): Promise<Array<{ id: string; title: string }>> {
    try {
      const response = await axios.get(`${this.baseURL}/videoCategories`, {
        params: {
          part: 'snippet',
          regionCode: 'JP',
          key: this.apiKey,
        },
      })

      return response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
      }))
    } catch (error) {
      console.error('YouTube Categories API Error:', error)
      throw new Error('Failed to fetch YouTube categories')
    }
  }
}