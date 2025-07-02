import { NextRequest, NextResponse } from 'next/server'
import { ChannelSearchResult } from '@/types/channel'

// Mock data for demonstration - Expanded with more diverse channels
const mockChannels: ChannelSearchResult[] = [
  {
    id: 'ch_001',
    platform: 'youtube',
    name: 'テックレビューチャンネル',
    avatar: '/avatars/tech-channel.jpg',
    subscriberCount: 150000,
    category: 'テクノロジー',
    verified: true,
    description: '最新のテクノロジー製品をわかりやすくレビューするチャンネルです。'
  },
  {
    id: 'ch_002',
    platform: 'youtube',
    name: 'ガジェットマスター',
    avatar: '/avatars/gadget-master.jpg',
    subscriberCount: 220000,
    category: 'テクノロジー',
    verified: true,
    description: 'ガジェット好きによるガジェット好きのためのチャンネル'
  },
  {
    id: 'ch_003',
    platform: 'tiktok',
    name: 'テクトック',
    subscriberCount: 85000,
    category: 'テクノロジー',
    verified: false,
    description: 'TikTokでテクノロジーを面白く紹介'
  },
  {
    id: 'ch_004',
    platform: 'youtube',
    name: 'IT情報局',
    subscriberCount: 95000,
    category: 'テクノロジー',
    verified: false,
    description: 'IT業界の最新ニュースと解説'
  },
  {
    id: 'ch_005',
    platform: 'youtube',
    name: 'ゲーミングワールド',
    subscriberCount: 180000,
    category: 'ゲーム',
    verified: true,
    description: '最新ゲームのレビューと攻略情報'
  },
  {
    id: 'ch_006',
    platform: 'tiktok',
    name: 'ゲームTikTok',
    subscriberCount: 120000,
    category: 'ゲーム',
    verified: false,
    description: 'ゲームの面白いシーンをショート動画で'
  },
  {
    id: 'ch_007',
    platform: 'youtube',
    name: 'ライフスタイルTV',
    subscriberCount: 75000,
    category: 'ライフスタイル',
    verified: false,
    description: '毎日をもっと豊かにするライフスタイル提案'
  },
  {
    id: 'ch_008',
    platform: 'youtube',
    name: 'ファッションニュース',
    subscriberCount: 90000,
    category: 'ファッション',
    verified: true,
    description: '最新ファッショントレンドとスタイリング'
  },
  // Additional diverse channels for better testing
  {
    id: 'ch_009',
    platform: 'youtube',
    name: 'HikakinTV',
    subscriberCount: 5500000,
    category: 'エンターテイメント',
    verified: true,
    description: '日本を代表するYouTuber Hikakinのメインチャンネル'
  },
  {
    id: 'ch_010',
    platform: 'youtube',
    name: 'はじめしゃちょー',
    subscriberCount: 10200000,
    category: 'エンターテイメント',
    verified: true,
    description: '毎日楽しい動画をお届け！実験やチャレンジが中心'
  },
  {
    id: 'ch_011',
    platform: 'youtube',
    name: 'KAZU',
    subscriberCount: 300000,
    category: 'ライフスタイル',
    verified: false,
    description: 'ミニマリストライフスタイルを発信'
  },
  {
    id: 'ch_012',
    platform: 'tiktok',
    name: 'TikTokダンス',
    subscriberCount: 450000,
    category: 'エンターテイメント',
    verified: true,
    description: '最新のダンストレンドを配信'
  },
  {
    id: 'ch_013',
    platform: 'youtube',
    name: '料理研究家',
    subscriberCount: 680000,
    category: 'ライフスタイル',
    verified: true,
    description: '簡単で美味しい料理レシピを毎日更新'
  },
  {
    id: 'ch_014',
    platform: 'youtube',
    name: 'VTuberチャンネル',
    subscriberCount: 1200000,
    category: 'エンターテイメント',
    verified: true,
    description: 'バーチャルYouTuberの配信チャンネル'
  },
  {
    id: 'ch_015',
    platform: 'tiktok',
    name: '美容TikTok',
    subscriberCount: 230000,
    category: 'ファッション',
    verified: false,
    description: 'メイクアップとスキンケアのコツ'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const platform = searchParams.get('platform') // 'youtube' | 'tiktok' | 'all'
    const category = searchParams.get('category')
    const minSubscribers = searchParams.get('minSubscribers')
    const maxSubscribers = searchParams.get('maxSubscribers')
    const verified = searchParams.get('verified')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Debug logging for development only
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Channel Search API ===')
      console.log('Request URL:', request.url)
      console.log('Search params:')
      console.log('  query:', query)
      console.log('  platform:', platform)
      console.log('  category:', category)
      console.log('  minSubscribers:', minSubscribers)
      console.log('  maxSubscribers:', maxSubscribers)
      console.log('  verified:', verified)
      console.log('  limit:', limit)
      console.log('  offset:', offset)
    }

    // Validate query length
    if (query.length < 2) {
      console.log('Query too short, returning error')
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long',
        results: [],
        total: 0
      }, { status: 400 })
    }

    // Filter channels based on search criteria
    console.log('Available channels:', mockChannels.length)
    console.log('Starting filtering...')
    
    let filteredChannels = mockChannels.filter(channel => {
      // Text search
      const matchesQuery = 
        channel.name.toLowerCase().includes(query) ||
        channel.description?.toLowerCase().includes(query) ||
        channel.category.toLowerCase().includes(query)

      console.log(`Channel: ${channel.name}, matches query "${query}": ${matchesQuery}`)
      
      if (!matchesQuery) return false

      // Platform filter
      if (platform && platform !== 'all' && channel.platform !== platform) {
        return false
      }

      // Category filter
      if (category && channel.category !== category) {
        return false
      }

      // Subscriber count filters
      if (minSubscribers && channel.subscriberCount < parseInt(minSubscribers)) {
        return false
      }
      if (maxSubscribers && channel.subscriberCount > parseInt(maxSubscribers)) {
        return false
      }

      // Verified filter
      if (verified === 'true' && !channel.verified) {
        return false
      }
      if (verified === 'false' && channel.verified) {
        return false
      }

      return true
    })

    // Sort by subscriber count (descending) and relevance
    filteredChannels.sort((a, b) => {
      // Exact name match gets priority
      const aExactMatch = a.name.toLowerCase() === query
      const bExactMatch = b.name.toLowerCase() === query
      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      // Then by subscriber count
      return b.subscriberCount - a.subscriberCount
    })

    console.log(`Total filtered channels: ${filteredChannels.length}`)
    console.log('Filtered channels:', filteredChannels.map(c => c.name))

    // Pagination
    const total = filteredChannels.length
    const paginatedResults = filteredChannels.slice(offset, offset + limit)
    
    console.log(`Paginated results (${offset}-${offset + limit}):`, paginatedResults.map(c => c.name))

    // Add search analytics
    const searchAnalytics = {
      totalResults: total,
      platforms: {
        youtube: filteredChannels.filter(c => c.platform === 'youtube').length,
        tiktok: filteredChannels.filter(c => c.platform === 'tiktok').length
      },
      categories: filteredChannels.reduce((acc, channel) => {
        acc[channel.category] = (acc[channel.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageSubscribers: Math.round(
        filteredChannels.reduce((sum, c) => sum + c.subscriberCount, 0) / 
        (filteredChannels.length || 1)
      ),
      verifiedCount: filteredChannels.filter(c => c.verified).length
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const response = {
      success: true,
      results: paginatedResults,
      total,
      query,
      analytics: searchAnalytics,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
    
    console.log('Final API response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Channel search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      results: [],
      total: 0
    }, { status: 500 })
  }
}

// POST endpoint for advanced search with complex filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      filters = {},
      sorting = { field: 'subscriberCount', order: 'desc' },
      pagination = { limit: 10, offset: 0 }
    } = body

    // Validate input
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      }, { status: 400 })
    }

    // Apply advanced filters
    let filteredChannels = mockChannels.filter(channel => {
      // Basic text search
      const matchesQuery = 
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.description?.toLowerCase().includes(query.toLowerCase()) ||
        channel.category.toLowerCase().includes(query.toLowerCase())

      if (!matchesQuery) return false

      // Advanced filters
      if (filters.platforms && filters.platforms.length > 0) {
        if (!filters.platforms.includes(channel.platform)) return false
      }

      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(channel.category)) return false
      }

      if (filters.subscriberRange) {
        const { min, max } = filters.subscriberRange
        if (min && channel.subscriberCount < min) return false
        if (max && channel.subscriberCount > max) return false
      }

      if (filters.verifiedOnly && !channel.verified) return false

      return true
    })

    // Apply sorting
    filteredChannels.sort((a, b) => {
      const field = sorting.field
      const order = sorting.order === 'asc' ? 1 : -1
      
      if (field === 'subscriberCount') {
        return (a.subscriberCount - b.subscriberCount) * order
      } else if (field === 'name') {
        return a.name.localeCompare(b.name) * order
      } else if (field === 'relevance') {
        // Simple relevance score based on exact matches
        const aScore = a.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 1
        const bScore = b.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 1
        return (bScore - aScore) * order
      }
      
      return 0
    })

    // Pagination
    const total = filteredChannels.length
    const { limit, offset } = pagination
    const paginatedResults = filteredChannels.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      results: paginatedResults,
      total,
      query,
      filters: filters,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Advanced channel search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}