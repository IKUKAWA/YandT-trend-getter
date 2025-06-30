import { NextRequest, NextResponse } from 'next/server'
import { ReportScheduler } from '@/lib/scheduler'

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

    const scheduler = new ReportScheduler()
    const result = await scheduler.generateWeeklyReport()

    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: 'Weekly report generated successfully',
        articleId: result.articleId,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to generate weekly report',
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Weekly report API error:', error)
    
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

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Weekly report generation endpoint',
    schedule: 'Every Monday at 10:00 JST',
    description: 'Generates AI-powered weekly trend analysis report',
  })
}