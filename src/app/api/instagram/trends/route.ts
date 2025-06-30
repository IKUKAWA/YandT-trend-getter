import { NextRequest, NextResponse } from 'next/server'
import { InstagramApi } from '@/lib/api/instagram-api'
import { enrichTrendsWithCategories } from '@/lib/utils/category-mapper'

const instagramApi = new InstagramApi()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hashtag = searchParams.get('hashtag') || 'インスタ映え'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '25')

    let trends
    if (hashtag) {
      // 特定のハッシュタグで検索
      trends = await instagramApi.searchByHashtag(hashtag, { limit })
    } else {
      // カテゴリ別トレンドハッシュタグを取得
      const hashtagData = await instagramApi.getTrendingHashtags(category)
      trends = hashtagData.flatMap(hd => hd.top_posts.map(post => ({
        id: post.id,
        title: post.caption?.substring(0, 100) || 'Instagram投稿',
        platform: 'Instagram',
        category: extractCategory(post.caption || '', post.hashtags || []),
        views: post.insights?.reach || 0,
        likes: post.insights?.likes || 0,
        comments: post.insights?.comments || 0,
        shares: post.insights?.shares || 0,
        createdAt: post.timestamp,
        hashtags: post.hashtags || [],
        url: post.permalink,
        media_type: post.media_type,
        media_url: post.media_url,
        engagement_rate: post.insights?.engagement_rate || 0
      }))).slice(0, limit)
    }

    // フォーマット
    const formattedTrends = trends.map(trend => ({
      id: trend.id,
      title: trend.title || trend.caption?.substring(0, 100) || 'Instagram投稿',
      platform: 'Instagram',
      category: trend.category || extractCategory(trend.caption || '', trend.hashtags || []),
      views: trend.views || estimateViews(trend.likes_count, trend.comments_count),
      likes: trend.likes || trend.likes_count || 0,
      comments: trend.comments || trend.comments_count || 0,
      shares: trend.shares || Math.floor((trend.likes || 0) * 0.1), // 推定シェア数
      createdAt: trend.createdAt || trend.timestamp,
      hashtags: trend.hashtags || [],
      url: trend.url || trend.permalink,
      media_type: trend.media_type,
      media_url: trend.media_url,
      engagement_rate: trend.engagement_rate || calculateEngagementRate(trend.likes || 0, trend.comments || 0, trend.views || 1)
    }))

    // カテゴリ情報を付加
    const enrichedTrends = enrichTrendsWithCategories(formattedTrends)

    return NextResponse.json({
      success: true,
      data: enrichedTrends,
      metadata: {
        platform: 'Instagram',
        hashtag,
        category,
        total: enrichedTrends.length,
        last_updated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Instagram Trends API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Instagram trends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, hashtag, category, timeframe } = body

    if (action === 'trending_hashtags') {
      const trendingHashtags = await instagramApi.getTrendingHashtags(category)
      return NextResponse.json({
        success: true,
        data: trendingHashtags
      })
    }

    if (action === 'analyze_performance') {
      const analysis = await instagramApi.analyzeContentPerformance(hashtag, timeframe)
      return NextResponse.json({
        success: true,
        data: analysis
      })
    }

    if (action === 'realtime_trends') {
      const realtimeTrends = await instagramApi.getRealtimeTrends(category)
      return NextResponse.json({
        success: true,
        data: realtimeTrends
      })
    }

    if (action === 'analyze_influencers') {
      const influencers = await instagramApi.analyzeInfluencers(category)
      return NextResponse.json({
        success: true,
        data: influencers
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Instagram Trends POST Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process Instagram trends request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ヘルパー関数
function extractCategory(caption: string, hashtags: string[]): string {
  const categoryKeywords = {
    'Fashion': ['ファッション', 'コーデ', 'OOTD', 'スタイル', '服', 'おしゃれ'],
    'Beauty': ['メイク', 'コスメ', 'スキンケア', '美容', 'コスメレビュー', '化粧'],
    'Food': ['グルメ', '料理', 'カフェ', 'スイーツ', 'レシピ', '食べ物', 'デザート'],
    'Travel': ['旅行', '観光', '絶景', 'トラベル', '旅行記', 'vacation', '海外'],
    'Lifestyle': ['ライフスタイル', '暮らし', 'おうち時間', 'インテリア', '日常'],
    'Fitness': ['フィットネス', 'ワークアウト', 'ヨガ', 'ダイエット', '筋トレ', 'トレーニング'],
    'Art': ['アート', '絵', 'イラスト', 'デザイン', 'クリエイティブ', 'handmade'],
    'Photography': ['写真', '撮影', 'photo', 'フォト', 'カメラ', 'portrait']
  }

  const combinedText = `${caption} ${hashtags.join(' ')}`.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword.toLowerCase()))) {
      return category
    }
  }

  return 'Lifestyle' // デフォルトカテゴリ
}

function estimateViews(likes: number, comments: number): number {
  // いいね数とコメント数からリーチ数を推定
  const engagement = likes + comments
  return Math.floor(engagement * 8) // エンゲージメントの8倍程度と仮定（Instagram平均）
}

function calculateEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0
  const totalEngagement = likes + comments
  return Math.round((totalEngagement / views) * 100 * 100) / 100
}