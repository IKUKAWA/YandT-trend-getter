import { 
  ChannelBasicInfo, 
  ChannelGrowthData, 
  ChannelGrowthAnalysis,
  CompetitorChannel,
  CompetitorComparison,
  MonetizationAnalysis,
  AIChannelReport,
  ChannelAnalysis,
  ChannelSearchResult
} from '@/types/channel'

// Sample channel basic info
export const sampleChannelBasicInfo: ChannelBasicInfo = {
  id: 'ch_001',
  platform: 'youtube',
  channelId: 'UC1234567890',
  channelName: 'テックレビューチャンネル',
  avatar: '/avatars/tech-channel.jpg',
  subscriberCount: 150000,
  videoCount: 230,
  createdDate: new Date('2021-03-15'),
  category: 'テクノロジー',
  lastUpdated: new Date(),
  description: '最新のテクノロジー製品をわかりやすくレビューするチャンネルです。',
  verified: true
}

// Sample growth history data
export const sampleGrowthHistory: ChannelGrowthData[] = [
  { date: new Date('2024-01-01'), subscriberCount: 120000, videoCount: 180, avgViews: 15000, engagementRate: 0.045 },
  { date: new Date('2024-02-01'), subscriberCount: 125000, videoCount: 190, avgViews: 16200, engagementRate: 0.048 },
  { date: new Date('2024-03-01'), subscriberCount: 132000, videoCount: 200, avgViews: 17800, engagementRate: 0.052 },
  { date: new Date('2024-04-01'), subscriberCount: 138000, videoCount: 210, avgViews: 18500, engagementRate: 0.055 },
  { date: new Date('2024-05-01'), subscriberCount: 144000, videoCount: 220, avgViews: 19200, engagementRate: 0.058 },
  { date: new Date('2024-06-01'), subscriberCount: 150000, videoCount: 230, avgViews: 20100, engagementRate: 0.061 }
]

// Sample growth analysis
export const sampleGrowthAnalysis: ChannelGrowthAnalysis = {
  current: sampleGrowthHistory[sampleGrowthHistory.length - 1],
  history: sampleGrowthHistory,
  monthlyGrowthRate: 4.2,
  weeklyGrowthRate: 1.1,
  trend: 'up',
  trendStrength: 8,
  rankingChange: +3,
  growthAcceleration: 1.15,
  milestones: {
    nextSubscriberMilestone: 200000,
    timeToMilestone: 85,
    confidenceScore: 87
  }
}

// Sample competitor channels
export const sampleCompetitors: CompetitorChannel[] = [
  {
    id: 'comp_001',
    name: 'テクノロジー解説チャンネル',
    platform: 'youtube',
    subscriberCount: 180000,
    monthlyGrowthRate: 3.1,
    avgViews: 22000,
    engagementRate: 0.042,
    category: 'テクノロジー',
    rankingPosition: 2,
    strengthScore: 85
  },
  {
    id: 'comp_002',
    name: 'ガジェットマスター',
    platform: 'youtube',
    subscriberCount: 220000,
    monthlyGrowthRate: 2.8,
    avgViews: 25000,
    engagementRate: 0.038,
    category: 'テクノロジー',
    rankingPosition: 1,
    strengthScore: 92
  },
  {
    id: 'comp_003',
    name: 'IT情報局',
    platform: 'youtube',
    subscriberCount: 95000,
    monthlyGrowthRate: 2.1,
    avgViews: 12000,
    engagementRate: 0.048,
    category: 'テクノロジー',
    rankingPosition: 5,
    strengthScore: 72
  },
  {
    id: 'comp_004',
    name: 'デジタルニュース',
    platform: 'youtube',
    subscriberCount: 130000,
    monthlyGrowthRate: 1.9,
    avgViews: 16000,
    engagementRate: 0.044,
    category: 'テクノロジー',
    rankingPosition: 4,
    strengthScore: 78
  }
]

// Sample competitor comparison
export const sampleCompetitorComparison: CompetitorComparison = {
  mainChannel: sampleChannelBasicInfo,
  competitors: sampleCompetitors,
  industryRanking: 3,
  totalChannelsInCategory: 1250,
  competitiveAdvantages: [
    '高いエンゲージメント率',
    '一貫した投稿頻度',
    '技術的な深い解説',
    '視聴者との積極的な交流'
  ],
  weaknesses: [
    '登録者数では競合に劣る',
    'ショート動画の活用が不十分',
    'トレンド反応の速度'
  ],
  marketShare: 2.3
}

// Sample monetization analysis
export const sampleMonetizationAnalysis: MonetizationAnalysis = {
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
      min: 45000,
      max: 120000,
      currency: 'JPY'
    },
    cpmRate: 150,
    sponsorshipValue: 80000
  },
  projections: {
    threeMonths: 85000,
    sixMonths: 140000,
    oneYear: 220000
  },
  recommendations: {
    nextSteps: [
      'ショート動画コンテンツの増加',
      'メンバーシップ制度の導入',
      'スポンサー企業との長期契約検討',
      '商品レビューでのアフィリエイト強化'
    ],
    timeline: '3-6ヶ月',
    priority: 'high'
  }
}

// Sample AI report
export const sampleAIReport: AIChannelReport = {
  summary: 'テックレビューチャンネルは、一貫した高品質なコンテンツと視聴者エンゲージメントにより安定した成長を続けています。特に技術解説の分かりやすさと投稿の規則性が成長要因として挙げられます。',
  growthFactors: [
    '週2回の安定した投稿スケジュール',
    '初心者にも理解しやすい技術解説',
    'コメント欄での活発な視聴者交流',
    'トレンド商品の迅速なレビュー',
    'サムネイルとタイトルの最適化'
  ],
  differentiationPoints: [
    '他チャンネルより詳細な技術仕様説明',
    '実際の使用シーンでの検証',
    '価格帯別の比較レビュー',
    '視聴者からのリクエストへの対応'
  ],
  monetizationStrategy: '現在の成長率を維持しながら、ショート動画の活用とメンバーシップ制度の導入により収益の多角化を図ることを推奨します。また、テック企業との長期スポンサーシップ契約により安定収入の確保も可能です。',
  actionItems: [
    {
      action: 'YouTube Shortsの投稿頻度を週3本に増加',
      priority: 'high',
      timeline: '1ヶ月以内',
      expectedImpact: '新規視聴者獲得とエンゲージメント向上'
    },
    {
      action: 'チャンネルメンバーシップ制度の導入',
      priority: 'high',
      timeline: '2ヶ月以内',
      expectedImpact: '月額収益の安定化'
    },
    {
      action: 'テック企業との長期スポンサーシップ契約',
      priority: 'medium',
      timeline: '3-6ヶ月',
      expectedImpact: '収益の大幅増加'
    },
    {
      action: 'ライブ配信コンテンツの開始',
      priority: 'medium',
      timeline: '2-3ヶ月',
      expectedImpact: 'リアルタイムエンゲージメント強化'
    }
  ],
  competitiveInsights: '競合と比較して、エンゲージメント率が高く、視聴者ロイヤリティが強いことが確認できます。ただし、登録者数の絶対値では上位競合に劣るため、バイラル要素のあるコンテンツ制作も検討すべきです。',
  confidenceScore: 89,
  reportDate: new Date()
}

// Complete channel analysis
export const sampleChannelAnalysis: ChannelAnalysis = {
  basicInfo: sampleChannelBasicInfo,
  growthAnalysis: sampleGrowthAnalysis,
  competitorComparison: sampleCompetitorComparison,
  monetization: sampleMonetizationAnalysis,
  aiReport: sampleAIReport,
  lastAnalyzed: new Date()
}

// Sample search results
export const sampleSearchResults: ChannelSearchResult[] = [
  {
    id: 'ch_001',
    platform: 'youtube',
    name: 'テックレビューチャンネル',
    avatar: '/avatars/tech-channel.jpg',
    subscriberCount: 150000,
    category: 'テクノロジー',
    verified: true,
    description: '最新のテクノロジー製品をわかりやすくレビュー'
  },
  {
    id: 'ch_002',
    platform: 'youtube',
    name: 'ガジェットマスター',
    avatar: '/avatars/gadget-master.jpg',
    subscriberCount: 220000,
    category: 'テクノロジー',
    verified: true,
    description: 'ガジェット好きによるガジェット好きのためのチャンネル'
  },
  {
    id: 'ch_003',
    platform: 'tiktok',
    name: 'テクトック',
    subscriberCount: 85000,
    category: 'テクノロジー',
    verified: false,
    description: 'TikTokでテクノロジーを面白く紹介'
  },
  {
    id: 'ch_004',
    platform: 'youtube',
    name: 'IT情報局',
    subscriberCount: 95000,
    category: 'テクノロジー',
    verified: false,
    description: 'IT業界の最新ニュースと解説'
  }
]

// API functions - Real API calls
export const searchChannels = async (query: string, options?: {
  platform?: 'youtube' | 'tiktok' | 'all'
  category?: string
  minSubscribers?: number
  maxSubscribers?: number
  verified?: 'true' | 'false'
  limit?: number
  offset?: number
}): Promise<ChannelSearchResult[]> => {
  try {
    const params = new URLSearchParams({
      q: query,
      ...(options?.platform && { platform: options.platform }),
      ...(options?.category && { category: options.category }),
      ...(options?.minSubscribers && { minSubscribers: options.minSubscribers.toString() }),
      ...(options?.maxSubscribers && { maxSubscribers: options.maxSubscribers.toString() }),
      ...(options?.verified && { verified: options.verified }),
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.offset && { offset: options.offset.toString() })
    })

    const url = `/api/channels/search?${params}`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching from URL:', url)
    }
    
    const response = await fetch(url)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Response status:', response.status)
    }
    
    const data = await response.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response data:', data)
    }
    
    if (!data.success) {
      console.error('API returned error:', data.error)
      throw new Error(data.error)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Search results from API:', data.results)
    }
    return data.results
  } catch (error) {
    console.error('Channel search error:', error)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Using fallback sample data')
    }
    
    // Fallback to sample data in case of error
    const fallbackResults = sampleSearchResults.filter(channel => 
      channel.name.toLowerCase().includes(query.toLowerCase()) ||
      channel.description?.toLowerCase().includes(query.toLowerCase())
    )
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fallback results:', fallbackResults)
    }
    return fallbackResults
  }
}

export const getChannelAnalysis = async (
  channelId: string, 
  options?: {
    depth?: 'basic' | 'detailed' | 'comprehensive'
    includeCompetitors?: boolean
    includeAI?: boolean
    refresh?: boolean
  }
): Promise<ChannelAnalysis> => {
  try {
    const params = new URLSearchParams({
      ...(options?.depth && { depth: options.depth }),
      ...(options?.includeCompetitors && { includeCompetitors: 'true' }),
      ...(options?.includeAI && { includeAI: 'true' }),
      ...(options?.refresh && { refresh: 'true' })
    })

    const response = await fetch(`/api/channels/${channelId}/analysis?${params}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('Channel analysis error:', error)
    // Fallback to sample data in case of error
    return sampleChannelAnalysis
  }
}

export const getChannelGrowthAnalysis = async (
  channelId: string,
  options?: {
    timeRange?: '3months' | '6months' | '1year' | '2years'
    metrics?: string[]
    granularity?: 'daily' | 'weekly' | 'monthly'
    includeProjections?: boolean
  }
) => {
  try {
    const params = new URLSearchParams({
      ...(options?.timeRange && { timeRange: options.timeRange }),
      ...(options?.metrics && { metrics: options.metrics.join(',') }),
      ...(options?.granularity && { granularity: options.granularity }),
      ...(options?.includeProjections && { includeProjections: 'true' })
    })

    const response = await fetch(`/api/channels/${channelId}/growth?${params}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('Growth analysis error:', error)
    return sampleGrowthAnalysis
  }
}

export const getChannelMonetization = async (
  channelId: string,
  options?: {
    platform?: 'youtube' | 'tiktok'
    subscriberCount?: number
    avgViews?: number
    videoCount?: number
    includeProjections?: boolean
    includeComparison?: boolean
  }
) => {
  try {
    const params = new URLSearchParams({
      ...(options?.platform && { platform: options.platform }),
      ...(options?.subscriberCount && { subscriberCount: options.subscriberCount.toString() }),
      ...(options?.avgViews && { avgViews: options.avgViews.toString() }),
      ...(options?.videoCount && { videoCount: options.videoCount.toString() }),
      ...(options?.includeProjections && { includeProjections: 'true' }),
      ...(options?.includeComparison && { includeComparison: 'true' })
    })

    const response = await fetch(`/api/channels/${channelId}/monetization?${params}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('Monetization analysis error:', error)
    return sampleMonetizationAnalysis
  }
}

export const getChannelAIReport = async (
  channelId: string,
  options?: {
    type?: 'basic' | 'detailed' | 'comprehensive'
    focus?: 'growth' | 'monetization' | 'competition' | 'content'
    includeActionPlan?: boolean
    language?: string
  }
) => {
  try {
    const params = new URLSearchParams({
      ...(options?.type && { type: options.type }),
      ...(options?.focus && { focus: options.focus }),
      ...(options?.includeActionPlan && { includeActionPlan: 'true' }),
      ...(options?.language && { language: options.language })
    })

    const response = await fetch(`/api/channels/${channelId}/ai-report?${params}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('AI report error:', error)
    return sampleAIReport
  }
}

export const generateCustomAIReport = async (
  channelId: string,
  options: {
    customPrompt?: string
    analysisParameters?: Record<string, any>
    competitorData?: any[]
    specificQuestions?: string[]
  }
) => {
  try {
    const response = await fetch(`/api/channels/${channelId}/ai-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('Custom AI report error:', error)
    throw error
  }
}

export const refreshChannelData = async (
  channelId: string,
  options?: {
    competitorChannelIds?: string[]
    analysisOptions?: Record<string, any>
    updatePreferences?: Record<string, any>
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/channels/${channelId}/analysis`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options || {})
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return true
  } catch (error) {
    console.error('Channel data refresh error:', error)
    return false
  }
}

export const clearChannelCache = async (channelId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/channels/${channelId}/analysis`, {
      method: 'DELETE'
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return true
  } catch (error) {
    console.error('Channel cache clear error:', error)
    return false
  }
}

// Advanced search function
export const advancedChannelSearch = async (searchOptions: {
  query: string
  filters?: {
    platforms?: string[]
    categories?: string[]
    subscriberRange?: { min?: number; max?: number }
    verifiedOnly?: boolean
  }
  sorting?: {
    field: 'subscriberCount' | 'name' | 'relevance'
    order: 'asc' | 'desc'
  }
  pagination?: {
    limit: number
    offset: number
  }
}): Promise<{
  results: ChannelSearchResult[]
  total: number
  hasMore: boolean
}> => {
  try {
    const response = await fetch('/api/channels/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchOptions)
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return {
      results: data.results,
      total: data.total,
      hasMore: data.pagination.hasMore
    }
  } catch (error) {
    console.error('Advanced search error:', error)
    // Fallback to basic search
    const results = await searchChannels(searchOptions.query)
    return {
      results,
      total: results.length,
      hasMore: false
    }
  }
}