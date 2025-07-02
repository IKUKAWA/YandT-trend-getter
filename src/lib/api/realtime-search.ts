import { Platform } from '@/components/channel/PlatformSelector'

// 検索結果の型定義
export interface RealtimeSearchResult {
  id: string
  platform: Platform
  username: string
  displayName: string
  profileImageUrl?: string
  verified: boolean
  followerCount: number
  description?: string
  isPublic: boolean
  category?: string
  url: string
}

export interface SearchResponse {
  success: boolean
  results: RealtimeSearchResult[]
  totalResults: number
  hasMore: boolean
  nextPageToken?: string
  error?: string
}

// プラットフォーム固有の検索関数

/**
 * YouTube Data API v3を使用したチャンネル検索
 */
async function searchYouTubeChannels(query: string, maxResults: number = 20): Promise<RealtimeSearchResult[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY
  
  if (!API_KEY) {
    throw new Error('YouTube API key is not configured')
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
    `key=${API_KEY}&` +
    `type=channel&` +
    `part=snippet&` +
    `q=${encodeURIComponent(query)}&` +
    `maxResults=${maxResults}&` +
    `order=relevance&` +
    `regionCode=JP&` +
    `relevanceLanguage=ja`

  try {
    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'YouTube API error')
    }

    const results: RealtimeSearchResult[] = []

    if (data.items) {
      // チャンネル詳細情報を取得
      const channelIds = data.items.map((item: any) => item.snippet.channelId).join(',')
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?` +
        `key=${API_KEY}&` +
        `part=snippet,statistics,status&` +
        `id=${channelIds}`

      const channelResponse = await fetch(channelUrl)
      const channelData = await channelResponse.json()

      if (channelData.items) {
        for (const channel of channelData.items) {
          results.push({
            id: channel.id,
            platform: 'youtube',
            username: channel.snippet.customUrl || channel.id,
            displayName: channel.snippet.title,
            profileImageUrl: channel.snippet.thumbnails?.default?.url,
            verified: channel.status?.isLinked || false,
            followerCount: parseInt(channel.statistics?.subscriberCount || '0'),
            description: channel.snippet.description,
            isPublic: !channel.status?.privacyStatus || channel.status.privacyStatus === 'public',
            category: channel.snippet.defaultLanguage,
            url: `https://www.youtube.com/channel/${channel.id}`
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('YouTube search error:', error)
    throw error
  }
}

/**
 * TikTok Research API (仮想実装 - 実際のAPIは企業向け)
 */
async function searchTikTokAccounts(query: string, maxResults: number = 20): Promise<RealtimeSearchResult[]> {
  // 注意: TikTokの公式検索APIは限定的で、主に企業向けです
  // ここでは仮想的な実装を示します
  
  const TIKTOK_API_KEY = process.env.TIKTOK_API_KEY
  
  if (!TIKTOK_API_KEY) {
    // モックデータを返す（開発/デモ用）
    return generateMockTikTokResults(query, maxResults)
  }

  try {
    // 実際のTikTok Business API実装はここに追加
    // const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/user/info/', {
    //   headers: {
    //     'Access-Token': TIKTOK_API_KEY,
    //     'Content-Type': 'application/json'
    //   }
    // })
    
    // 暫定的にモックデータを返す
    return generateMockTikTokResults(query, maxResults)
  } catch (error) {
    console.error('TikTok search error:', error)
    throw error
  }
}

/**
 * X (Twitter) API v2を使用したユーザー検索
 */
async function searchXAccounts(query: string, maxResults: number = 20): Promise<RealtimeSearchResult[]> {
  const BEARER_TOKEN = process.env.X_BEARER_TOKEN
  
  if (!BEARER_TOKEN) {
    throw new Error('X API Bearer token is not configured')
  }

  const searchUrl = `https://api.twitter.com/2/users/by?` +
    `usernames=${encodeURIComponent(query)}&` +
    `user.fields=id,name,username,description,public_metrics,profile_image_url,verified,url&` +
    `max_results=${Math.min(maxResults, 100)}`

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'X API error')
    }

    const results: RealtimeSearchResult[] = []

    if (data.data) {
      for (const user of data.data) {
        results.push({
          id: user.id,
          platform: 'x',
          username: user.username,
          displayName: user.name,
          profileImageUrl: user.profile_image_url,
          verified: user.verified || false,
          followerCount: user.public_metrics?.followers_count || 0,
          description: user.description,
          isPublic: true, // X API only returns public accounts
          url: user.url || `https://x.com/${user.username}`
        })
      }
    }

    return results
  } catch (error) {
    console.error('X search error:', error)
    throw error
  }
}

/**
 * Instagram Basic Display API / Instagram Graph APIを使用した検索
 */
async function searchInstagramAccounts(query: string, maxResults: number = 20): Promise<RealtimeSearchResult[]> {
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
  
  if (!ACCESS_TOKEN) {
    // Instagram APIは複雑な認証が必要なため、モックデータを返す
    return generateMockInstagramResults(query, maxResults)
  }

  try {
    // Instagram Graph API実装（ビジネスアカウント向け）
    // const response = await fetch(`https://graph.instagram.com/ig_hashtag_search?` +
    //   `user_id=${USER_ID}&q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`)
    
    // 暫定的にモックデータを返す
    return generateMockInstagramResults(query, maxResults)
  } catch (error) {
    console.error('Instagram search error:', error)
    throw error
  }
}

// モックデータ生成関数
function generateMockTikTokResults(query: string, maxResults: number): RealtimeSearchResult[] {
  const mockUsers = [
    { name: '公式TikTok', username: 'tiktok_japan', followers: 5000000, verified: true },
    { name: 'ダンサーTikToker', username: 'dance_star_jp', followers: 1200000, verified: false },
    { name: 'コメディアン', username: 'funny_videos_jp', followers: 800000, verified: true },
    { name: '料理研究家', username: 'cooking_tips_jp', followers: 600000, verified: false },
    { name: 'ペット動画', username: 'cute_pets_jp', followers: 400000, verified: false }
  ]

  return mockUsers
    .filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxResults)
    .map((user, index) => ({
      id: `tiktok_${index}`,
      platform: 'tiktok' as Platform,
      username: user.username,
      displayName: user.name,
      profileImageUrl: `https://via.placeholder.com/100x100?text=${user.name.charAt(0)}`,
      verified: user.verified,
      followerCount: user.followers,
      description: `${user.name}の公式TikTokアカウント`,
      isPublic: true,
      category: 'エンターテイメント',
      url: `https://www.tiktok.com/@${user.username}`
    }))
}

function generateMockInstagramResults(query: string, maxResults: number): RealtimeSearchResult[] {
  const mockUsers = [
    { name: 'Instagram Japan', username: 'instagram_japan', followers: 3000000, verified: true },
    { name: 'フォトグラファー', username: 'photo_artist_jp', followers: 150000, verified: false },
    { name: 'ファッションブロガー', username: 'fashion_blogger_jp', followers: 90000, verified: false },
    { name: '旅行インフルエンサー', username: 'travel_lover_jp', followers: 200000, verified: true },
    { name: 'グルメ評論家', username: 'food_critic_jp', followers: 120000, verified: false }
  ]

  return mockUsers
    .filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxResults)
    .map((user, index) => ({
      id: `instagram_${index}`,
      platform: 'instagram' as Platform,
      username: user.username,
      displayName: user.name,
      profileImageUrl: `https://via.placeholder.com/100x100?text=${user.name.charAt(0)}`,
      verified: user.verified,
      followerCount: user.followers,
      description: `${user.name}の公式Instagramアカウント`,
      isPublic: true,
      category: 'ライフスタイル',
      url: `https://www.instagram.com/${user.username}`
    }))
}

/**
 * メイン検索関数 - プラットフォームに応じて適切な検索関数を呼び出す
 */
export async function searchByPlatform(
  platform: Platform,
  query: string,
  maxResults: number = 20
): Promise<SearchResponse> {
  try {
    let results: RealtimeSearchResult[] = []

    switch (platform) {
      case 'youtube':
        results = await searchYouTubeChannels(query, maxResults)
        break
      case 'tiktok':
        results = await searchTikTokAccounts(query, maxResults)
        break
      case 'x':
        results = await searchXAccounts(query, maxResults)
        break
      case 'instagram':
        results = await searchInstagramAccounts(query, maxResults)
        break
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    return {
      success: true,
      results,
      totalResults: results.length,
      hasMore: results.length === maxResults
    }
  } catch (error) {
    console.error(`Search error for ${platform}:`, error)
    return {
      success: false,
      results: [],
      totalResults: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * 複数プラットフォーム横断検索
 */
export async function searchAllPlatforms(
  query: string,
  platforms: Platform[] = ['youtube', 'tiktok', 'x', 'instagram'],
  maxResultsPerPlatform: number = 10
): Promise<SearchResponse> {
  try {
    const searchPromises = platforms.map(platform => 
      searchByPlatform(platform, query, maxResultsPerPlatform)
    )

    const responses = await Promise.allSettled(searchPromises)
    const allResults: RealtimeSearchResult[] = []
    let hasErrors = false

    responses.forEach((response, index) => {
      if (response.status === 'fulfilled' && response.value.success) {
        allResults.push(...response.value.results)
      } else {
        hasErrors = true
        console.warn(`Search failed for ${platforms[index]}:`, 
          response.status === 'rejected' ? response.reason : response.value.error)
      }
    })

    // フォロワー数でソート
    allResults.sort((a, b) => b.followerCount - a.followerCount)

    return {
      success: !hasErrors || allResults.length > 0,
      results: allResults,
      totalResults: allResults.length,
      hasMore: false,
      error: hasErrors ? 'Some platforms failed to search' : undefined
    }
  } catch (error) {
    console.error('Multi-platform search error:', error)
    return {
      success: false,
      results: [],
      totalResults: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * レート制限とエラー処理を含む安全な検索ラッパー
 */
export async function safeSearch(
  platform: Platform,
  query: string,
  options: {
    maxResults?: number
    retryCount?: number
    timeout?: number
  } = {}
): Promise<SearchResponse> {
  const { maxResults = 20, retryCount = 2, timeout = 10000 } = options

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const result = await searchByPlatform(platform, query, maxResults)
      clearTimeout(timeoutId)

      if (result.success) {
        return result
      }

      // API rate limit error handling
      if (result.error?.includes('rate limit') && attempt < retryCount) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return result
    } catch (error) {
      if (attempt === retryCount) {
        return {
          success: false,
          results: [],
          totalResults: 0,
          hasMore: false,
          error: error instanceof Error ? error.message : 'Search failed after retries'
        }
      }

      // Wait before retry
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    results: [],
    totalResults: 0,
    hasMore: false,
    error: 'Max retries exceeded'
  }
}