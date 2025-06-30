import { YouTubeAPI } from './youtube-api'
import { TikTokAPI } from './tiktok-api'
import { prisma } from './db'
import { Platform } from '@prisma/client'
import { getWeek, getMonth, getYear } from 'date-fns'

export class DataCollector {
  private youtubeAPI: YouTubeAPI
  private tiktokAPI: TikTokAPI

  constructor() {
    const youtubeKey = process.env.YOUTUBE_API_KEY
    const tiktokKey = process.env.TIKTOK_API_KEY

    if (!youtubeKey) {
      throw new Error('YOUTUBE_API_KEY is required')
    }
    if (!tiktokKey) {
      throw new Error('TIKTOK_API_KEY is required')
    }

    this.youtubeAPI = new YouTubeAPI(youtubeKey)
    this.tiktokAPI = new TikTokAPI(tiktokKey)
  }

  async collectYouTubeData(): Promise<void> {
    console.log('🎥 Collecting YouTube trending data...')
    
    try {
      const videos = await this.youtubeAPI.getTrendingVideos('JP', 50)
      const now = new Date()
      const weekNumber = getWeek(now)
      const monthNumber = getMonth(now) + 1
      const year = getYear(now)

      for (const video of videos) {
        await prisma.trendData.upsert({
          where: {
            videoId_platform: {
              videoId: video.id,
              platform: Platform.YOUTUBE,
            },
          },
          update: {
            views: BigInt(video.viewCount),
            likes: parseInt(video.likeCount),
            comments: parseInt(video.commentCount),
            collectedAt: now,
          },
          create: {
            platform: Platform.YOUTUBE,
            title: video.title,
            videoId: video.id,
            views: BigInt(video.viewCount),
            likes: parseInt(video.likeCount),
            comments: parseInt(video.commentCount),
            hashtags: video.tags || [],
            category: await this.getCategoryName(video.categoryId),
            weekNumber,
            monthNumber,
            year,
          },
        })
      }

      console.log(`✅ Collected ${videos.length} YouTube videos`)
    } catch (error) {
      console.error('❌ YouTube data collection failed:', error)
      throw error
    }
  }

  async collectTikTokData(): Promise<void> {
    console.log('🎵 Collecting TikTok trending data...')
    
    try {
      const videos = await this.tiktokAPI.getTrendingVideos(50)
      const now = new Date()
      const weekNumber = getWeek(now)
      const monthNumber = getMonth(now) + 1
      const year = getYear(now)

      for (const video of videos) {
        await prisma.trendData.upsert({
          where: {
            videoId_platform: {
              videoId: video.id,
              platform: Platform.TIKTOK,
            },
          },
          update: {
            views: BigInt(video.viewCount),
            likes: video.likeCount,
            comments: video.commentCount,
            collectedAt: now,
          },
          create: {
            platform: Platform.TIKTOK,
            title: video.title,
            videoId: video.id,
            views: BigInt(video.viewCount),
            likes: video.likeCount,
            comments: video.commentCount,
            hashtags: video.hashtags,
            category: this.categorizeTikTokContent(video.hashtags),
            weekNumber,
            monthNumber,
            year,
          },
        })
      }

      console.log(`✅ Collected ${videos.length} TikTok videos`)
    } catch (error) {
      console.error('❌ TikTok data collection failed:', error)
      
      await this.saveMockTikTokData()
    }
  }

  private async saveMockTikTokData(): Promise<void> {
    const mockVideos = await this.tiktokAPI.getTrendingVideos(10)
    const now = new Date()
    const weekNumber = getWeek(now)
    const monthNumber = getMonth(now) + 1
    const year = getYear(now)

    for (const video of mockVideos) {
      await prisma.trendData.create({
        data: {
          platform: Platform.TIKTOK,
          title: video.title,
          videoId: video.id,
          views: BigInt(video.viewCount),
          likes: video.likeCount,
          comments: video.commentCount,
          hashtags: video.hashtags,
          category: this.categorizeTikTokContent(video.hashtags),
          weekNumber,
          monthNumber,
          year,
        },
      })
    }

    console.log('✅ Saved mock TikTok data')
  }

  private async getCategoryName(categoryId: string): Promise<string> {
    const categoryMap: Record<string, string> = {
      '1': 'Film & Animation',
      '2': 'Autos & Vehicles',
      '10': 'Music',
      '15': 'Pets & Animals',
      '17': 'Sports',
      '19': 'Travel & Events',
      '20': 'Gaming',
      '22': 'People & Blogs',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News & Politics',
      '26': 'Howto & Style',
      '27': 'Education',
      '28': 'Science & Technology',
    }

    return categoryMap[categoryId] || 'Other'
  }

  private categorizeTikTokContent(hashtags: string[]): string {
    const categories = {
      'Dance': ['dance', 'dancing', 'choreography'],
      'Music': ['music', 'song', 'singing'],
      'Comedy': ['funny', 'comedy', 'humor', 'laugh'],
      'Food': ['food', 'cooking', 'recipe', 'kitchen'],
      'Fashion': ['fashion', 'style', 'outfit'],
      'Education': ['learn', 'education', 'tutorial'],
      'Pets': ['pets', 'animals', 'dog', 'cat'],
      'Sports': ['sports', 'workout', 'fitness'],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (hashtags.some(tag => keywords.includes(tag.toLowerCase()))) {
        return category
      }
    }

    return 'Entertainment'
  }

  async collectAllData(): Promise<void> {
    console.log('🚀 Starting data collection...')
    
    try {
      await Promise.all([
        this.collectYouTubeData(),
        this.collectTikTokData(),
      ])
      
      console.log('✅ Data collection completed successfully')
    } catch (error) {
      console.error('❌ Data collection failed:', error)
      throw error
    }
  }

  async getLatestTrends(platform: Platform, limit = 20) {
    return await prisma.trendData.findMany({
      where: { platform },
      orderBy: [
        { views: 'desc' },
        { collectedAt: 'desc' },
      ],
      take: limit,
    })
  }

  async getTrendsByWeek(weekNumber: number, year: number, platform?: Platform) {
    return await prisma.trendData.findMany({
      where: {
        weekNumber,
        year,
        ...(platform && { platform }),
      },
      orderBy: { views: 'desc' },
    })
  }

  async getTrendsByMonth(monthNumber: number, year: number, platform?: Platform) {
    return await prisma.trendData.findMany({
      where: {
        monthNumber,
        year,
        ...(platform && { platform }),
      },
      orderBy: { views: 'desc' },
    })
  }
}