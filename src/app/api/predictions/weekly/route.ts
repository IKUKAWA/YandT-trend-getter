import { NextRequest, NextResponse } from 'next/server'
import { TrendPredictor } from '@/lib/predictions/trend-predictor'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null

    const predictor = new TrendPredictor()
    
    if (platform && (platform === 'YOUTUBE' || platform === 'TIKTOK')) {
      const prediction = await predictor.predictWeeklyTrends(platform)
      
      return NextResponse.json({
        status: 'success',
        data: prediction,
        timestamp: new Date().toISOString(),
      })
    } else {
      // 両プラットフォームの予測を並列実行
      const [youtubePrediction, tiktokPrediction] = await Promise.all([
        predictor.predictWeeklyTrends(Platform.YOUTUBE),
        predictor.predictWeeklyTrends(Platform.TIKTOK),
      ])

      return NextResponse.json({
        status: 'success',
        data: {
          youtube: youtubePrediction,
          tiktok: tiktokPrediction,
          comparison: generateComparison(youtubePrediction, tiktokPrediction),
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Weekly prediction API error:', error)
    
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
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const predictor = new TrendPredictor()
    
    const [youtubePrediction, tiktokPrediction] = await Promise.all([
      predictor.predictWeeklyTrends(Platform.YOUTUBE),
      predictor.predictWeeklyTrends(Platform.TIKTOK),
    ])

    return NextResponse.json({
      status: 'success',
      message: 'Weekly predictions generated successfully',
      data: {
        youtube: youtubePrediction,
        tiktok: tiktokPrediction,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Weekly prediction generation error:', error)
    
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

function generateComparison(youtube: any, tiktok: any) {
  const commonCategories = youtube.predictions
    .filter((yp: any) => 
      tiktok.predictions.some((tp: any) => tp.category === yp.category)
    )
    .map((yp: any) => {
      const tp = tiktok.predictions.find((tp: any) => tp.category === yp.category)
      return {
        category: yp.category,
        youtube: {
          currentTrend: yp.currentTrend,
          predictedTrend: yp.predictedTrend,
          confidence: yp.confidence,
        },
        tiktok: {
          currentTrend: tp.currentTrend,
          predictedTrend: tp.predictedTrend,
          confidence: tp.confidence,
        },
        difference: {
          current: yp.currentTrend - tp.currentTrend,
          predicted: yp.predictedTrend - tp.predictedTrend,
        },
      }
    })

  return {
    commonCategories,
    platformLeader: youtube.accuracy > tiktok.accuracy ? 'youtube' : 'tiktok',
    overallAccuracy: (youtube.accuracy + tiktok.accuracy) / 2,
  }
}