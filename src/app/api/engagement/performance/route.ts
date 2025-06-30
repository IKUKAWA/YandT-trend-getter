import { NextRequest, NextResponse } from 'next/server'
import { EngagementAnalyzer } from '@/lib/analysis/engagement-analyzer'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null
    const contentIds = searchParams.get('contentIds')?.split(',').filter(Boolean)
    const sortBy = searchParams.get('sortBy') || 'engagementScore'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')

    const analyzer = new EngagementAnalyzer()
    let performance = await analyzer.analyzeContentPerformance(
      contentIds,
      platform || undefined
    )

    // ソート処理
    performance = sortContentPerformance(performance, sortBy, order)

    // 制限適用
    performance = performance.slice(0, limit)

    const response = {
      status: 'success',
      data: {
        content: performance,
        analytics: {
          totalAnalyzed: performance.length,
          averageEngagementScore: calculateAverage(performance, 'engagementScore'),
          averageViralPotential: calculateAverage(performance, 'viralPotential'),
          topPerformer: performance[0],
          performanceDistribution: analyzePerformanceDistribution(performance),
          platformBreakdown: generatePlatformBreakdown(performance),
        },
        insights: generatePerformanceInsights(performance),
        recommendations: generatePerformanceRecommendations(performance),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Content performance API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentIds, platform, analysisType } = body

    if (!contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json(
        { status: 'error', error: 'contentIds array is required' },
        { status: 400 }
      )
    }

    const analyzer = new EngagementAnalyzer()
    let result

    switch (analysisType) {
      case 'detailed':
        result = await analyzer.analyzeContentPerformance(contentIds, platform)
        break
      case 'comparative':
        result = await generateComparativeAnalysis(analyzer, contentIds, platform)
        break
      default:
        result = await analyzer.analyzeContentPerformance(contentIds, platform)
    }

    return NextResponse.json({
      status: 'success',
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Content performance POST API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

function sortContentPerformance(
  performance: any[],
  sortBy: string,
  order: string
): any[] {
  return performance.sort((a, b) => {
    const aValue = a[sortBy] || 0
    const bValue = b[sortBy] || 0
    
    if (order === 'desc') {
      return bValue - aValue
    } else {
      return aValue - bValue
    }
  })
}

function calculateAverage(data: any[], field: string): number {
  if (data.length === 0) return 0
  const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0)
  return Math.round((sum / data.length) * 100) / 100
}

function analyzePerformanceDistribution(performance: any[]): any {
  const scores = performance.map(p => p.engagementScore)
  const total = scores.length

  const distribution = {
    excellent: scores.filter(s => s >= 0.8).length,
    good: scores.filter(s => s >= 0.6 && s < 0.8).length,
    average: scores.filter(s => s >= 0.4 && s < 0.6).length,
    poor: scores.filter(s => s < 0.4).length,
  }

  return {
    ...distribution,
    percentages: {
      excellent: Math.round((distribution.excellent / total) * 100),
      good: Math.round((distribution.good / total) * 100),
      average: Math.round((distribution.average / total) * 100),
      poor: Math.round((distribution.poor / total) * 100),
    },
  }
}

function generatePlatformBreakdown(performance: any[]): any {
  const breakdown: Record<string, any> = {}

  performance.forEach(item => {
    const platform = item.platform
    if (!breakdown[platform]) {
      breakdown[platform] = {
        count: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageEngagementScore: 0,
        averageViralPotential: 0,
      }
    }

    breakdown[platform].count++
    breakdown[platform].totalViews += item.views
    breakdown[platform].totalLikes += item.likes
    breakdown[platform].totalComments += item.comments
    breakdown[platform].averageEngagementScore += item.engagementScore
    breakdown[platform].averageViralPotential += item.viralPotential
  })

  // 平均値を計算
  Object.values(breakdown).forEach((platform: any) => {
    platform.averageEngagementScore = Math.round((platform.averageEngagementScore / platform.count) * 100) / 100
    platform.averageViralPotential = Math.round((platform.averageViralPotential / platform.count) * 100) / 100
  })

  return breakdown
}

function generatePerformanceInsights(performance: any[]): string[] {
  const insights = []
  
  const avgEngagement = calculateAverage(performance, 'engagementScore')
  const avgViral = calculateAverage(performance, 'viralPotential')
  
  if (avgEngagement < 0.3) {
    insights.push('全体的なエンゲージメントスコアが低く、コンテンツ戦略の見直しが必要')
  } else if (avgEngagement > 0.7) {
    insights.push('高いエンゲージメントスコアを維持しており、優秀なコンテンツ品質')
  }
  
  if (avgViral > 0.6) {
    insights.push('バイラル性の高いコンテンツが多く、拡散力が強い')
  } else if (avgViral < 0.2) {
    insights.push('バイラル性の向上により、より広いリーチが期待できる')
  }
  
  const topPerformer = performance[0]
  if (topPerformer) {
    insights.push(`最高パフォーマンス: "${topPerformer.title}" (${topPerformer.platform})`)
  }
  
  const platformBreakdown = generatePlatformBreakdown(performance)
  const platforms = Object.keys(platformBreakdown)
  if (platforms.length > 1) {
    const bestPlatform = platforms.reduce((best, current) => 
      platformBreakdown[current].averageEngagementScore > platformBreakdown[best].averageEngagementScore ? current : best
    )
    insights.push(`${bestPlatform}で最も高いエンゲージメントを記録`)
  }
  
  return insights.slice(0, 5)
}

function generatePerformanceRecommendations(performance: any[]): string[] {
  const recommendations = []
  
  const lowPerformers = performance.filter(p => p.engagementScore < 0.3)
  const highPerformers = performance.filter(p => p.engagementScore > 0.7)
  
  if (lowPerformers.length > performance.length * 0.3) {
    recommendations.push('30%以上のコンテンツが低パフォーマンス：品質基準の見直しが急務')
  }
  
  if (highPerformers.length > 0) {
    const commonFactors = analyzeSuccessFactors(highPerformers)
    recommendations.push(`成功パターンの活用：${commonFactors.join(', ')}`)
  }
  
  const avgViews = calculateAverage(performance, 'views')
  if (avgViews < 1000) {
    recommendations.push('リーチ拡大のためのプロモーション戦略強化')
  }
  
  const platformBreakdown = generatePlatformBreakdown(performance)
  Object.entries(platformBreakdown).forEach(([platform, data]: [string, any]) => {
    if (data.averageEngagementScore < 0.4) {
      recommendations.push(`${platform}特化のコンテンツ最適化`)
    }
  })
  
  return recommendations.slice(0, 4)
}

async function generateComparativeAnalysis(
  analyzer: EngagementAnalyzer,
  contentIds: string[],
  platform?: Platform
): Promise<any> {
  const performance = await analyzer.analyzeContentPerformance(contentIds, platform)
  
  if (performance.length < 2) {
    throw new Error('Comparative analysis requires at least 2 content items')
  }
  
  const sorted = performance.sort((a, b) => b.engagementScore - a.engagementScore)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  
  return {
    comparison: {
      best: {
        ...best,
        performanceLevel: 'top',
      },
      worst: {
        ...worst,
        performanceLevel: 'bottom',
      },
      difference: {
        engagementScore: best.engagementScore - worst.engagementScore,
        viralPotential: best.viralPotential - worst.viralPotential,
        views: best.views - worst.views,
      },
    },
    insights: generateComparisonInsights(best, worst),
    recommendations: generateComparisonRecommendations(best, worst),
  }
}

function analyzeSuccessFactors(highPerformers: any[]): string[] {
  const factors = []
  
  const avgViews = calculateAverage(highPerformers, 'views')
  if (avgViews > 10000) {
    factors.push('高い初期リーチ')
  }
  
  const avgViral = calculateAverage(highPerformers, 'viralPotential')
  if (avgViral > 0.6) {
    factors.push('強いバイラル要素')
  }
  
  const platforms = [...new Set(highPerformers.map(p => p.platform))]
  if (platforms.length === 1) {
    factors.push(`${platforms[0]}最適化`)
  } else {
    factors.push('クロスプラットフォーム戦略')
  }
  
  return factors
}

function generateComparisonInsights(best: any, worst: any): string[] {
  const insights = []
  
  const scoreDiff = best.engagementScore - worst.engagementScore
  insights.push(`エンゲージメントスコア差: ${(scoreDiff * 100).toFixed(1)}ポイント`)
  
  if (best.platform === worst.platform) {
    insights.push(`同一プラットフォーム（${best.platform}）内での大きな差`)
  } else {
    insights.push(`プラットフォーム差: ${best.platform} vs ${worst.platform}`)
  }
  
  const viewsRatio = best.views / (worst.views || 1)
  if (viewsRatio > 5) {
    insights.push(`視聴数で${Math.round(viewsRatio)}倍の差`)
  }
  
  return insights
}

function generateComparisonRecommendations(best: any, worst: any): string[] {
  return [
    `"${best.title}"の成功要因を他のコンテンツに適用`,
    `"${worst.title}"のようなパフォーマンス要因の分析と改善`,
    'トップパフォーマーのフォーマットを標準化',
    '低パフォーマンスコンテンツの再最適化',
  ]
}