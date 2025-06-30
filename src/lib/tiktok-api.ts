import axios from 'axios'
import { TikTokVideo } from '@/types'

interface TikTokAPIResponse {
  data: Array<{
    id: string
    title: string
    author: {
      unique_id: string
      nickname: string
    }
    stats: {
      play_count: number
      like_count: number
      comment_count: number
      share_count: number
    }
    create_time: number
    hashtags: Array<{
      name: string
    }>
  }>
  has_more: boolean
  cursor?: string
}

export class TikTokAPI {
  private apiKey: string
  private baseURL = 'https://api.tiktok.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getTrendingVideos(count = 50): Promise<TikTokVideo[]> {
    try {
      const response = await axios.get<TikTokAPIResponse>(`${this.baseURL}/trending/videos`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          count,
          region: 'JP',
        },
      })

      return response.data.data.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author.nickname,
        viewCount: item.stats.play_count,
        likeCount: item.stats.like_count,
        commentCount: item.stats.comment_count,
        shareCount: item.stats.share_count,
        hashtags: item.hashtags.map(tag => tag.name),
        publishedAt: new Date(item.create_time * 1000).toISOString(),
      }))
    } catch (error) {
      console.error('TikTok API Error:', error)
      
      return this.getMockTikTokData()
    }
  }

  async getVideosByHashtag(hashtag: string, count = 25): Promise<TikTokVideo[]> {
    try {
      const response = await axios.get<TikTokAPIResponse>(`${this.baseURL}/hashtag/videos`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          hashtag,
          count,
        },
      })

      return response.data.data.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author.nickname,
        viewCount: item.stats.play_count,
        likeCount: item.stats.like_count,
        commentCount: item.stats.comment_count,
        shareCount: item.stats.share_count,
        hashtags: item.hashtags.map(tag => tag.name),
        publishedAt: new Date(item.create_time * 1000).toISOString(),
      }))
    } catch (error) {
      console.error('TikTok Hashtag API Error:', error)
      return this.getMockTikTokData()
    }
  }

  private getMockTikTokData(): TikTokVideo[] {
    return [
      {
        id: 'mock_1',
        title: 'ダンストレンド #fyp',
        author: 'user1',
        viewCount: 1500000,
        likeCount: 120000,
        commentCount: 8500,
        shareCount: 15000,
        hashtags: ['fyp', 'dance', 'trending'],
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'mock_2',
        title: '料理動画 簡単レシピ',
        author: 'cookingmaster',
        viewCount: 890000,
        likeCount: 67000,
        commentCount: 3200,
        shareCount: 8900,
        hashtags: ['cooking', 'recipe', 'food'],
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock_3',
        title: 'ペットの可愛い瞬間',
        author: 'petlover',
        viewCount: 2100000,
        likeCount: 180000,
        commentCount: 12000,
        shareCount: 25000,
        hashtags: ['pets', 'cute', 'animals'],
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  async getTrendingHashtags(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/trending/hashtags`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          region: 'JP',
        },
      })

      return response.data.hashtags || ['fyp', 'trending', 'viral', 'dance', 'cooking']
    } catch (error) {
      console.error('TikTok Trending Hashtags Error:', error)
      return ['fyp', 'trending', 'viral', 'dance', 'cooking', 'pets', 'music', 'comedy']
    }
  }
}