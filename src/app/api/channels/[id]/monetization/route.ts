import { NextRequest, NextResponse } from 'next/server'
import { MonetizationAnalysis } from '@/types/channel'

interface RouteParams {
  params: {
    id: string
  }
}

// Platform-specific monetization requirements and rates
const MONETIZATION_REQUIREMENTS = {
  youtube: {
    minSubscribers: 1000,
    minWatchHours: 4000, // per year
    baseCPM: 150, // JPY per 1000 views
    sponsorshipMultiplier: 0.8 // per 1000 subscribers
  },
  tiktok: {
    minFollowers: 1000,
    minViews: 10000, // total views
    baseCPM: 80, // JPY per 1000 views
    sponsorshipMultiplier: 0.5 // per 1000 followers
  }
}

const generateMonetizationAnalysis = (
  channelId: string,
  platform: 'youtube' | 'tiktok',
  subscriberCount: number,
  avgViews: number,
  videoCount: number
): MonetizationAnalysis => {
  
  const requirements = MONETIZATION_REQUIREMENTS[platform]
  
  // Check eligibility
  const eligibilityStatus = {
    youtube: {
      subscribers: subscriberCount >= MONETIZATION_REQUIREMENTS.youtube.minSubscribers,
      watchHours: videoCount * avgViews * 0.4 / 60 >= MONETIZATION_REQUIREMENTS.youtube.minWatchHours, // Estimated watch hours
      eligible: false
    },
    tiktok: {
      followers: subscriberCount >= MONETIZATION_REQUIREMENTS.tiktok.minFollowers,
      views: videoCount * avgViews >= MONETIZATION_REQUIREMENTS.tiktok.minViews,
      eligible: false
    }
  }

  eligibilityStatus.youtube.eligible = eligibilityStatus.youtube.subscribers && eligibilityStatus.youtube.watchHours
  eligibilityStatus.tiktok.eligible = eligibilityStatus.tiktok.followers && eligibilityStatus.tiktok.views

  // Calculate revenue estimates
  const monthlyVideos = videoCount / 12 // Assuming current video count is yearly
  const monthlyViews = monthlyVideos * avgViews
  
  const cpmRate = requirements.baseCPM
  const adRevenue = (monthlyViews / 1000) * cpmRate
  
  // Sponsorship value calculation
  const sponsorshipValue = (subscriberCount / 1000) * requirements.sponsorshipMultiplier * 1000
  
  // Revenue range (low estimate: ad revenue only, high estimate: with sponsorships)
  const monthlyRevenueMin = Math.max(0, adRevenue * 0.5) // Conservative estimate
  const monthlyRevenueMax = adRevenue + sponsorshipValue * 0.3 // Including some sponsorship income

  // Future projections based on growth
  const baseGrowthRate = 0.15 // 15% monthly growth assumption
  const projections = {
    threeMonths: monthlyRevenueMax * (1 + baseGrowthRate) ** 3,
    sixMonths: monthlyRevenueMax * (1 + baseGrowthRate) ** 6,
    oneYear: monthlyRevenueMax * (1 + baseGrowthRate) ** 12
  }

  // Generate recommendations
  const recommendations = generateRecommendations(
    platform,
    subscriberCount,
    eligibilityStatus,
    monthlyRevenueMax
  )

  return {
    eligibilityStatus,
    revenueEstimate: {
      monthly: {
        min: Math.round(monthlyRevenueMin),
        max: Math.round(monthlyRevenueMax),
        currency: 'JPY'
      },
      cpmRate,
      sponsorshipValue: Math.round(sponsorshipValue)
    },
    projections: {
      threeMonths: Math.round(projections.threeMonths),
      sixMonths: Math.round(projections.sixMonths),
      oneYear: Math.round(projections.oneYear)
    },
    recommendations
  }
}

const generateRecommendations = (
  platform: 'youtube' | 'tiktok',
  subscriberCount: number,
  eligibilityStatus: any,
  currentRevenue: number
) => {
  const nextSteps: string[] = []
  let priority: 'high' | 'medium' | 'low' = 'medium'
  let timeline = '3-6ヶ月'

  // Platform-specific recommendations
  if (platform === 'youtube') {
    if (!eligibilityStatus.youtube.eligible) {
      if (!eligibilityStatus.youtube.subscribers) {
        nextSteps.push(`登録者数を${MONETIZATION_REQUIREMENTS.youtube.minSubscribers}人まで増やす`)
        priority = 'high'
        timeline = '2-4ヶ月'
      }
      if (!eligibilityStatus.youtube.watchHours) {
        nextSteps.push('年間視聴時間4000時間の達成')
        priority = 'high'
      }
    } else {
      nextSteps.push('YouTube Shortsの活用でリーチ拡大')
      nextSteps.push('チャンネルメンバーシップの導入')
      if (subscriberCount > 100000) {
        nextSteps.push('ブランドスポンサーシップの開拓')
        priority = 'high'
        timeline = '1-3ヶ月'
      }
    }
  } else {
    if (!eligibilityStatus.tiktok.eligible) {
      if (!eligibilityStatus.tiktok.followers) {
        nextSteps.push(`フォロワー数を${MONETIZATION_REQUIREMENTS.tiktok.minFollowers}人まで増やす`)
        priority = 'high'
        timeline = '1-2ヶ月'
      }
      if (!eligibilityStatus.tiktok.views) {
        nextSteps.push('総再生回数10,000回の達成')
        priority = 'high'
      }
    } else {
      nextSteps.push('TikTok Creator Fundへの申請')
      nextSteps.push('ライブ配信での投げ銭機能活用')
      if (subscriberCount > 50000) {
        nextSteps.push('企業コラボレーションの提案')
        priority = 'high'
      }
    }
  }

  // Universal recommendations
  if (currentRevenue > 50000) {
    nextSteps.push('グッズ販売チャンネルの開設')
    nextSteps.push('オンラインコースやセミナーの開催')
  }

  nextSteps.push('他のSNSプラットフォームとの連携強化')
  nextSteps.push('定期的な視聴者アンケートで需要調査')

  return {
    nextSteps,
    timeline,
    priority
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: channelId } = await params
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const platform = searchParams.get('platform') as 'youtube' | 'tiktok' || 'youtube'
    const subscriberCount = parseInt(searchParams.get('subscriberCount') || '150000')
    const avgViews = parseInt(searchParams.get('avgViews') || '20000')
    const videoCount = parseInt(searchParams.get('videoCount') || '230')
    const includeProjections = searchParams.get('includeProjections') === 'true'
    const includeComparison = searchParams.get('includeComparison') === 'true'

    // Validate channel ID
    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID is required'
      }, { status: 400 })
    }

    // Generate monetization analysis
    const analysis = generateMonetizationAnalysis(
      channelId,
      platform,
      subscriberCount,
      avgViews,
      videoCount
    )

    // Add industry comparison if requested
    let industryComparison = null
    if (includeComparison) {
      const industryAverage = {
        avgMonthlyRevenue: platform === 'youtube' ? 85000 : 35000,
        avgCPM: platform === 'youtube' ? 180 : 90,
        avgSponsorshipValue: platform === 'youtube' ? 120000 : 60000
      }

      industryComparison = {
        revenuePerformance: analysis.revenueEstimate.monthly.max / industryAverage.avgMonthlyRevenue,
        cpmPerformance: analysis.revenueEstimate.cpmRate / industryAverage.avgCPM,
        sponsorshipPerformance: analysis.revenueEstimate.sponsorshipValue / industryAverage.avgSponsorshipValue,
        industryRanking: Math.max(1, Math.min(100, Math.round(
          (analysis.revenueEstimate.monthly.max / industryAverage.avgMonthlyRevenue) * 50
        )))
      }
    }

    // Enhanced projections with confidence intervals
    let enhancedProjections = null
    if (includeProjections) {
      enhancedProjections = {
        scenarios: {
          conservative: {
            threeMonths: Math.round(analysis.projections.threeMonths * 0.7),
            sixMonths: Math.round(analysis.projections.sixMonths * 0.6),
            oneYear: Math.round(analysis.projections.oneYear * 0.5)
          },
          realistic: analysis.projections,
          optimistic: {
            threeMonths: Math.round(analysis.projections.threeMonths * 1.3),
            sixMonths: Math.round(analysis.projections.sixMonths * 1.5),
            oneYear: Math.round(analysis.projections.oneYear * 2.0)
          }
        },
        factors: [
          '動画投稿頻度の維持',
          'エンゲージメント率の向上',
          '新規視聴者の獲得',
          'プラットフォームアルゴリズムの変化',
          '競合チャンネルの動向'
        ]
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      data: analysis,
      industryComparison,
      enhancedProjections,
      metadata: {
        channelId,
        platform,
        analysisDate: new Date().toISOString(),
        basedOnMetrics: {
          subscriberCount,
          avgViews,
          videoCount
        }
      }
    })

  } catch (error) {
    console.error('Monetization analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze monetization potential'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const channelId = params.id
    const body = await request.json()
    
    const {
      customMetrics = {},
      marketRegion = 'japan',
      contentCategory = 'technology',
      audienceDemographics = {}
    } = body

    // Validate input
    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID is required'
      }, { status: 400 })
    }

    // Regional CPM adjustments
    const regionalMultipliers = {
      japan: 1.0,
      usa: 1.5,
      europe: 1.2,
      asia: 0.8,
      global: 1.1
    }

    // Category CPM adjustments
    const categoryMultipliers = {
      technology: 1.3,
      gaming: 1.1,
      lifestyle: 0.9,
      education: 1.2,
      entertainment: 1.0,
      finance: 1.8,
      health: 1.4
    }

    const regionalMultiplier = regionalMultipliers[marketRegion as keyof typeof regionalMultipliers] || 1.0
    const categoryMultiplier = categoryMultipliers[contentCategory as keyof typeof categoryMultipliers] || 1.0

    // Adjust base analysis with custom parameters
    const adjustedCPM = MONETIZATION_REQUIREMENTS.youtube.baseCPM * regionalMultiplier * categoryMultiplier

    // Audience demographics impact
    let demographicMultiplier = 1.0
    if (audienceDemographics.avgAge) {
      // Ages 25-45 have higher purchasing power
      demographicMultiplier = audienceDemographics.avgAge >= 25 && audienceDemographics.avgAge <= 45 ? 1.2 : 0.9
    }

    // Custom analysis
    const customAnalysis = {
      adjustedCPM: Math.round(adjustedCPM * demographicMultiplier),
      marketFactors: {
        region: marketRegion,
        category: contentCategory,
        regionalMultiplier,
        categoryMultiplier,
        demographicMultiplier
      },
      enhancedRecommendations: generateEnhancedRecommendations(
        contentCategory,
        marketRegion,
        customMetrics
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1200))

    return NextResponse.json({
      success: true,
      data: customAnalysis,
      message: 'Custom monetization analysis completed',
      metadata: {
        channelId,
        analysisType: 'custom',
        parameters: {
          marketRegion,
          contentCategory,
          hasCustomMetrics: Object.keys(customMetrics).length > 0
        }
      }
    })

  } catch (error) {
    console.error('Custom monetization analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to perform custom monetization analysis'
    }, { status: 500 })
  }
}

const generateEnhancedRecommendations = (
  category: string,
  region: string,
  customMetrics: any
) => {
  const recommendations = []

  // Category-specific recommendations
  if (category === 'technology') {
    recommendations.push('テック企業との製品レビュー契約')
    recommendations.push('アフィリエイトマーケティングの強化')
    recommendations.push('技術コンサルティングサービスの提供')
  } else if (category === 'gaming') {
    recommendations.push('ゲーム開発会社とのスポンサーシップ')
    recommendations.push('ゲーム内アイテムのプロモーション')
    recommendations.push('ライブストリーミングでの投げ銭')
  } else if (category === 'lifestyle') {
    recommendations.push('ライフスタイルブランドとのコラボ')
    recommendations.push('オンラインコースの販売')
    recommendations.push('パーソナルブランディングの構築')
  }

  // Region-specific recommendations
  if (region === 'japan') {
    recommendations.push('日本企業との長期契約交渉')
    recommendations.push('地域イベントでの出演依頼')
  } else if (region === 'global') {
    recommendations.push('多言語字幕での国際展開')
    recommendations.push('グローバルブランドとの提携')
  }

  return recommendations
}