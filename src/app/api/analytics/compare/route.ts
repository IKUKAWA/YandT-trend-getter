import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getWeek, getMonth, getYear } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    const week = searchParams.get('week')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const weekNumber = week ? parseInt(week) : getWeek(new Date())
    const monthNumber = month ? parseInt(month) : getMonth(new Date()) + 1
    const yearNumber = year ? parseInt(year) : getYear(new Date())

    const whereCondition = period === 'month' 
      ? { monthNumber, year: yearNumber }
      : { weekNumber, year: yearNumber }

    const [youtubeData, tiktokData] = await Promise.all([
      prisma.trendData.findMany({
        where: {
          ...whereCondition,
          platform: Platform.YOUTUBE,
        },
        orderBy: { views: 'desc' },
      }),
      prisma.trendData.findMany({
        where: {
          ...whereCondition,
          platform: Platform.TIKTOK,
        },
        orderBy: { views: 'desc' },
      }),
    ])

    const comparison = {
      youtube: {
        totalVideos: youtubeData.length,
        totalViews: youtubeData.reduce((sum, item) => sum + Number(item.views || 0), 0),
        totalLikes: youtubeData.reduce((sum, item) => sum + (item.likes || 0), 0),
        totalComments: youtubeData.reduce((sum, item) => sum + (item.comments || 0), 0),
        topCategory: getTopCategory(youtubeData),
        avgViews: youtubeData.length > 0 
          ? youtubeData.reduce((sum, item) => sum + Number(item.views || 0), 0) / youtubeData.length 
          : 0,
      },
      tiktok: {
        totalVideos: tiktokData.length,
        totalViews: tiktokData.reduce((sum, item) => sum + Number(item.views || 0), 0),
        totalLikes: tiktokData.reduce((sum, item) => sum + (item.likes || 0), 0),
        totalComments: tiktokData.reduce((sum, item) => sum + (item.comments || 0), 0),
        topCategory: getTopCategory(tiktokData),
        avgViews: tiktokData.length > 0 
          ? tiktokData.reduce((sum, item) => sum + Number(item.views || 0), 0) / tiktokData.length 
          : 0,
      },
      categoryComparison: getCategoryComparison(youtubeData, tiktokData),
      commonTrends: getCommonTrends(youtubeData, tiktokData),
      period: {
        type: period,
        week: weekNumber,
        month: monthNumber,
        year: yearNumber,
      },
    }

    return NextResponse.json({
      status: 'success',
      data: comparison,
    })
  } catch (error) {
    console.error('Analytics compare API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function getTopCategory(data: any[]): string {
  const categoryCount: Record<string, number> = {}
  
  data.forEach(item => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    }
  })
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Entertainment'
}

function getCategoryComparison(youtubeData: any[], tiktokData: any[]) {
  const youtubeCategories = getCategoryBreakdown(youtubeData)
  const tiktokCategories = getCategoryBreakdown(tiktokData)
  
  const allCategories = new Set([
    ...Object.keys(youtubeCategories),
    ...Object.keys(tiktokCategories),
  ])
  
  return Array.from(allCategories).map(category => ({
    category,
    youtube: youtubeCategories[category] || 0,
    tiktok: tiktokCategories[category] || 0,
  }))
}

function getCategoryBreakdown(data: any[]): Record<string, number> {
  const categoryCount: Record<string, number> = {}
  
  data.forEach(item => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    }
  })
  
  return categoryCount
}

function getCommonTrends(youtubeData: any[], tiktokData: any[]): string[] {
  const youtubeHashtags = new Set<string>()
  const tiktokHashtags = new Set<string>()
  
  youtubeData.forEach(item => {
    item.hashtags?.forEach((tag: string) => youtubeHashtags.add(tag.toLowerCase()))
  })
  
  tiktokData.forEach(item => {
    item.hashtags?.forEach((tag: string) => tiktokHashtags.add(tag.toLowerCase()))
  })
  
  const commonHashtags = Array.from(youtubeHashtags).filter(tag => 
    tiktokHashtags.has(tag)
  )
  
  return commonHashtags.slice(0, 10)
}