import { http, HttpResponse } from 'msw'
import { ChannelSearchResult, ChannelAnalysis } from '@/types/channel'

// Mock data
const mockChannels: ChannelSearchResult[] = [
  {
    id: 'ch_test_001',
    platform: 'youtube',
    name: 'テストチャンネル',
    subscriberCount: 100000,
    category: 'テクノロジー',
    verified: true,
    description: 'テスト用のチャンネルです'
  },
  {
    id: 'ch_test_002',
    platform: 'tiktok',
    name: 'TikTokテストチャンネル',
    subscriberCount: 50000,
    category: 'エンターテイメント',
    verified: false,
    description: 'TikTokテスト用チャンネル'
  }
]

const mockChannelAnalysis: ChannelAnalysis = {
  basicInfo: {
    id: 'ch_test_001',
    platform: 'youtube',
    channelId: 'UC_test_001',
    channelName: 'テストチャンネル',
    subscriberCount: 100000,
    videoCount: 200,
    createdDate: new Date('2020-01-01'),
    category: 'テクノロジー',
    lastUpdated: new Date(),
    description: 'テスト用のチャンネルです',
    verified: true
  },
  growthAnalysis: {
    current: {
      date: new Date(),
      subscriberCount: 100000,
      videoCount: 200,
      avgViews: 15000,
      engagementRate: 0.05
    },
    history: [
      {
        date: new Date('2024-01-01'),
        subscriberCount: 90000,
        videoCount: 180,
        avgViews: 12000,
        engagementRate: 0.045
      },
      {
        date: new Date('2024-06-01'),
        subscriberCount: 100000,
        videoCount: 200,
        avgViews: 15000,
        engagementRate: 0.05
      }
    ],
    monthlyGrowthRate: 2.5,
    weeklyGrowthRate: 0.6,
    trend: 'up',
    trendStrength: 8,
    rankingChange: 2,
    growthAcceleration: 1.1,
    milestones: {
      nextSubscriberMilestone: 150000,
      timeToMilestone: 120,
      confidenceScore: 85
    }
  },
  competitorComparison: {
    mainChannel: {
      id: 'ch_test_001',
      platform: 'youtube',
      channelId: 'UC_test_001',
      channelName: 'テストチャンネル',
      subscriberCount: 100000,
      videoCount: 200,
      createdDate: new Date('2020-01-01'),
      category: 'テクノロジー',
      lastUpdated: new Date(),
      description: 'テスト用のチャンネルです',
      verified: true
    },
    competitors: [
      {
        id: 'comp_001',
        name: '競合チャンネルA',
        platform: 'youtube',
        subscriberCount: 120000,
        monthlyGrowthRate: 2.0,
        avgViews: 18000,
        engagementRate: 0.048,
        category: 'テクノロジー',
        rankingPosition: 1,
        strengthScore: 88
      }
    ],
    industryRanking: 3,
    totalChannelsInCategory: 500,
    competitiveAdvantages: ['高いエンゲージメント率', '一貫した投稿スケジュール'],
    weaknesses: ['登録者数が競合より少ない'],
    marketShare: 1.8
  },
  monetization: {
    eligibilityStatus: {
      youtube: {
        subscribers: true,
        watchHours: true,
        eligible: true
      },
      tiktok: {
        followers: true,
        views: true,
        eligible: true
      }
    },
    revenueEstimate: {
      monthly: {
        min: 30000,
        max: 80000,
        currency: 'JPY'
      },
      cpmRate: 120,
      sponsorshipValue: 60000
    },
    projections: {
      threeMonths: 70000,
      sixMonths: 120000,
      oneYear: 200000
    },
    recommendations: {
      nextSteps: ['ショート動画の増加', 'メンバーシップ導入'],
      timeline: '3ヶ月',
      priority: 'high'
    }
  },
  aiReport: {
    summary: 'テストチャンネルは安定した成長を続けており、エンゲージメント率が高いのが特徴です。',
    growthFactors: ['一貫した投稿スケジュール', '高品質なコンテンツ'],
    differentiationPoints: ['技術的な深い解説', '視聴者との積極的な交流'],
    monetizationStrategy: 'ショート動画とメンバーシップの活用を推奨します。',
    actionItems: [
      {
        action: 'ショート動画の投稿頻度増加',
        priority: 'high',
        timeline: '1ヶ月',
        expectedImpact: '新規視聴者獲得'
      }
    ],
    competitiveInsights: '競合と比較してエンゲージメント率が高く、優位性があります。',
    confidenceScore: 87,
    reportDate: new Date()
  },
  lastAnalyzed: new Date()
}

export const handlers = [
  // Channel search endpoint
  http.get('/api/channels/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const platform = url.searchParams.get('platform')
    
    let filteredChannels = mockChannels
    
    if (query) {
      filteredChannels = filteredChannels.filter(channel => 
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.description?.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    if (platform && platform !== 'all') {
      filteredChannels = filteredChannels.filter(channel => 
        channel.platform === platform
      )
    }
    
    return HttpResponse.json({
      success: true,
      results: filteredChannels,
      total: filteredChannels.length,
      query,
      analytics: {
        totalResults: filteredChannels.length,
        platforms: {
          youtube: filteredChannels.filter(c => c.platform === 'youtube').length,
          tiktok: filteredChannels.filter(c => c.platform === 'tiktok').length
        },
        categories: {},
        averageSubscribers: 75000,
        verifiedCount: filteredChannels.filter(c => c.verified).length
      },
      pagination: {
        limit: 10,
        offset: 0,
        hasMore: false
      }
    })
  }),

  // Channel analysis endpoint
  http.get('/api/channels/:id/analysis', ({ params }) => {
    const { id } = params
    
    if (id === 'ch_test_001') {
      return HttpResponse.json({
        success: true,
        data: mockChannelAnalysis
      })
    }
    
    return HttpResponse.json(
      { success: false, error: 'Channel not found' },
      { status: 404 }
    )
  }),

  // Channel growth endpoint
  http.get('/api/channels/:id/growth', ({ params }) => {
    const { id } = params
    
    if (id === 'ch_test_001') {
      return HttpResponse.json({
        success: true,
        data: mockChannelAnalysis.growthAnalysis
      })
    }
    
    return HttpResponse.json(
      { success: false, error: 'Channel not found' },
      { status: 404 }
    )
  }),

  // Channel monetization endpoint
  http.get('/api/channels/:id/monetization', ({ params }) => {
    const { id } = params
    
    if (id === 'ch_test_001') {
      return HttpResponse.json({
        success: true,
        data: mockChannelAnalysis.monetization
      })
    }
    
    return HttpResponse.json(
      { success: false, error: 'Channel not found' },
      { status: 404 }
    )
  }),

  // Channel AI report endpoint
  http.get('/api/channels/:id/ai-report', ({ params }) => {
    const { id } = params
    
    if (id === 'ch_test_001') {
      return HttpResponse.json({
        success: true,
        data: mockChannelAnalysis.aiReport
      })
    }
    
    return HttpResponse.json(
      { success: false, error: 'Channel not found' },
      { status: 404 }
    )
  }),

  // Trend data endpoints
  http.get('/api/trends', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'trend_001',
          title: 'テストトレンド',
          platform: 'YOUTUBE',
          views: 1000000,
          likes: 50000,
          comments: 5000,
          category: 'テクノロジー',
          hashtags: ['#テスト', '#トレンド'],
          collectedAt: new Date().toISOString(),
          videoId: 'test123'
        }
      ]
    })
  }),

  // Predictions endpoints
  http.get('/api/predictions/weekly', () => {
    return HttpResponse.json({
      success: true,
      data: {
        predictions: [
          {
            category: 'テクノロジー',
            trend: 'up',
            confidence: 85,
            description: 'AIとテクノロジー関連コンテンツが上昇傾向'
          }
        ],
        timestamp: new Date().toISOString()
      }
    })
  }),

  // Error simulation for testing
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      { success: false, error: 'Test error' },
      { status: 500 }
    )
  })
]