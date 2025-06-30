import { NextRequest, NextResponse } from 'next/server'
import { TrendPredictor } from '@/lib/predictions/trend-predictor'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null

    const predictor = new TrendPredictor()
    
    if (platform && (platform === 'YOUTUBE' || platform === 'TIKTOK')) {
      const prediction = await predictor.predictMonthlyTrends(platform)
      
      return NextResponse.json({
        status: 'success',
        data: prediction,
        timestamp: new Date().toISOString(),
      })
    } else {
      const [youtubePrediction, tiktokPrediction] = await Promise.all([
        predictor.predictMonthlyTrends(Platform.YOUTUBE),
        predictor.predictMonthlyTrends(Platform.TIKTOK),
      ])

      return NextResponse.json({
        status: 'success',
        data: {
          youtube: youtubePrediction,
          tiktok: tiktokPrediction,
          comparison: generateMonthlyComparison(youtubePrediction, tiktokPrediction),
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Monthly prediction API error:', error)
    
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

function generateMonthlyComparison(youtube: any, tiktok: any) {
  return {
    topPredictedCategories: {
      youtube: youtube.predictions
        .sort((a: any, b: any) => b.predictedTrend - a.predictedTrend)
        .slice(0, 3)
        .map((p: any) => ({ category: p.category, trend: p.predictedTrend })),
      tiktok: tiktok.predictions
        .sort((a: any, b: any) => b.predictedTrend - a.predictedTrend)
        .slice(0, 3)
        .map((p: any) => ({ category: p.category, trend: p.predictedTrend })),
    },
    confidenceComparison: {
      youtube: youtube.predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / youtube.predictions.length,
      tiktok: tiktok.predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / tiktok.predictions.length,
    },
    growthPotential: {
      youtube: youtube.predictions.reduce((sum: number, p: any) => sum + (p.predictedTrend - p.currentTrend), 0),
      tiktok: tiktok.predictions.reduce((sum: number, p: any) => sum + (p.predictedTrend - p.currentTrend), 0),
    },
  }
}