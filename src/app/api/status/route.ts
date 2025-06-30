import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [trendsCount, articlesCount, latestCollection] = await Promise.all([
      prisma.trendData.count(),
      prisma.aIArticle.count(),
      prisma.trendData.findFirst({
        orderBy: { collectedAt: 'desc' },
        select: { collectedAt: true },
      }),
    ])

    const status = {
      database: 'connected',
      totalTrends: trendsCount,
      totalArticles: articlesCount,
      lastDataCollection: latestCollection?.collectedAt,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      status: 'success',
      data: status,
    })
  } catch (error) {
    console.error('Status API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}