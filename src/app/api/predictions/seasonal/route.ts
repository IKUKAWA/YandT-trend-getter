import { NextRequest, NextResponse } from 'next/server'
import { TrendPredictor } from '@/lib/predictions/trend-predictor'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null

    const predictor = new TrendPredictor()
    
    if (platform && (platform === 'YOUTUBE' || platform === 'TIKTOK')) {
      const prediction = await predictor.predictSeasonalTrends(platform)
      
      return NextResponse.json({
        status: 'success',
        data: prediction,
        timestamp: new Date().toISOString(),
      })
    } else {
      const [youtubePrediction, tiktokPrediction] = await Promise.all([
        predictor.predictSeasonalTrends(Platform.YOUTUBE),
        predictor.predictSeasonalTrends(Platform.TIKTOK),
      ])

      return NextResponse.json({
        status: 'success',
        data: {
          youtube: youtubePrediction,
          tiktok: tiktokPrediction,
          seasonalInsights: generateSeasonalInsights(youtubePrediction, tiktokPrediction),
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Seasonal prediction API error:', error)
    
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

function generateSeasonalInsights(youtube: any, tiktok: any) {
  const currentMonth = new Date().getMonth() + 1
  const seasonMap = {
    spring: [3, 4, 5],
    summer: [6, 7, 8],
    autumn: [9, 10, 11],
    winter: [12, 1, 2],
  }

  const currentSeason = Object.entries(seasonMap).find(([, months]) => 
    months.includes(currentMonth)
  )?.[0] || 'unknown'

  return {
    currentSeason,
    upcomingSeason: getUpcomingSeason(currentSeason),
    seasonalTrends: {
      youtube: analyzeSeasonalTrends(youtube.predictions, currentSeason),
      tiktok: analyzeSeasonalTrends(tiktok.predictions, currentSeason),
    },
    yearEndPredictions: {
      youtube: youtube.predictions
        .filter((p: any) => p.timeframe?.includes('year-end') || p.confidence > 0.8)
        .slice(0, 5),
      tiktok: tiktok.predictions
        .filter((p: any) => p.timeframe?.includes('year-end') || p.confidence > 0.8)
        .slice(0, 5),
    },
  }
}

function getUpcomingSeason(currentSeason: string): string {
  const seasonOrder = ['winter', 'spring', 'summer', 'autumn']
  const currentIndex = seasonOrder.indexOf(currentSeason)
  return seasonOrder[(currentIndex + 1) % 4]
}

function analyzeSeasonalTrends(predictions: any[], season: string): any {
  const seasonalFactors = predictions.flatMap((p: any) => p.factors || [])
    .filter((factor: string) => 
      factor.toLowerCase().includes(season) || 
      factor.toLowerCase().includes('seasonal')
    )

  return {
    dominantFactors: [...new Set(seasonalFactors)].slice(0, 3),
    averageConfidence: predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / predictions.length,
    highConfidenceCategories: predictions
      .filter((p: any) => p.confidence > 0.8)
      .map((p: any) => p.category),
  }
}