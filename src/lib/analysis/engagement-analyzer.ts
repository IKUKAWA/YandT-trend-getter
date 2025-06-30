import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getWeek, getMonth, getYear, subWeeks, subMonths } from 'date-fns'

interface EngagementMetrics {
  likeRate: number
  commentRate: number
  shareRate: number
  engagementRate: number
  viralFactor: number
  averageEngagementTime: number
}

interface PlatformEngagement {
  platform: Platform
  metrics: EngagementMetrics
  characteristics: {
    peakEngagementTime: string
    dominantEngagementType: 'likes' | 'comments' | 'shares'
    audienceRetention: number
    conversionRate: number
  }
  benchmarks: {
    topPerformerThreshold: number
    averagePerformance: number
    lowPerformanceThreshold: number
  }
}

interface EngagementAnalysis {
  overallMetrics: EngagementMetrics
  platformBreakdown: PlatformEngagement[]
  viralContent: Array<{
    id: string
    title: string
    platform: Platform
    viralScore: number
    engagementVelocity: number
    factors: string[]
  }>
  engagementTrends: Array<{
    period: string
    avgEngagement: number
    changeRate: number
    topFactors: string[]
  }>
  recommendations: string[]
  aiInsights: string
}

interface ContentPerformance {
  contentId: string
  title: string
  platform: Platform
  views: number
  likes: number
  comments: number
  shares: number
  publishedAt: Date
  engagementScore: number
  viralPotential: number
}

export class EngagementAnalyzer {
  private anthropic: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for engagement analysis')
    }

    this.anthropic = new Anthropic({
      apiKey,
    })
  }

  async analyzeEngagementMetrics(
    platform?: Platform,
    timeframe: 'week' | 'month' = 'week'
  ): Promise<EngagementAnalysis> {
    console.log(`📊 Analyzing engagement metrics for ${platform || 'all platforms'}`)

    const now = new Date()
    const whereClause = this.buildTimeframeFilter(timeframe, now, platform)

    const trendData = await prisma.trendData.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    const overallMetrics = this.calculateOverallMetrics(trendData)
    const platformBreakdown = await this.analyzePlatformEngagement(trendData)
    const viralContent = await this.identifyViralContent(trendData)
    const engagementTrends = await this.analyzeEngagementTrends(timeframe, platform)
    const recommendations = await this.generateEngagementRecommendations(
      overallMetrics,
      platformBreakdown,
      viralContent
    )
    const aiInsights = await this.generateEngagementInsights(
      overallMetrics,
      platformBreakdown,
      viralContent
    )

    return {
      overallMetrics,
      platformBreakdown,
      viralContent,
      engagementTrends,
      recommendations,
      aiInsights,
    }
  }

  async analyzeContentPerformance(
    contentIds?: string[],
    platform?: Platform
  ): Promise<ContentPerformance[]> {
    console.log(`🎯 Analyzing content performance for ${contentIds?.length || 'all'} items`)

    const whereClause: any = {}
    if (contentIds) {
      whereClause.id = { in: contentIds }
    }
    if (platform) {
      whereClause.platform = platform
    }

    const contents = await prisma.trendData.findMany({
      where: whereClause,
      orderBy: { views: 'desc' },
      take: 100,
    })

    return contents.map(content => ({
      contentId: content.id,
      title: content.title || 'Untitled',
      platform: content.platform,
      views: Number(content.views) || 0,
      likes: content.likes || 0,
      comments: content.comments || 0,
      shares: content.shares || 0,
      publishedAt: content.createdAt,
      engagementScore: this.calculateEngagementScore(content),
      viralPotential: this.calculateViralPotential(content),
    }))
  }

  async getEngagementBenchmarks(platform: Platform): Promise<any> {
    console.log(`📈 Getting engagement benchmarks for ${platform}`)

    const data = await prisma.trendData.findMany({
      where: { platform },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    const engagementRates = data.map(item => this.calculateEngagementRate(item))
    engagementRates.sort((a, b) => a - b)

    const percentile = (p: number) => {
      const index = Math.ceil(engagementRates.length * p) - 1
      return engagementRates[index] || 0
    }

    return {
      platform,
      benchmarks: {
        top10Percent: percentile(0.9),
        top25Percent: percentile(0.75),
        median: percentile(0.5),
        bottom25Percent: percentile(0.25),
        bottom10Percent: percentile(0.1),
      },
      averageMetrics: {
        likeRate: this.calculateAverageLikeRate(data),
        commentRate: this.calculateAverageCommentRate(data),
        engagementRate: engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length,
      },
    }
  }

  private buildTimeframeFilter(timeframe: 'week' | 'month', now: Date, platform?: Platform) {
    const baseFilter: any = {}
    
    if (platform) {
      baseFilter.platform = platform
    }

    if (timeframe === 'week') {
      const weekNumber = getWeek(now)
      const year = getYear(now)
      baseFilter.weekNumber = weekNumber
      baseFilter.year = year
    } else {
      const monthNumber = getMonth(now) + 1
      const year = getYear(now)
      baseFilter.monthNumber = monthNumber
      baseFilter.year = year
    }

    return baseFilter
  }

  private calculateOverallMetrics(data: any[]): EngagementMetrics {
    const totalViews = data.reduce((sum, item) => sum + Number(item.views || 0), 0)
    const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0)
    const totalComments = data.reduce((sum, item) => sum + (item.comments || 0), 0)
    const totalShares = data.reduce((sum, item) => sum + (item.shares || 0), 0)

    const likeRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0
    const commentRate = totalViews > 0 ? (totalComments / totalViews) * 100 : 0
    const shareRate = totalViews > 0 ? (totalShares / totalViews) * 100 : 0
    const engagementRate = likeRate + commentRate + shareRate

    const viralContent = data.filter(item => this.calculateViralPotential(item) > 0.7)
    const viralFactor = viralContent.length / data.length

    return {
      likeRate: Math.round(likeRate * 100) / 100,
      commentRate: Math.round(commentRate * 100) / 100,
      shareRate: Math.round(shareRate * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100,
      viralFactor: Math.round(viralFactor * 100) / 100,
      averageEngagementTime: this.calculateAverageEngagementTime(data),
    }
  }

  private async analyzePlatformEngagement(data: any[]): Promise<PlatformEngagement[]> {
    const platforms = [...new Set(data.map(item => item.platform))]
    const platformAnalyses: PlatformEngagement[] = []

    for (const platform of platforms) {
      const platformData = data.filter(item => item.platform === platform)
      const metrics = this.calculateOverallMetrics(platformData)
      
      const characteristics = {
        peakEngagementTime: this.findPeakEngagementTime(platformData),
        dominantEngagementType: this.findDominantEngagementType(platformData),
        audienceRetention: this.calculateAudienceRetention(platformData),
        conversionRate: this.calculateConversionRate(platformData),
      }

      const benchmarks = await this.calculatePlatformBenchmarks(platform, platformData)

      platformAnalyses.push({
        platform,
        metrics,
        characteristics,
        benchmarks,
      })
    }

    return platformAnalyses
  }

  private async identifyViralContent(data: any[]): Promise<any[]> {
    const viralCandidates = data
      .map(item => ({
        ...item,
        viralScore: this.calculateViralScore(item),
        engagementVelocity: this.calculateEngagementVelocity(item),
      }))
      .filter(item => item.viralScore > 0.6)
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, 10)

    const viralContent = []
    for (const item of viralCandidates) {
      const factors = await this.identifyViralFactors(item)
      viralContent.push({
        id: item.id,
        title: item.title || 'Untitled',
        platform: item.platform,
        viralScore: item.viralScore,
        engagementVelocity: item.engagementVelocity,
        factors,
      })
    }

    return viralContent
  }

  private async analyzeEngagementTrends(
    timeframe: 'week' | 'month',
    platform?: Platform
  ): Promise<any[]> {
    const periods = timeframe === 'week' ? 8 : 6 // 8週間 or 6ヶ月
    const trends = []

    for (let i = 0; i < periods; i++) {
      const date = timeframe === 'week' ? subWeeks(new Date(), i) : subMonths(new Date(), i)
      const whereClause = this.buildTimeframeFilter(timeframe, date, platform)
      
      const periodData = await prisma.trendData.findMany({
        where: whereClause,
      })

      if (periodData.length > 0) {
        const avgEngagement = this.calculateAverageEngagement(periodData)
        const topFactors = await this.identifyTopEngagementFactors(periodData)
        
        trends.push({
          period: this.formatPeriod(date, timeframe),
          avgEngagement,
          changeRate: i === 0 ? 0 : this.calculateChangeRate(trends[i - 1]?.avgEngagement, avgEngagement),
          topFactors,
        })
      }
    }

    return trends.reverse()
  }

  private calculateEngagementScore(content: any): number {
    const views = Number(content.views) || 0
    const likes = content.likes || 0
    const comments = content.comments || 0
    const shares = content.shares || 0

    if (views === 0) return 0

    const engagementRate = ((likes + comments * 2 + shares * 3) / views) * 100
    const normalizedScore = Math.min(engagementRate / 10, 1) // 10%で満点

    return Math.round(normalizedScore * 100) / 100
  }

  private calculateViralPotential(content: any): number {
    const views = Number(content.views) || 0
    const likes = content.likes || 0
    const comments = content.comments || 0
    const shares = content.shares || 0

    // バイラル要素の重み付け
    const shareWeight = 0.5
    const commentWeight = 0.3
    const likeWeight = 0.2

    if (views === 0) return 0

    const shareRatio = shares / views
    const commentRatio = comments / views
    const likeRatio = likes / views

    const viralScore = (
      shareRatio * shareWeight +
      commentRatio * commentWeight +
      likeRatio * likeWeight
    ) * 1000 // スケール調整

    return Math.min(viralScore, 1)
  }

  private calculateEngagementRate(item: any): number {
    const views = Number(item.views) || 0
    const likes = item.likes || 0
    const comments = item.comments || 0

    if (views === 0) return 0
    return ((likes + comments) / views) * 100
  }

  private calculateAverageLikeRate(data: any[]): number {
    const totalViews = data.reduce((sum, item) => sum + Number(item.views || 0), 0)
    const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0)
    
    return totalViews > 0 ? (totalLikes / totalViews) * 100 : 0
  }

  private calculateAverageCommentRate(data: any[]): number {
    const totalViews = data.reduce((sum, item) => sum + Number(item.views || 0), 0)
    const totalComments = data.reduce((sum, item) => sum + (item.comments || 0), 0)
    
    return totalViews > 0 ? (totalComments / totalViews) * 100 : 0
  }

  private calculateViralScore(item: any): number {
    const views = Number(item.views) || 0
    const likes = item.likes || 0
    const comments = item.comments || 0
    const shares = item.shares || 0

    if (views === 0) return 0

    // バイラル指標の複合計算
    const engagementRate = (likes + comments + shares) / views
    const shareImpact = shares / views * 10 // シェアを重視
    const commentQuality = comments / views * 5 // コメントは質の高いエンゲージメント

    return Math.min((engagementRate + shareImpact + commentQuality) / 3, 1)
  }

  private calculateEngagementVelocity(item: any): number {
    // 公開からの経過時間を考慮したエンゲージメント速度
    const hoursSincePublished = Math.max(1, (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60))
    const totalEngagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0)
    
    return totalEngagement / hoursSincePublished
  }

  private findPeakEngagementTime(data: any[]): string {
    const hourCounts = new Array(24).fill(0)
    
    data.forEach(item => {
      const hour = new Date(item.createdAt).getHours()
      hourCounts[hour] += this.calculateEngagementScore(item)
    })

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    return `${peakHour}:00-${peakHour + 1}:00`
  }

  private findDominantEngagementType(data: any[]): 'likes' | 'comments' | 'shares' {
    const totals = {
      likes: data.reduce((sum, item) => sum + (item.likes || 0), 0),
      comments: data.reduce((sum, item) => sum + (item.comments || 0), 0),
      shares: data.reduce((sum, item) => sum + (item.shares || 0), 0),
    }

    return Object.entries(totals).reduce((a, b) => totals[a[0] as keyof typeof totals] > totals[b[0] as keyof typeof totals] ? a : b)[0] as 'likes' | 'comments' | 'shares'
  }

  private calculateAudienceRetention(data: any[]): number {
    // 推定値として平均エンゲージメント率を利用
    const avgEngagement = data.reduce((sum, item) => sum + this.calculateEngagementRate(item), 0) / data.length
    return Math.min(avgEngagement * 2, 100) // 2倍してリテンション率として近似
  }

  private calculateConversionRate(data: any[]): number {
    // コメント率をコンバージョンの代理指標として使用
    return this.calculateAverageCommentRate(data)
  }

  private async calculatePlatformBenchmarks(platform: Platform, data: any[]): Promise<any> {
    const engagementScores = data.map(item => this.calculateEngagementScore(item)).sort((a, b) => a - b)
    
    return {
      topPerformerThreshold: engagementScores[Math.floor(engagementScores.length * 0.9)] || 0,
      averagePerformance: engagementScores[Math.floor(engagementScores.length * 0.5)] || 0,
      lowPerformanceThreshold: engagementScores[Math.floor(engagementScores.length * 0.1)] || 0,
    }
  }

  private async identifyViralFactors(item: any): Promise<string[]> {
    const factors = []
    
    // 高エンゲージメント率
    if (this.calculateEngagementRate(item) > 5) {
      factors.push('高エンゲージメント率')
    }
    
    // 高シェア率
    const shareRate = (item.shares || 0) / Number(item.views || 1) * 100
    if (shareRate > 1) {
      factors.push('高シェア率')
    }
    
    // 急速な拡散
    if (this.calculateEngagementVelocity(item) > 10) {
      factors.push('急速な拡散')
    }

    // ハッシュタグ分析
    if (item.hashtags && item.hashtags.length > 5) {
      factors.push('効果的なハッシュタグ戦略')
    }

    return factors.slice(0, 3)
  }

  private calculateAverageEngagement(data: any[]): number {
    if (data.length === 0) return 0
    return data.reduce((sum, item) => sum + this.calculateEngagementScore(item), 0) / data.length
  }

  private async identifyTopEngagementFactors(data: any[]): Promise<string[]> {
    // 簡略化された実装
    const highEngagementItems = data.filter(item => this.calculateEngagementScore(item) > 0.5)
    const commonHashtags = this.extractCommonHashtags(highEngagementItems)
    
    return commonHashtags.slice(0, 3)
  }

  private extractCommonHashtags(data: any[]): string[] {
    const hashtagCounts = new Map<string, number>()
    
    data.forEach(item => {
      if (item.hashtags) {
        item.hashtags.forEach((tag: string) => {
          hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
        })
      }
    })

    return Array.from(hashtagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)
  }

  private formatPeriod(date: Date, timeframe: 'week' | 'month'): string {
    if (timeframe === 'week') {
      return `${getYear(date)}年第${getWeek(date)}週`
    } else {
      return `${getYear(date)}年${getMonth(date) + 1}月`
    }
  }

  private calculateChangeRate(prev: number, current: number): number {
    if (!prev || prev === 0) return 0
    return ((current - prev) / prev) * 100
  }

  private calculateAverageEngagementTime(data: any[]): number {
    // 推定値として動画の長さとエンゲージメント率から計算
    return data.reduce((sum, item) => {
      const engagementRate = this.calculateEngagementRate(item)
      return sum + (engagementRate * 30) // 30秒を基準とした推定
    }, 0) / data.length
  }

  private async generateEngagementRecommendations(
    metrics: EngagementMetrics,
    platforms: PlatformEngagement[],
    viral: any[]
  ): Promise<string[]> {
    const recommendations = []

    // メトリクスベースの推奨事項
    if (metrics.engagementRate < 2) {
      recommendations.push('コンテンツの品質向上とユーザーとの対話強化が必要')
    }
    
    if (metrics.viralFactor < 0.1) {
      recommendations.push('シェアしやすいコンテンツ形式とハッシュタグ戦略の見直し')
    }

    // プラットフォーム別推奨事項
    platforms.forEach(platform => {
      if (platform.metrics.engagementRate < 1.5) {
        recommendations.push(`${platform.platform}でのエンゲージメント戦略の改善`)
      }
    })

    // バイラルコンテンツからの学習
    if (viral.length > 0) {
      const commonFactors = viral.flatMap(v => v.factors)
      const mostCommon = commonFactors.reduce((acc, factor) => {
        acc[factor] = (acc[factor] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topFactor = Object.entries(mostCommon).sort(([,a], [,b]) => b - a)[0]?.[0]
      if (topFactor) {
        recommendations.push(`${topFactor}要素を活用したコンテンツ制作の強化`)
      }
    }

    return recommendations.slice(0, 5)
  }

  private async generateEngagementInsights(
    metrics: EngagementMetrics,
    platforms: PlatformEngagement[],
    viral: any[]
  ): Promise<string> {
    const prompt = `
以下のエンゲージメント分析結果から重要な洞察を生成してください：

全体メトリクス:
- エンゲージメント率: ${metrics.engagementRate}%
- いいね率: ${metrics.likeRate}%
- コメント率: ${metrics.commentRate}%
- バイラル要因: ${metrics.viralFactor}

プラットフォーム別パフォーマンス:
${platforms.map(p => `${p.platform}: ${p.metrics.engagementRate}%`).join('\n')}

バイラルコンテンツ数: ${viral.length}件

250文字以内でエンゲージメント向上への戦略的示唆を提供してください。
`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }
    } catch (error) {
      console.error('Failed to generate engagement insights:', error)
    }

    return `現在のエンゲージメント率${metrics.engagementRate}%は改善の余地があります。プラットフォーム特性を活かしたコンテンツ戦略とユーザー参加型企画の導入により、エンゲージメント向上が期待できます。`
  }
}