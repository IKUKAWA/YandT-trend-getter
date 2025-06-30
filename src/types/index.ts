export interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  publishedAt: string
  viewCount: string
  likeCount: string
  commentCount: string
  tags?: string[]
  categoryId: string
  thumbnail: string
}

export interface TikTokVideo {
  id: string
  title: string
  author: string
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  hashtags: string[]
  publishedAt: string
}

export interface TrendAnalysisResult {
  weekNumber: number
  monthNumber: number
  year: number
  platform: 'YOUTUBE' | 'TIKTOK'
  topCategories: Record<string, number>
  growthTrends: {
    category: string
    growth: number
    trend: 'up' | 'down' | 'stable'
  }[]
  insights: string
}

export interface APIResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
}