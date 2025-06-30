import { NextRequest, NextResponse } from 'next/server'
import { DataCollector } from '@/lib/data-collector'

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

    const collector = new DataCollector()
    await collector.collectAllData()

    return NextResponse.json({
      status: 'success',
      message: 'Data collection completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Data collection API error:', error)
    
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
    message: 'Data collection endpoint is available',
    endpoints: {
      collect: 'POST /api/collect - Trigger data collection',
    },
  })
}