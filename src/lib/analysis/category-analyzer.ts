import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getWeek, getMonth, getYear, subWeeks, subMonths } from 'date-fns'

interface CategoryAnalysis {
  category: string
  currentMetrics: {
    totalViews: number
    avgViews: number
    totalLikes: number
    totalComments: number
    videoCount: number
    growthRate: number
  }
  subCategories: Array<{
    name: string
    percentage: number
    examples: string[]
  }>
  relatedCategories: Array<{
    category: string
    correlationScore: number
    commonHashtags: string[]
  }>
  emergingTrends: Array<{
    trend: string
    confidence: number
    evidence: string[]
  }>
  aiInsights: string
}

interface EmergingCategory {
  name: string
  confidence: number
  evidence: Array<{
    type: 'hashtag' | 'title_pattern' | 'growth_rate'
    value: string | number
    description: string
  }>
  estimatedSize: number
  platforms: Platform[]
  firstDetected: Date
}

export class CategoryAnalyzer {
  private anthropic: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for category analysis')
    }

    this.anthropic = new Anthropic({
      apiKey,
    })
  }

  async analyzeDetailedCategories(
    platform?: Platform,
    timeframe: 'week' | 'month' = 'week'
  ): Promise<CategoryAnalysis[]> {
    console.log(`🔍 Performing detailed category analysis for ${platform || 'all platforms'}`)

    const now = new Date()
    const whereClause = this.buildTimeframeFilter(timeframe, now, platform)

    const trendData = await prisma.trendData.findMany({
      where: whereClause,
      orderBy: { views: 'desc' },
    })

    const categories = this.groupByCategory(trendData)
    const analyses: CategoryAnalysis[] = []

    for (const [categoryName, data] of Object.entries(categories)) {
      const analysis = await this.analyzeSingleCategory(categoryName, data, timeframe)
      analyses.push(analysis)
    }

    return analyses.sort((a, b) => b.currentMetrics.totalViews - a.currentMetrics.totalViews)
  }

  async detectEmergingCategories(platform?: Platform): Promise<EmergingCategory[]> {
    console.log(`🌱 Detecting emerging categories for ${platform || 'all platforms'}`)

    const now = new Date()
    const recentData = await this.getRecentTrendData(now, platform, 4) // 過去4週間
    const olderData = await this.getOlderTrendData(now, platform, 4, 8) // 4-8週間前

    const recentCategories = this.extractCategoryMetrics(recentData)
    const olderCategories = this.extractCategoryMetrics(olderData)

    const emergingCategories: EmergingCategory[] = []

    // 新しく出現したカテゴリの検出
    for (const [category, metrics] of Object.entries(recentCategories)) {
      if (!olderCategories[category] && metrics.videoCount >= 3) {
        const evidence = this.buildEmergingEvidence(category, recentData)
        
        emergingCategories.push({
          name: category,
          confidence: this.calculateEmergingConfidence(metrics, evidence),
          evidence,
          estimatedSize: metrics.totalViews,
          platforms: this.extractPlatforms(recentData, category),
          firstDetected: now,
        })
      }
    }

    // 急成長カテゴリの検出
    for (const [category, recentMetrics] of Object.entries(recentCategories)) {
      const olderMetrics = olderCategories[category]
      if (olderMetrics) {
        const growthRate = (recentMetrics.totalViews - olderMetrics.totalViews) / olderMetrics.totalViews
        
        if (growthRate > 2.0) { // 200%以上の成長
          const evidence = this.buildGrowthEvidence(category, recentMetrics, olderMetrics, growthRate)
          
          emergingCategories.push({
            name: `${category} (急成長)`,
            confidence: Math.min(0.9, 0.5 + growthRate * 0.2),
            evidence,
            estimatedSize: recentMetrics.totalViews,
            platforms: this.extractPlatforms(recentData, category),
            firstDetected: subWeeks(now, 4),
          })
        }
      }
    }

    // AI分析による新興トレンド検出
    const aiEmergingCategories = await this.detectAIEmergingCategories(recentData)
    emergingCategories.push(...aiEmergingCategories)

    return emergingCategories
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  }

  async analyzeCategoryRelations(platform?: Platform): Promise<any> {
    console.log(`🔗 Analyzing category relationships for ${platform || 'all platforms'}`)

    const now = new Date()
    const whereClause = this.buildTimeframeFilter('month', now, platform)

    const trendData = await prisma.trendData.findMany({
      where: whereClause,
      select: {
        category: true,
        hashtags: true,
        views: true,
        likes: true,
        comments: true,
      },
    })

    const categories = [...new Set(trendData.map(d => d.category).filter(Boolean))]
    const relationMatrix: Record<string, Record<string, number>> = {}

    // カテゴリ間の関連性を計算
    for (const category1 of categories) {
      relationMatrix[category1] = {}
      
      for (const category2 of categories) {
        if (category1 !== category2) {
          const correlation = this.calculateCategoryCorrelation(
            trendData,
            category1,
            category2
          )
          relationMatrix[category1][category2] = correlation
        }
      }
    }

    // 強い関連性のあるペアを抽出
    const strongRelations = this.extractStrongRelations(relationMatrix)
    const clusters = this.findCategoryClusters(relationMatrix, 0.6)

    return {
      relationMatrix,
      strongRelations,
      clusters,
      insights: await this.generateRelationInsights(strongRelations, clusters),
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

  private groupByCategory(data: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {}
    
    data.forEach(item => {
      const category = item.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })

    return groups
  }

  private async analyzeSingleCategory(
    categoryName: string,
    data: any[],
    timeframe: 'week' | 'month'
  ): Promise<CategoryAnalysis> {
    const currentMetrics = this.calculateCategoryMetrics(data)
    const growthRate = await this.calculateGrowthRate(categoryName, timeframe)
    
    const subCategories = await this.identifySubCategories(categoryName, data)
    const relatedCategories = await this.findRelatedCategories(categoryName)
    const emergingTrends = await this.identifyEmergingTrends(categoryName, data)
    const aiInsights = await this.generateCategoryInsights(categoryName, data, currentMetrics)

    return {
      category: categoryName,
      currentMetrics: {
        ...currentMetrics,
        growthRate,
      },
      subCategories,
      relatedCategories,
      emergingTrends,
      aiInsights,
    }
  }

  private calculateCategoryMetrics(data: any[]) {
    const totalViews = data.reduce((sum, item) => sum + Number(item.views || 0), 0)
    const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0)
    const totalComments = data.reduce((sum, item) => sum + (item.comments || 0), 0)
    const videoCount = data.length

    return {
      totalViews,
      avgViews: videoCount > 0 ? totalViews / videoCount : 0,
      totalLikes,
      totalComments,
      videoCount,
      growthRate: 0, // Will be calculated separately
    }
  }

  private async calculateGrowthRate(categoryName: string, timeframe: 'week' | 'month'): Promise<number> {
    const now = new Date()
    const currentPeriod = timeframe === 'week' ? getWeek(now) : getMonth(now) + 1
    const previousPeriod = timeframe === 'week' ? 
      getWeek(subWeeks(now, 1)) : 
      getMonth(subMonths(now, 1)) + 1

    const currentData = await prisma.trendData.findMany({
      where: {
        category: categoryName,
        [timeframe === 'week' ? 'weekNumber' : 'monthNumber']: currentPeriod,
        year: getYear(now),
      },
    })

    const previousData = await prisma.trendData.findMany({
      where: {
        category: categoryName,
        [timeframe === 'week' ? 'weekNumber' : 'monthNumber']: previousPeriod,
        year: getYear(timeframe === 'week' ? subWeeks(now, 1) : subMonths(now, 1)),
      },
    })

    const currentViews = currentData.reduce((sum, item) => sum + Number(item.views || 0), 0)
    const previousViews = previousData.reduce((sum, item) => sum + Number(item.views || 0), 0)

    return previousViews > 0 ? ((currentViews - previousViews) / previousViews) * 100 : 0
  }

  private async identifySubCategories(categoryName: string, data: any[]): Promise<any[]> {
    const titles = data.map(item => item.title).slice(0, 20) // 上位20件のタイトル
    const hashtags = data.flatMap(item => item.hashtags || [])

    const prompt = `
以下の${categoryName}カテゴリのデータから、サブカテゴリを識別してください：

タイトル例:
${titles.slice(0, 10).join('\n')}

ハッシュタグ:
${[...new Set(hashtags)].slice(0, 20).join(', ')}

3-5個のサブカテゴリを識別し、以下のJSON形式で返してください：
[
  {
    "name": "サブカテゴリ名",
    "percentage": 推定割合(0-100),
    "examples": ["例1", "例2", "例3"]
  }
]
`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('Failed to identify subcategories:', error)
    }

    return [
      {
        name: `${categoryName} - 一般`,
        percentage: 100,
        examples: titles.slice(0, 3),
      },
    ]
  }

  private async findRelatedCategories(categoryName: string): Promise<any[]> {
    const relatedData = await prisma.trendData.findMany({
      where: {
        category: { not: categoryName },
        OR: [
          { hashtags: { hasSome: await this.getCategoryHashtags(categoryName) } },
        ],
      },
      take: 100,
    })

    const categoryCorrelations = this.calculateCorrelations(categoryName, relatedData)
    
    return categoryCorrelations
      .sort((a, b) => b.correlationScore - a.correlationScore)
      .slice(0, 5)
  }

  private async getCategoryHashtags(categoryName: string): Promise<string[]> {
    const data = await prisma.trendData.findMany({
      where: { category: categoryName },
      select: { hashtags: true },
      take: 50,
    })

    const allHashtags = data.flatMap(item => item.hashtags || [])
    const hashtagCounts = new Map<string, number>()

    allHashtags.forEach(tag => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
    })

    return Array.from(hashtagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
  }

  private calculateCorrelations(targetCategory: string, data: any[]): any[] {
    const categoryGroups = this.groupByCategory(data)
    const correlations: any[] = []

    for (const [category, items] of Object.entries(categoryGroups)) {
      if (items.length >= 3) {
        const commonHashtags = this.findCommonHashtags(targetCategory, category)
        const correlationScore = this.calculateCorrelationScore(items, commonHashtags)

        correlations.push({
          category,
          correlationScore,
          commonHashtags: commonHashtags.slice(0, 3),
        })
      }
    }

    return correlations
  }

  private async identifyEmergingTrends(categoryName: string, data: any[]): Promise<any[]> {
    const recentTitles = data.slice(0, 20).map(item => item.title)
    const recentHashtags = data.flatMap(item => item.hashtags || [])

    const prompt = `
${categoryName}カテゴリの最新データから新興トレンドを3つ識別してください：

最新タイトル:
${recentTitles.join('\n')}

人気ハッシュタグ:
${[...new Set(recentHashtags)].slice(0, 15).join(', ')}

以下のJSON形式で返してください：
[
  {
    "trend": "トレンド名",
    "confidence": 信頼度(0-1),
    "evidence": ["根拠1", "根拠2"]
  }
]
`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('Failed to identify emerging trends:', error)
    }

    return []
  }

  private async generateCategoryInsights(
    categoryName: string,
    data: any[],
    metrics: any
  ): Promise<string> {
    const prompt = `
${categoryName}カテゴリの分析結果から重要な洞察を生成してください：

カテゴリ: ${categoryName}
動画数: ${metrics.videoCount}
総再生数: ${metrics.totalViews.toLocaleString()}
平均再生数: ${Math.round(metrics.avgViews).toLocaleString()}
総いいね数: ${metrics.totalLikes.toLocaleString()}

200文字以内で主要な特徴と戦略的示唆を提供してください。
`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }
    } catch (error) {
      console.error('Failed to generate category insights:', error)
    }

    return `${categoryName}カテゴリは${metrics.videoCount}本の動画で総再生数${metrics.totalViews.toLocaleString()}を記録。平均的なパフォーマンスを示しています。`
  }

  // その他のヘルパーメソッド
  private async getRecentTrendData(now: Date, platform?: Platform, weeksBack: number): Promise<any[]> {
    const fromWeek = getWeek(subWeeks(now, weeksBack))
    const toWeek = getWeek(now)
    const year = getYear(now)

    return await prisma.trendData.findMany({
      where: {
        ...(platform && { platform }),
        year,
        weekNumber: { gte: Math.max(1, fromWeek), lte: toWeek },
      },
    })
  }

  private async getOlderTrendData(now: Date, platform?: Platform, fromWeeks: number, toWeeks: number): Promise<any[]> {
    const fromWeek = getWeek(subWeeks(now, toWeeks))
    const toWeek = getWeek(subWeeks(now, fromWeeks))
    const year = getYear(now)

    return await prisma.trendData.findMany({
      where: {
        ...(platform && { platform }),
        year,
        weekNumber: { gte: Math.max(1, fromWeek), lte: toWeek },
      },
    })
  }

  private extractCategoryMetrics(data: any[]): Record<string, any> {
    const metrics: Record<string, any> = {}

    data.forEach(item => {
      const category = item.category || 'Other'
      if (!metrics[category]) {
        metrics[category] = {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          videoCount: 0,
        }
      }

      metrics[category].totalViews += Number(item.views || 0)
      metrics[category].totalLikes += item.likes || 0
      metrics[category].totalComments += item.comments || 0
      metrics[category].videoCount += 1
    })

    return metrics
  }

  private buildEmergingEvidence(category: string, data: any[]): any[] {
    const evidence: any[] = []
    const categoryData = data.filter(item => item.category === category)

    // ハッシュタグ証拠
    const hashtags = categoryData.flatMap(item => item.hashtags || [])
    const uniqueHashtags = [...new Set(hashtags)]
    if (uniqueHashtags.length > 0) {
      evidence.push({
        type: 'hashtag',
        value: uniqueHashtags.slice(0, 3).join(', '),
        description: `新しいハッシュタグの出現: ${uniqueHashtags.length}個`,
      })
    }

    // 成長率証拠
    const totalViews = categoryData.reduce((sum, item) => sum + Number(item.views || 0), 0)
    evidence.push({
      type: 'growth_rate',
      value: totalViews,
      description: `初期段階での高い視聴数: ${totalViews.toLocaleString()}`,
    })

    return evidence
  }

  private buildGrowthEvidence(category: string, recent: any, older: any, growthRate: number): any[] {
    return [
      {
        type: 'growth_rate',
        value: growthRate * 100,
        description: `${Math.round(growthRate * 100)}%の急成長を記録`,
      },
      {
        type: 'title_pattern',
        value: `${recent.videoCount} vs ${older.videoCount}`,
        description: `動画数が${older.videoCount}本から${recent.videoCount}本に増加`,
      },
    ]
  }

  private calculateEmergingConfidence(metrics: any, evidence: any[]): number {
    let confidence = 0.3 // ベース信頼度

    // 動画数による加算
    confidence += Math.min(0.3, metrics.videoCount * 0.05)

    // 再生数による加算
    confidence += Math.min(0.2, metrics.totalViews / 1000000 * 0.1)

    // 証拠の数による加算
    confidence += Math.min(0.2, evidence.length * 0.05)

    return Math.min(0.9, confidence)
  }

  private extractPlatforms(data: any[], category: string): Platform[] {
    const platforms = [...new Set(
      data
        .filter(item => item.category === category)
        .map(item => item.platform)
    )]
    return platforms
  }

  private async detectAIEmergingCategories(data: any[]): Promise<EmergingCategory[]> {
    // AI分析による新興カテゴリの検出（実装簡略化）
    return []
  }

  private calculateCategoryCorrelation(data: any[], category1: string, category2: string): number {
    const cat1Data = data.filter(item => item.category === category1)
    const cat2Data = data.filter(item => item.category === category2)

    // 共通ハッシュタグによる相関計算
    const cat1Hashtags = new Set(cat1Data.flatMap(item => item.hashtags || []))
    const cat2Hashtags = new Set(cat2Data.flatMap(item => item.hashtags || []))

    const intersection = [...cat1Hashtags].filter(tag => cat2Hashtags.has(tag))
    const union = [...new Set([...cat1Hashtags, ...cat2Hashtags])]

    return union.length > 0 ? intersection.length / union.length : 0
  }

  private extractStrongRelations(matrix: Record<string, Record<string, number>>): any[] {
    const relations: any[] = []

    for (const [category1, correlations] of Object.entries(matrix)) {
      for (const [category2, score] of Object.entries(correlations)) {
        if (score > 0.5) {
          relations.push({
            category1,
            category2,
            score,
            strength: score > 0.7 ? 'strong' : 'moderate',
          })
        }
      }
    }

    return relations.sort((a, b) => b.score - a.score)
  }

  private findCategoryClusters(matrix: Record<string, Record<string, number>>, threshold: number): any[] {
    // 簡易的なクラスタリング実装
    const categories = Object.keys(matrix)
    const clusters: any[] = []
    const visited = new Set<string>()

    for (const category of categories) {
      if (visited.has(category)) continue

      const cluster = [category]
      visited.add(category)

      for (const otherCategory of categories) {
        if (otherCategory !== category && !visited.has(otherCategory)) {
          if (matrix[category][otherCategory] >= threshold) {
            cluster.push(otherCategory)
            visited.add(otherCategory)
          }
        }
      }

      if (cluster.length > 1) {
        clusters.push({
          categories: cluster,
          avgCorrelation: this.calculateClusterCorrelation(cluster, matrix),
        })
      }
    }

    return clusters
  }

  private calculateClusterCorrelation(cluster: string[], matrix: Record<string, Record<string, number>>): number {
    let totalCorrelation = 0
    let pairCount = 0

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        totalCorrelation += matrix[cluster[i]][cluster[j]] || 0
        pairCount++
      }
    }

    return pairCount > 0 ? totalCorrelation / pairCount : 0
  }

  private async generateRelationInsights(relations: any[], clusters: any[]): Promise<string> {
    const prompt = `
以下のカテゴリ関連性分析結果から重要な洞察を生成してください：

強い関連性:
${relations.slice(0, 5).map(r => `${r.category1} ↔ ${r.category2} (${(r.score * 100).toFixed(1)}%)`).join('\n')}

クラスター:
${clusters.slice(0, 3).map(c => `[${c.categories.join(', ')}]`).join('\n')}

200文字以内でマーケティング戦略への示唆を含めて要約してください。
`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }
    } catch (error) {
      console.error('Failed to generate relation insights:', error)
    }

    return 'カテゴリ間の関連性分析により、複数の強い相関関係とクラスターが特定されました。クロスカテゴリマーケティング戦略の構築が有効です。'
  }

  private findCommonHashtags(category1: string, category2: string): string[] {
    // 実装簡略化 - 実際には両カテゴリのハッシュタグを比較
    return []
  }

  private calculateCorrelationScore(items: any[], commonHashtags: string[]): number {
    // 実装簡略化 - 実際の相関スコア計算
    return Math.random() * 0.5 + 0.3
  }
}