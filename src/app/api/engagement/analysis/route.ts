import { NextRequest, NextResponse } from 'next/server'
import { EngagementAnalyzer } from '@/lib/analysis/engagement-analyzer'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null
    const timeframe = (searchParams.get('timeframe') as 'week' | 'month') || 'week'

    const analyzer = new EngagementAnalyzer()
    const analysis = await analyzer.analyzeEngagementMetrics(platform || undefined, timeframe)

    const response = {
      status: 'success',
      data: {
        ...analysis,
        summary: {
          totalAnalyzedContent: analysis.viralContent.length + 50, // 推定
          engagementGrade: getEngagementGrade(analysis.overallMetrics.engagementRate),
          topPerformingPlatform: getTopPerformingPlatform(analysis.platformBreakdown),
          improvementPotential: calculateImprovementPotential(analysis.overallMetrics),
          timeframe,
          platform: platform || 'all',
        },
        benchmarkComparison: generateBenchmarkComparison(analysis),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Engagement analysis API error:', error)
    
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

function getEngagementGrade(engagementRate: number): string {
  if (engagementRate >= 5) return 'S'
  if (engagementRate >= 3.5) return 'A'
  if (engagementRate >= 2.5) return 'B'
  if (engagementRate >= 1.5) return 'C'
  return 'D'
}

function getTopPerformingPlatform(platforms: any[]): string {
  if (platforms.length === 0) return 'unknown'
  
  return platforms.reduce((top, current) => 
    current.metrics.engagementRate > top.metrics.engagementRate ? current : top
  ).platform
}

function calculateImprovementPotential(metrics: any): number {
  const baselineEngagement = 3.0 // 業界平均
  const currentEngagement = metrics.engagementRate
  
  if (currentEngagement >= baselineEngagement) return 0
  
  const potential = ((baselineEngagement - currentEngagement) / baselineEngagement) * 100
  return Math.round(potential)
}

function generateBenchmarkComparison(analysis: any): any {
  const industryBenchmarks = {
    youtube: { avgEngagement: 2.8, topTier: 5.0 },
    tiktok: { avgEngagement: 4.2, topTier: 8.0 },
    overall: { avgEngagement: 3.5, topTier: 6.5 },
  }

  const comparisons = analysis.platformBreakdown.map((platform: any) => {
    const benchmark = industryBenchmarks[platform.platform.toLowerCase() as keyof typeof industryBenchmarks] || industryBenchmarks.overall
    
    return {
      platform: platform.platform,
      yourPerformance: platform.metrics.engagementRate,
      industryAverage: benchmark.avgEngagement,
      topTierPerformance: benchmark.topTier,
      performanceRating: platform.metrics.engagementRate >= benchmark.topTier ? 'excellent' :
                        platform.metrics.engagementRate >= benchmark.avgEngagement ? 'good' : 'needs-improvement',
    }
  })

  return {
    overall: {
      yourPerformance: analysis.overallMetrics.engagementRate,
      industryAverage: industryBenchmarks.overall.avgEngagement,
      topTierPerformance: industryBenchmarks.overall.topTier,
    },
    platformComparisons: comparisons,
    insights: generateComparisonInsights(comparisons),
  }
}

function generateComparisonInsights(comparisons: any[]): string[] {
  const insights = []
  
  const excellentPlatforms = comparisons.filter(c => c.performanceRating === 'excellent')
  const needsImprovementPlatforms = comparisons.filter(c => c.performanceRating === 'needs-improvement')
  
  if (excellentPlatforms.length > 0) {
    insights.push(`${excellentPlatforms.map(p => p.platform).join(', ')}で業界トップレベルのパフォーマンス`)
  }
  
  if (needsImprovementPlatforms.length > 0) {
    insights.push(`${needsImprovementPlatforms.map(p => p.platform).join(', ')}での改善が重要`)
  }
  
  const avgPerformance = comparisons.reduce((sum, c) => sum + c.yourPerformance, 0) / comparisons.length
  if (avgPerformance < 2.0) {
    insights.push('全体的なエンゲージメント戦略の見直しが必要')
  } else if (avgPerformance > 4.0) {
    insights.push('高いエンゲージメント品質を維持している')
  }
  
  return insights
}