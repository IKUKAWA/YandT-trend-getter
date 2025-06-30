import { NextRequest, NextResponse } from 'next/server'
import { XApi } from '@/lib/api/x-api'
import { enrichTrendsWithCategories } from '@/lib/utils/category-mapper'

const xApi = new XApi()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'トレンド'
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeframe = searchParams.get('timeframe') || 'recent'

    // X APIからトレンドデータを取得
    const trends = await xApi.searchTrends(query, {
      max_results: limit
    })

    // カテゴリ情報を追加してフォーマット
    const formattedTrends = trends.map(trend => ({
      id: trend.id,
      title: trend.text.substring(0, 100),
      platform: 'X',
      category: extractCategory(trend.text, trend.hashtags || []),
      views: estimateViews(trend.public_metrics),
      likes: trend.public_metrics.like_count,
      comments: trend.public_metrics.reply_count,
      shares: trend.public_metrics.retweet_count + trend.public_metrics.quote_count,
      createdAt: trend.created_at,
      hashtags: trend.hashtags || [],
      url: `https://twitter.com/status/${trend.id}`,
      author: trend.author_id,
      engagement_rate: calculateEngagementRate(trend.public_metrics)
    }))

    // カテゴリ情報を付加
    const enrichedTrends = enrichTrendsWithCategories(formattedTrends)

    return NextResponse.json({
      success: true,
      data: enrichedTrends,
      metadata: {
        platform: 'X',
        query,
        total: enrichedTrends.length,
        timeframe,
        last_updated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('X Trends API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch X trends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hashtag, action } = body

    if (action === 'analyze') {
      const analysis = await xApi.analyzeHashtagTrends(hashtag)
      return NextResponse.json({
        success: true,
        data: analysis
      })
    }

    if (action === 'realtime') {
      const realtimeTrends = await xApi.getRealtimeTrends()
      return NextResponse.json({
        success: true,
        data: realtimeTrends
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('X Trends POST Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process X trends request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ヘルパー関数
function extractCategory(text: string, hashtags: string[]): string {
  const categoryKeywords = {
    'Sports': ['野球', 'サッカー', 'バスケ', 'テニス', 'スポーツ', '試合', '選手'],
    'Music': ['音楽', '歌', 'コンサート', 'ライブ', 'アーティスト', 'CD', '楽曲'],
    'Entertainment': ['映画', 'ドラマ', 'アニメ', '芸能', 'テレビ', '番組'],
    'Technology': ['AI', 'iPhone', 'Android', 'IT', 'プログラミング', 'テック'],
    'News': ['政治', '経済', '社会', '国際', '事件', '速報', 'ニュース'],
    'Gaming': ['ゲーム', 'eSports', 'PlayStation', 'Nintendo', 'ゲーム実況'],
    'Food': ['料理', 'グルメ', 'レシピ', 'カフェ', 'レストラン', '食べ物'],
    'Travel': ['旅行', '観光', '旅', '海外', '国内旅行', '絶景']
  }

  const combinedText = `${text} ${hashtags.join(' ')}`.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category
    }
  }

  return 'Entertainment' // デフォルトカテゴリ
}

function estimateViews(metrics: any): number {
  // エンゲージメント数からビュー数を推定（経験則）
  const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count
  return Math.floor(totalEngagement * 10) // エンゲージメントの10倍程度と仮定
}

function calculateEngagementRate(metrics: any): number {
  const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count
  const estimatedViews = estimateViews(metrics)
  
  if (estimatedViews === 0) return 0
  return Math.round((totalEngagement / estimatedViews) * 100 * 100) / 100
}