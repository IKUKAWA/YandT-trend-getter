export interface ChannelBasicInfo {
  id: string
  platform: 'youtube' | 'tiktok'
  channelId: string
  channelName: string
  avatar?: string
  subscriberCount: number
  videoCount: number
  createdDate: Date
  category: string
  lastUpdated: Date
  description?: string
  verified?: boolean
}

export interface ChannelGrowthData {
  date: Date
  subscriberCount: number
  videoCount: number
  avgViews: number
  engagementRate: number
  monthlyGrowthRate?: number
  weeklyGrowthRate?: number
}

export interface ChannelGrowthAnalysis {
  current: ChannelGrowthData
  history: ChannelGrowthData[]
  monthlyGrowthRate: number
  weeklyGrowthRate: number
  trend: 'up' | 'down' | 'stable'
  trendStrength: number // 1-10
  rankingChange: number // +3, -2, etc.
  growthAcceleration: number // compared to previous period
  milestones: {
    nextSubscriberMilestone: number
    timeToMilestone: number // days
    confidenceScore: number // 0-100
  }
}

export interface CompetitorChannel {
  id: string
  name: string
  platform: 'youtube' | 'tiktok'
  subscriberCount: number
  monthlyGrowthRate: number
  avgViews: number
  engagementRate: number
  category: string
  rankingPosition: number
  strengthScore: number // 0-100
}

export interface CompetitorComparison {
  mainChannel: ChannelBasicInfo
  competitors: CompetitorChannel[]
  industryRanking: number
  totalChannelsInCategory: number
  competitiveAdvantages: string[]
  weaknesses: string[]
  marketShare: number // percentage
}

export interface MonetizationAnalysis {
  eligibilityStatus: {
    youtube: {
      subscribers: boolean // 1000+
      watchHours: boolean // 4000+
      eligible: boolean
    }
    tiktok: {
      followers: boolean // 1000+
      views: boolean // 10000+
      eligible: boolean
    }
  }
  revenueEstimate: {
    monthly: {
      min: number
      max: number
      currency: string
    }
    cpmRate: number
    sponsorshipValue: number
  }
  projections: {
    threeMonths: number
    sixMonths: number
    oneYear: number
  }
  recommendations: {
    nextSteps: string[]
    timeline: string
    priority: 'high' | 'medium' | 'low'
  }
}

export interface AIChannelReport {
  summary: string
  growthFactors: string[]
  differentiationPoints: string[]
  monetizationStrategy: string
  actionItems: Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    timeline: string
    expectedImpact: string
  }>
  competitiveInsights: string
  confidenceScore: number // 0-100
  reportDate: Date
}

export interface ChannelAnalysis {
  basicInfo: ChannelBasicInfo
  growthAnalysis: ChannelGrowthAnalysis
  competitorComparison: CompetitorComparison
  monetization: MonetizationAnalysis
  aiReport: AIChannelReport
  lastAnalyzed: Date
}

export interface ChannelSearchResult {
  id: string
  platform: 'youtube' | 'tiktok'
  name: string
  avatar?: string
  subscriberCount: number
  category: string
  verified?: boolean
  description?: string
}

export interface ChannelAnalysisRequest {
  platform: 'youtube' | 'tiktok'
  channelId: string
  includeCompetitors?: boolean
  competitorChannelIds?: string[]
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive'
}