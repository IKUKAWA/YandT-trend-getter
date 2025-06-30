import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getWeek, getYear } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null
    const week = searchParams.get('week')
    const year = searchParams.get('year')
    const limit = parseInt(searchParams.get('limit') || '20')

    const weekNumber = week ? parseInt(week) : getWeek(new Date())
    const yearNumber = year ? parseInt(year) : getYear(new Date())

    const trends = await prisma.trendData.findMany({
      where: {
        weekNumber,
        year: yearNumber,
        ...(platform && { platform }),
      },
      orderBy: [
        { views: 'desc' },
        { collectedAt: 'desc' },
      ],
      take: limit,
    })

    const summary = {
      totalTrends: trends.length,
      totalViews: trends.reduce((sum, trend) => sum + Number(trend.views || 0), 0),
      topCategory: getTopCategory(trends),
      platforms: platform ? [platform] : ['YOUTUBE', 'TIKTOK'],
      week: weekNumber,
      year: yearNumber,
    }

    return NextResponse.json({
      status: 'success',
      data: {
        trends: trends.map(trend => ({
          id: trend.id,
          platform: trend.platform,
          title: trend.title,
          videoId: trend.videoId,
          views: trend.views?.toString(),
          likes: trend.likes,
          comments: trend.comments,
          hashtags: trend.hashtags,
          category: trend.category,
          collectedAt: trend.collectedAt,
        })),
        summary,
      },
    })
  } catch (error) {
    console.error('Weekly trends API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function getTopCategory(trends: any[]): string {
  const categoryCount: Record<string, number> = {}
  
  trends.forEach(trend => {
    if (trend.category) {
      categoryCount[trend.category] = (categoryCount[trend.category] || 0) + 1
    }
  })
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Entertainment'
}