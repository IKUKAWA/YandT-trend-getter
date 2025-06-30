import { NextRequest, NextResponse } from 'next/server'
import { CategoryAnalyzer } from '@/lib/analysis/category-analyzer'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null
    const limit = parseInt(searchParams.get('limit') || '10')

    const analyzer = new CategoryAnalyzer()
    const emergingCategories = await analyzer.detectEmergingCategories(platform || undefined)

    const response = {
      status: 'success',
      data: {
        emergingCategories: emergingCategories.slice(0, limit),
        summary: {
          totalDetected: emergingCategories.length,
          highConfidence: emergingCategories.filter(c => c.confidence > 0.7).length,
          platforms: platform ? [platform] : ['YOUTUBE', 'TIKTOK'],
          detectionDate: new Date().toISOString(),
        },
        insights: generateEmergingInsights(emergingCategories),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Emerging categories API error:', error)
    
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

function generateEmergingInsights(categories: any[]): any {
  const highConfidenceCategories = categories.filter(c => c.confidence > 0.7)
  const totalEstimatedSize = categories.reduce((sum, c) => sum + c.estimatedSize, 0)
  
  const platformDistribution = categories.reduce((acc: any, category) => {
    category.platforms.forEach((platform: Platform) => {
      acc[platform] = (acc[platform] || 0) + 1
    })
    return acc
  }, {})

  return {
    topOpportunities: highConfidenceCategories.slice(0, 3).map(c => ({
      name: c.name,
      confidence: c.confidence,
      estimatedSize: c.estimatedSize,
    })),
    marketPotential: {
      totalEstimatedViews: totalEstimatedSize,
      averageConfidence: categories.length > 0 
        ? categories.reduce((sum, c) => sum + c.confidence, 0) / categories.length 
        : 0,
    },
    platformBreakdown: platformDistribution,
    recommendations: [
      '高信頼度の新興カテゴリへの早期参入を検討',
      '複数プラットフォームで確認されたトレンドを優先',
      '急成長カテゴリの継続的な監視が重要',
    ],
  }
}