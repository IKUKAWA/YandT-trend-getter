import { NextRequest, NextResponse } from 'next/server'
import { searchByPlatform, searchAllPlatforms, safeSearch } from '@/lib/api/realtime-search'
import { Platform } from '@/components/channel/PlatformSelector'

// レート制限のためのメモリストア（本番環境ではRedisを推奨）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null
    const query = searchParams.get('q') || searchParams.get('query')
    const maxResults = parseInt(searchParams.get('maxResults') || '20')
    const safe = searchParams.get('safe') === 'true'

    // 入力検証
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'クエリは2文字以上で入力してください',
          results: [],
          totalResults: 0,
          hasMore: false
        },
        { status: 400 }
      )
    }

    if (maxResults > 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: '最大結果数は50件までです',
          results: [],
          totalResults: 0,
          hasMore: false
        },
        { status: 400 }
      )
    }

    // レート制限チェック
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'レート制限に達しました。しばらく待ってから再試行してください',
          results: [],
          totalResults: 0,
          hasMore: false
        },
        { status: 429 }
      )
    }

    // プラットフォーム検証
    const validPlatforms: Platform[] = ['youtube', 'tiktok', 'x', 'instagram']
    
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `無効なプラットフォーム: ${platform}`,
          results: [],
          totalResults: 0,
          hasMore: false
        },
        { status: 400 }
      )
    }

    let result

    if (platform) {
      // 単一プラットフォーム検索
      if (safe) {
        result = await safeSearch(platform, query, { 
          maxResults,
          retryCount: 2,
          timeout: 15000 
        })
      } else {
        result = await searchByPlatform(platform, query, maxResults)
      }
    } else {
      // 全プラットフォーム検索
      result = await searchAllPlatforms(query, validPlatforms, Math.ceil(maxResults / 4))
    }

    // 結果の後処理
    if (result.success) {
      // プライベートアカウントや無効なデータを除外
      result.results = result.results.filter(account => 
        account.isPublic && 
        account.displayName && 
        account.username
      )
      
      // フォロワー数でソート
      result.results.sort((a, b) => b.followerCount - a.followerCount)
      
      // maxResultsに制限
      if (result.results.length > maxResults) {
        result.results = result.results.slice(0, maxResults)
        result.hasMore = true
      }

      result.totalResults = result.results.length
    }

    // 成功レスポンス
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': String(100 - (rateLimitStore.get(clientIp)?.count || 0)),
        'X-RateLimit-Reset': String(Math.ceil((rateLimitStore.get(clientIp)?.resetTime || Date.now()) / 1000))
      }
    })

  } catch (error) {
    console.error('Realtime search API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '内部サーバーエラーが発生しました',
        results: [],
        totalResults: 0,
        hasMore: false
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, query, options = {} } = body

    // 入力検証
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'クエリは2文字以上で入力してください' 
        },
        { status: 400 }
      )
    }

    if (!platform) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'プラットフォームを指定してください' 
        },
        { status: 400 }
      )
    }

    // レート制限チェック
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    if (!checkRateLimit(clientIp, 50, 60000)) { // POSTはより制限的
      return NextResponse.json(
        { 
          success: false, 
          error: 'レート制限に達しました。しばらく待ってから再試行してください' 
        },
        { status: 429 }
      )
    }

    const result = await safeSearch(platform, query, {
      maxResults: options.maxResults || 20,
      retryCount: options.retryCount || 2,
      timeout: options.timeout || 15000
    })

    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    })

  } catch (error) {
    console.error('Realtime search POST API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '内部サーバーエラーが発生しました' 
      },
      { status: 500 }
    )
  }
}

// OPTIONSメソッドでCORSを処理
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}