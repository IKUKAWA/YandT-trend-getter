import { NextRequest, NextResponse } from 'next/server'
import { ChannelGrowthAnalysis, ChannelGrowthData } from '@/types/channel'

interface RouteParams {
  params: {
    id: string
  }
}

// Generate realistic growth data
const generateGrowthData = (channelId: string, months: number): ChannelGrowthData[] => {
  const data: ChannelGrowthData[] = []
  const baseSubscribers = 120000
  const baseVideos = 180
  const baseViews = 15000
  const baseEngagement = 0.045

  for (let i = 0; i < months; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - (months - 1 - i))
    date.setDate(1) // First day of month

    // Simulate growth with some randomness
    const growthFactor = 1 + (i * 0.02) + (Math.random() - 0.5) * 0.01
    const seasonalFactor = 1 + Math.sin((i / months) * Math.PI * 2) * 0.05

    data.push({
      date,
      subscriberCount: Math.round(baseSubscribers * growthFactor * seasonalFactor),
      videoCount: baseVideos + i * 5 + Math.floor(Math.random() * 3),
      avgViews: Math.round(baseViews * growthFactor * seasonalFactor * (1 + Math.random() * 0.2)),
      engagementRate: baseEngagement * (1 + (i * 0.001) + (Math.random() - 0.5) * 0.01),
      monthlyGrowthRate: i > 0 ? (Math.random() * 8 + 2) : undefined,
      weeklyGrowthRate: i > 0 ? (Math.random() * 2 + 0.5) : undefined
    })
  }

  return data
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: channelId } = await params
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const timeRange = searchParams.get('timeRange') || '6months' // '3months' | '6months' | '1year' | '2years'
    const metrics = searchParams.get('metrics')?.split(',') || ['subscriberCount', 'avgViews', 'engagementRate']
    const granularity = searchParams.get('granularity') || 'monthly' // 'daily' | 'weekly' | 'monthly'
    const includeProjections = searchParams.get('includeProjections') === 'true'

    // Validate channel ID
    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID is required'
      }, { status: 400 })
    }

    // Calculate time period
    const monthsMap = {
      '3months': 3,
      '6months': 6,
      '1year': 12,
      '2years': 24
    }
    const months = monthsMap[timeRange as keyof typeof monthsMap] || 6

    // Generate growth data
    const history = generateGrowthData(channelId, months + 1) // +1 for current month
    const current = history[history.length - 1]
    const previous = history[history.length - 2]

    // Calculate growth rates
    const monthlyGrowthRate = previous ? 
      ((current.subscriberCount - previous.subscriberCount) / previous.subscriberCount) * 100 : 0
    
    const weeklyGrowthRate = monthlyGrowthRate / 4.33 // Approximate weekly rate

    // Calculate trend
    const recentGrowth = history.slice(-3).map(h => h.subscriberCount)
    const trend = recentGrowth[2] > recentGrowth[1] && recentGrowth[1] > recentGrowth[0] ? 'up' :
                  recentGrowth[2] < recentGrowth[1] && recentGrowth[1] < recentGrowth[0] ? 'down' : 'stable'

    // Calculate trend strength (1-10)
    const growthVariance = history.slice(-6).reduce((acc, curr, i, arr) => {
      if (i === 0) return acc
      const growth = (curr.subscriberCount - arr[i-1].subscriberCount) / arr[i-1].subscriberCount
      return acc + Math.abs(growth)
    }, 0) / 5

    const trendStrength = Math.max(1, Math.min(10, Math.round(10 - growthVariance * 100)))

    // Calculate growth acceleration
    const recentMonthlyGrowth = history.slice(-2).map(h => h.subscriberCount)
    const olderMonthlyGrowth = history.slice(-4, -2).map(h => h.subscriberCount)
    
    const recentRate = (recentMonthlyGrowth[1] - recentMonthlyGrowth[0]) / recentMonthlyGrowth[0]
    const olderRate = olderMonthlyGrowth.length >= 2 ? 
      (olderMonthlyGrowth[1] - olderMonthlyGrowth[0]) / olderMonthlyGrowth[0] : recentRate
    
    const growthAcceleration = olderRate !== 0 ? recentRate / olderRate : 1

    // Predict next milestone
    const currentSubs = current.subscriberCount
    const nextMilestone = currentSubs < 100000 ? 100000 :
                         currentSubs < 500000 ? 500000 :
                         currentSubs < 1000000 ? 1000000 :
                         Math.ceil(currentSubs / 1000000) * 1000000 + 1000000

    const subsToGo = nextMilestone - currentSubs
    const timeToMilestone = monthlyGrowthRate > 0 ? 
      Math.round((subsToGo / (currentSubs * monthlyGrowthRate / 100)) * 30) : 999

    const confidenceScore = Math.min(95, Math.max(30, 
      Math.round(70 + trendStrength * 2.5 - (growthVariance * 100))))

    // Generate projections if requested
    let projections = null
    if (includeProjections) {
      const futureMonths = [1, 3, 6, 12]
      projections = futureMonths.map(months => {
        const projectedGrowth = Math.pow(1 + monthlyGrowthRate / 100, months)
        return {
          months,
          subscriberCount: Math.round(currentSubs * projectedGrowth),
          avgViews: Math.round(current.avgViews * projectedGrowth * 0.9), // Views grow slower
          engagementRate: Math.max(0.01, current.engagementRate * (1 + months * 0.001)), // Slight engagement increase
          confidence: Math.max(20, confidenceScore - months * 10) // Confidence decreases over time
        }
      })
    }

    const growthAnalysis: ChannelGrowthAnalysis = {
      current,
      history,
      monthlyGrowthRate: Number(monthlyGrowthRate.toFixed(2)),
      weeklyGrowthRate: Number(weeklyGrowthRate.toFixed(2)),
      trend,
      trendStrength,
      rankingChange: Math.floor(Math.random() * 10) - 5, // Random ranking change for demo
      growthAcceleration: Number(growthAcceleration.toFixed(2)),
      milestones: {
        nextSubscriberMilestone: nextMilestone,
        timeToMilestone,
        confidenceScore
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))

    return NextResponse.json({
      success: true,
      data: growthAnalysis,
      projections,
      metadata: {
        channelId,
        timeRange,
        granularity,
        metricsAnalyzed: metrics,
        analysisDate: new Date().toISOString(),
        dataPoints: history.length
      }
    })

  } catch (error) {
    console.error('Growth analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze channel growth'
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
      customTimeRange,
      benchmarkChannels = [],
      analysisOptions = {}
    } = body

    // Validate input
    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID is required'
      }, { status: 400 })
    }

    // Process custom time range analysis
    let startDate: Date
    let endDate: Date = new Date()

    if (customTimeRange) {
      startDate = new Date(customTimeRange.start)
      endDate = new Date(customTimeRange.end)
    } else {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)
    }

    // Generate data for custom range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const months = Math.ceil(daysDiff / 30)
    
    const history = generateGrowthData(channelId, months)
    
    // Benchmark comparison if channels provided
    let benchmarkComparison = null
    if (benchmarkChannels.length > 0) {
      benchmarkComparison = benchmarkChannels.map((benchmarkId: string) => {
        const benchmarkHistory = generateGrowthData(benchmarkId, months)
        const benchmarkCurrent = benchmarkHistory[benchmarkHistory.length - 1]
        const benchmarkPrevious = benchmarkHistory[benchmarkHistory.length - 2]
        
        const benchmarkGrowthRate = benchmarkPrevious ? 
          ((benchmarkCurrent.subscriberCount - benchmarkPrevious.subscriberCount) / benchmarkPrevious.subscriberCount) * 100 : 0

        return {
          channelId: benchmarkId,
          channelName: `Benchmark Channel ${benchmarkId.slice(-3)}`,
          currentSubscribers: benchmarkCurrent.subscriberCount,
          monthlyGrowthRate: Number(benchmarkGrowthRate.toFixed(2)),
          avgViews: benchmarkCurrent.avgViews,
          engagementRate: benchmarkCurrent.engagementRate
        }
      })
    }

    // Advanced growth analysis
    const growthMetrics = {
      accelerationPhases: history.map((point, index) => {
        if (index === 0) return { date: point.date, phase: 'baseline', acceleration: 0 }
        
        const growth = (point.subscriberCount - history[index - 1].subscriberCount) / history[index - 1].subscriberCount
        const phase = growth > 0.05 ? 'rapid' : growth > 0.02 ? 'steady' : growth > 0 ? 'slow' : 'decline'
        
        return {
          date: point.date,
          phase,
          acceleration: growth * 100
        }
      }),
      volatility: calculateVolatility(history),
      consistency: calculateConsistency(history),
      seasonality: calculateSeasonality(history)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      data: {
        history,
        customRange: { startDate, endDate },
        metrics: growthMetrics,
        benchmarkComparison
      },
      metadata: {
        channelId,
        analysisType: 'custom',
        dataPoints: history.length,
        benchmarkChannels: benchmarkChannels.length
      }
    })

  } catch (error) {
    console.error('Custom growth analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to perform custom growth analysis'
    }, { status: 500 })
  }
}

// Helper functions
function calculateVolatility(history: ChannelGrowthData[]): number {
  if (history.length < 2) return 0
  
  const growthRates = history.slice(1).map((point, index) => {
    return (point.subscriberCount - history[index].subscriberCount) / history[index].subscriberCount
  })
  
  const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
  const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowth, 2), 0) / growthRates.length
  
  return Math.sqrt(variance) * 100
}

function calculateConsistency(history: ChannelGrowthData[]): number {
  if (history.length < 3) return 50
  
  const growthRates = history.slice(1).map((point, index) => {
    return (point.subscriberCount - history[index].subscriberCount) / history[index].subscriberCount
  })
  
  const positiveGrowths = growthRates.filter(rate => rate > 0).length
  return (positiveGrowths / growthRates.length) * 100
}

function calculateSeasonality(history: ChannelGrowthData[]): { hasSeasonality: boolean; peakMonth: number | null } {
  if (history.length < 12) return { hasSeasonality: false, peakMonth: null }
  
  const monthlyGrowth = new Array(12).fill(0)
  const monthlyCount = new Array(12).fill(0)
  
  history.forEach((point, index) => {
    if (index === 0) return
    const month = point.date.getMonth()
    const growth = (point.subscriberCount - history[index - 1].subscriberCount) / history[index - 1].subscriberCount
    monthlyGrowth[month] += growth
    monthlyCount[month]++
  })
  
  const avgMonthlyGrowth = monthlyGrowth.map((growth, i) => 
    monthlyCount[i] > 0 ? growth / monthlyCount[i] : 0
  )
  
  const maxGrowth = Math.max(...avgMonthlyGrowth)
  const minGrowth = Math.min(...avgMonthlyGrowth)
  const seasonalityStrength = maxGrowth - minGrowth
  
  return {
    hasSeasonality: seasonalityStrength > 0.02, // 2% difference indicates seasonality
    peakMonth: seasonalityStrength > 0.02 ? avgMonthlyGrowth.indexOf(maxGrowth) : null
  }
}