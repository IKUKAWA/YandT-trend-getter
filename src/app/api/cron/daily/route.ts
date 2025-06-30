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
    const result = await scheduler.runDailyTasks()

    return NextResponse.json({
      status: result.success ? 'success' : 'error',
      message: result.success 
        ? 'Daily tasks completed successfully'
        : 'Daily tasks failed',
      collected: result.collected,
      error: result.error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Daily cron API error:', error)
    
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
  const scheduler = new ReportScheduler()
  const scheduleInfo = scheduler.getScheduleInfo()

  return NextResponse.json({
    status: 'success',
    message: 'Daily cron job endpoint',
    schedule: scheduleInfo.daily,
    description: 'Runs daily data collection tasks',
  })
}