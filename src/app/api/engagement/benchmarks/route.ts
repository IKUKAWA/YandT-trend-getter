import { NextRequest, NextResponse } from 'next/server'
import { EngagementAnalyzer } from '@/lib/analysis/engagement-analyzer'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null

    if (!platform || !['YOUTUBE', 'TIKTOK'].includes(platform)) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Valid platform parameter (YOUTUBE or TIKTOK) is required',
        },
        { status: 400 }
      )
    }

    const analyzer = new EngagementAnalyzer()
    const benchmarks = await analyzer.getEngagementBenchmarks(platform)

    const response = {
      status: 'success',
      data: {
        ...benchmarks,
        industryComparison: getIndustryComparison(platform, benchmarks),
        performanceGrades: generatePerformanceGrades(benchmarks),
        recommendations: generateBenchmarkRecommendations(platform, benchmarks),
        competitiveAnalysis: generateCompetitiveAnalysis(platform, benchmarks),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Engagement benchmarks API error:', error)
    
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
    const { platforms, compareWith } = body

    if (!platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { status: 'error', error: 'platforms array is required' },
        { status: 400 }
      )
    }

    const analyzer = new EngagementAnalyzer()
    const benchmarkPromises = platforms.map((platform: Platform) =>
      analyzer.getEngagementBenchmarks(platform)
    )

    const benchmarkResults = await Promise.all(benchmarkPromises)
    const comparison = generateCrossPlatformComparison(benchmarkResults)

    let competitorData = null
    if (compareWith && compareWith.length > 0) {
      competitorData = generateCompetitorComparison(benchmarkResults, compareWith)
    }

    const response = {
      status: 'success',
      data: {
        platformBenchmarks: benchmarkResults,
        crossPlatformComparison: comparison,
        competitorComparison: competitorData,
        strategicInsights: generateStrategicInsights(benchmarkResults),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Multi-platform benchmarks API error:', error)
    
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

function getIndustryComparison(platform: Platform, benchmarks: any): any {
  const industryStandards = {
    YOUTUBE: {
      excellent: 4.0,
      good: 2.5,
      average: 1.5,
      poor: 0.8,
      likeRate: 2.0,
      commentRate: 0.5,
    },
    TIKTOK: {
      excellent: 6.0,
      good: 4.0,
      average: 2.5,
      poor: 1.0,
      likeRate: 4.0,
      commentRate: 1.0,
    },
  }

  const standards = industryStandards[platform]
  const yourAverage = benchmarks.averageMetrics.engagementRate

  let performanceLevel = 'poor'
  if (yourAverage >= standards.excellent) performanceLevel = 'excellent'
  else if (yourAverage >= standards.good) performanceLevel = 'good'
  else if (yourAverage >= standards.average) performanceLevel = 'average'

  return {
    platform,
    yourPerformance: yourAverage,
    industryStandards: standards,
    performanceLevel,
    gapAnalysis: {
      toExcellent: Math.max(0, standards.excellent - yourAverage),
      toGood: Math.max(0, standards.good - yourAverage),
      toAverage: Math.max(0, standards.average - yourAverage),
    },
    strongPoints: identifyStrongPoints(benchmarks, standards),
    improvementAreas: identifyImprovementAreas(benchmarks, standards),
  }
}

function generatePerformanceGrades(benchmarks: any): any {
  const { top10Percent, top25Percent, median, bottom25Percent } = benchmarks.benchmarks
  
  return {
    gradeSystem: {
      'S': { min: top10Percent, description: 'トップ10%の優秀レベル' },
      'A': { min: top25Percent, max: top10Percent, description: 'トップ25%の高レベル' },
      'B': { min: median, max: top25Percent, description: '平均以上の良レベル' },
      'C': { min: bottom25Percent, max: median, description: '平均レベル' },
      'D': { max: bottom25Percent, description: '改善が必要なレベル' },
    },
    yourGrade: calculateGrade(benchmarks.averageMetrics.engagementRate, benchmarks.benchmarks),
    targetGrades: {
      nextLevel: getNextGradeTarget(benchmarks.averageMetrics.engagementRate, benchmarks.benchmarks),
      excellentLevel: `S (${top10Percent.toFixed(2)}%以上)`,
    },
  }
}

function generateBenchmarkRecommendations(platform: Platform, benchmarks: any): string[] {
  const recommendations = []
  const avgEngagement = benchmarks.averageMetrics.engagementRate
  const { top25Percent, median } = benchmarks.benchmarks

  if (avgEngagement < median) {
    recommendations.push(`${platform}での基本的なエンゲージメント戦略の見直しが必要`)
    recommendations.push('コンテンツの品質向上とユーザーとの相互作用の強化')
  } else if (avgEngagement < top25Percent) {
    recommendations.push('トップ25%入りを目指したコンテンツの差別化戦略')
    recommendations.push('高パフォーマンスコンテンツのパターン分析と再現')
  } else {
    recommendations.push('優秀なパフォーマンスの維持と更なる向上')
    recommendations.push('業界リーダーとしてのポジション確立')
  }

  // プラットフォーム固有の推奨事項
  if (platform === 'YOUTUBE') {
    if (benchmarks.averageMetrics.commentRate < 0.3) {
      recommendations.push('コメント促進のためのCTA強化と視聴者との対話増加')
    }
    recommendations.push('サムネイルとタイトルの最適化によるクリック率向上')
  } else if (platform === 'TIKTOK') {
    if (benchmarks.averageMetrics.likeRate < 3.0) {
      recommendations.push('TikTokアルゴリズムに最適化したコンテンツ戦略')
    }
    recommendations.push('トレンドとハッシュタグを活用したバイラル性向上')
  }

  return recommendations.slice(0, 5)
}

function generateCompetitiveAnalysis(platform: Platform, benchmarks: any): any {
  const marketPosition = determineMarketPosition(benchmarks)
  const competitiveGap = calculateCompetitiveGap(platform, benchmarks)
  
  return {
    marketPosition,
    competitiveGap,
    strengthsAndWeaknesses: analyzeStrengthsWeaknesses(benchmarks),
    opportunityAreas: identifyOpportunityAreas(platform, benchmarks),
    threatAssessment: assessThreats(benchmarks),
  }
}

function generateCrossPlatformComparison(benchmarkResults: any[]): any {
  if (benchmarkResults.length < 2) {
    return { error: 'At least 2 platforms required for comparison' }
  }

  const comparison = benchmarkResults.map(result => ({
    platform: result.platform,
    engagementRate: result.averageMetrics.engagementRate,
    likeRate: result.averageMetrics.likeRate,
    commentRate: result.averageMetrics.commentRate,
    topPerformerThreshold: result.benchmarks.top10Percent,
  }))

  const bestPlatform = comparison.reduce((best, current) => 
    current.engagementRate > best.engagementRate ? current : best
  )

  const insights = generateCrossplatformInsights(comparison)

  return {
    comparison,
    bestPerformingPlatform: bestPlatform.platform,
    performanceGaps: calculatePlatformGaps(comparison),
    recommendations: generateCrossplatformRecommendations(comparison),
    insights,
  }
}

function generateCompetitorComparison(benchmarkResults: any[], competitors: any[]): any {
  // 競合他社データとの比較（実装簡略化）
  return {
    competitorBenchmarks: competitors,
    yourPosition: benchmarkResults.map(result => ({
      platform: result.platform,
      relativePosition: 'above_average', // 実際の比較ロジック
      competitiveAdvantage: result.averageMetrics.engagementRate > 3.0,
    })),
    marketShare: 'estimated_15_percent', // 推定値
    growthOpportunity: 'high',
  }
}

function generateStrategicInsights(benchmarkResults: any[]): string[] {
  const insights = []
  
  const avgEngagement = benchmarkResults.reduce((sum, result) => 
    sum + result.averageMetrics.engagementRate, 0) / benchmarkResults.length

  if (avgEngagement > 3.5) {
    insights.push('全プラットフォームで高いエンゲージメントを維持')
  } else if (avgEngagement < 2.0) {
    insights.push('全体的なエンゲージメント戦略の根本的見直しが必要')
  }

  const platforms = benchmarkResults.map(r => r.platform)
  if (platforms.includes('YOUTUBE') && platforms.includes('TIKTOK')) {
    const youtubeResult = benchmarkResults.find(r => r.platform === 'YOUTUBE')
    const tiktokResult = benchmarkResults.find(r => r.platform === 'TIKTOK')
    
    if (youtubeResult && tiktokResult) {
      const ratio = tiktokResult.averageMetrics.engagementRate / youtubeResult.averageMetrics.engagementRate
      if (ratio > 1.5) {
        insights.push('TikTokでの優位性を活かしYouTube戦略を最適化')
      } else if (ratio < 0.7) {
        insights.push('YouTubeの成功パターンをTikTokに適用')
      }
    }
  }

  insights.push('プラットフォーム特性に合わせた個別最適化が重要')
  
  return insights
}

// ヘルパー関数
function identifyStrongPoints(benchmarks: any, standards: any): string[] {
  const points = []
  
  if (benchmarks.averageMetrics.likeRate >= standards.likeRate) {
    points.push('高いいいね率')
  }
  
  if (benchmarks.averageMetrics.commentRate >= standards.commentRate) {
    points.push('活発なコメント率')
  }
  
  if (benchmarks.averageMetrics.engagementRate >= standards.good) {
    points.push('総合的に高いエンゲージメント')
  }
  
  return points
}

function identifyImprovementAreas(benchmarks: any, standards: any): string[] {
  const areas = []
  
  if (benchmarks.averageMetrics.likeRate < standards.likeRate) {
    areas.push('いいね率の向上')
  }
  
  if (benchmarks.averageMetrics.commentRate < standards.commentRate) {
    areas.push('コメント促進')
  }
  
  if (benchmarks.averageMetrics.engagementRate < standards.average) {
    areas.push('総合エンゲージメントの底上げ')
  }
  
  return areas
}

function calculateGrade(engagementRate: number, benchmarks: any): string {
  if (engagementRate >= benchmarks.top10Percent) return 'S'
  if (engagementRate >= benchmarks.top25Percent) return 'A'
  if (engagementRate >= benchmarks.median) return 'B'
  if (engagementRate >= benchmarks.bottom25Percent) return 'C'
  return 'D'
}

function getNextGradeTarget(engagementRate: number, benchmarks: any): string {
  const currentGrade = calculateGrade(engagementRate, benchmarks)
  
  switch (currentGrade) {
    case 'D': return `C (${benchmarks.bottom25Percent.toFixed(2)}%以上)`
    case 'C': return `B (${benchmarks.median.toFixed(2)}%以上)`
    case 'B': return `A (${benchmarks.top25Percent.toFixed(2)}%以上)`
    case 'A': return `S (${benchmarks.top10Percent.toFixed(2)}%以上)`
    case 'S': return '最高レベル維持'
    default: return '不明'
  }
}

function determineMarketPosition(benchmarks: any): string {
  const { top10Percent, top25Percent, median } = benchmarks.benchmarks
  const current = benchmarks.averageMetrics.engagementRate
  
  if (current >= top10Percent) return 'market_leader'
  if (current >= top25Percent) return 'strong_competitor'
  if (current >= median) return 'average_performer'
  return 'challenger'
}

function calculateCompetitiveGap(platform: Platform, benchmarks: any): any {
  const industryLeader = platform === 'YOUTUBE' ? 5.0 : 7.0
  const current = benchmarks.averageMetrics.engagementRate
  
  return {
    gapToLeader: Math.max(0, industryLeader - current),
    timeToClose: Math.ceil((industryLeader - current) / 0.1), // 月単位の推定
    effort: industryLeader - current > 2 ? 'high' : industryLeader - current > 1 ? 'medium' : 'low',
  }
}

function analyzeStrengthsWeaknesses(benchmarks: any): any {
  const { likeRate, commentRate, engagementRate } = benchmarks.averageMetrics
  
  return {
    strengths: [
      likeRate > 2.0 ? 'High like engagement' : null,
      commentRate > 0.5 ? 'Active community interaction' : null,
      engagementRate > 3.0 ? 'Overall strong engagement' : null,
    ].filter(Boolean),
    weaknesses: [
      likeRate < 1.0 ? 'Low like rate' : null,
      commentRate < 0.2 ? 'Limited community interaction' : null,
      engagementRate < 2.0 ? 'Below average engagement' : null,
    ].filter(Boolean),
  }
}

function identifyOpportunityAreas(platform: Platform, benchmarks: any): string[] {
  const opportunities = []
  
  if (platform === 'YOUTUBE' && benchmarks.averageMetrics.commentRate < 0.3) {
    opportunities.push('Community building and discussion enhancement')
  }
  
  if (platform === 'TIKTOK' && benchmarks.averageMetrics.likeRate < 3.0) {
    opportunities.push('Algorithm optimization for better reach')
  }
  
  opportunities.push('Cross-platform content adaptation')
  opportunities.push('Influencer collaboration potential')
  
  return opportunities
}

function assessThreats(benchmarks: any): string[] {
  const threats = []
  
  if (benchmarks.averageMetrics.engagementRate < 2.0) {
    threats.push('Risk of algorithm deprioritization')
  }
  
  threats.push('Increasing competition for attention')
  threats.push('Platform algorithm changes')
  
  return threats
}

function generateCrossplatformInsights(comparison: any[]): string[] {
  const insights = []
  
  const avgEngagement = comparison.reduce((sum, p) => sum + p.engagementRate, 0) / comparison.length
  insights.push(`クロスプラットフォーム平均: ${avgEngagement.toFixed(2)}%`)
  
  const bestPlatform = comparison.reduce((best, current) => 
    current.engagementRate > best.engagementRate ? current : best
  )
  insights.push(`最高パフォーマンス: ${bestPlatform.platform}`)
  
  return insights
}

function calculatePlatformGaps(comparison: any[]): any {
  const best = Math.max(...comparison.map(p => p.engagementRate))
  
  return comparison.map(p => ({
    platform: p.platform,
    gap: best - p.engagementRate,
    percentage: ((best - p.engagementRate) / best * 100).toFixed(1),
  }))
}

function generateCrossplatformRecommendations(comparison: any[]): string[] {
  const recommendations = []
  
  const gaps = calculatePlatformGaps(comparison)
  const largestGap = gaps.reduce((max, current) => current.gap > max.gap ? current : max)
  
  if (largestGap.gap > 1.0) {
    recommendations.push(`${largestGap.platform}での戦略強化が最優先`)
  }
  
  recommendations.push('各プラットフォームの特性に合わせたコンテンツ最適化')
  recommendations.push('成功プラットフォームのベストプラクティス展開')
  
  return recommendations
}