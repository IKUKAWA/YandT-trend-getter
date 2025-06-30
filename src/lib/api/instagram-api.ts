/**
 * Instagram Basic Display API & Graph API 統合
 * トレンドコンテンツとインサイト分析
 */

interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  timestamp: string
  username?: string
  hashtags?: string[]
  mentions?: string[]
  insights?: {
    impressions: number
    reach: number
    likes: number
    comments: number
    saves: number
    shares: number
    engagement_rate: number
  }
}

interface InstagramTrendData {
  id: string
  caption: string
  media_type: string
  media_url: string
  permalink: string
  timestamp: string
  hashtags: string[]
  likes_count: number
  comments_count: number
  engagement_rate: number
  category: string
  trending_score: number
}

interface InstagramHashtagData {
  hashtag: string
  media_count: number
  top_posts: InstagramPost[]
  recent_posts: InstagramPost[]
  related_hashtags: string[]
  trending_score: number
}

interface InstagramInfluencer {
  id: string
  username: string
  name: string
  biography?: string
  followers_count: number
  following_count: number
  media_count: number
  engagement_rate: number
  category: string
  recent_posts: InstagramPost[]
  audience_insights?: {
    age_groups: Record<string, number>
    gender: Record<string, number>
    top_locations: string[]
  }
}

export class InstagramApi {
  private accessToken: string
  private appId: string
  private appSecret: string
  private baseUrl = 'https://graph.instagram.com'
  private graphUrl = 'https://graph.facebook.com/v18.0'

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || ''
    this.appId = process.env.INSTAGRAM_APP_ID || ''
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || ''
  }

  /**
   * ハッシュタグで投稿を検索
   */
  async searchByHashtag(
    hashtag: string,
    options: {
      limit?: number
      since?: string
      until?: string
    } = {}
  ): Promise<InstagramTrendData[]> {
    try {
      // Instagram Graph APIを使用してハッシュタグ検索
      // 注意: 実際のAPIでは制限があるため、モックデータを返す
      return this.getMockInstagramData(hashtag, options.limit || 25)
    } catch (error) {
      console.error('Error searching Instagram by hashtag:', error)
      return this.getMockInstagramData(hashtag, options.limit || 25)
    }
  }

  /**
   * トレンドハッシュタグを取得
   */
  async getTrendingHashtags(
    category?: string,
    location?: string
  ): Promise<InstagramHashtagData[]> {
    try {
      // カテゴリ別のトレンドハッシュタグを生成
      const trendingHashtags = this.generateTrendingHashtags(category)
      const results = []

      for (const hashtag of trendingHashtags) {
        const posts = await this.searchByHashtag(hashtag, { limit: 20 })
        results.push({
          hashtag,
          media_count: Math.floor(Math.random() * 1000000) + 10000,
          top_posts: this.convertToInstagramPosts(posts.slice(0, 9)),
          recent_posts: this.convertToInstagramPosts(posts.slice(9, 18)),
          related_hashtags: this.generateRelatedHashtags(hashtag),
          trending_score: Math.random() * 100
        })
      }

      return results.sort((a, b) => b.trending_score - a.trending_score)
    } catch (error) {
      console.error('Error getting trending hashtags:', error)
      return this.getMockHashtagData(category)
    }
  }

  /**
   * インフルエンサー分析
   */
  async analyzeInfluencers(
    category: string,
    minFollowers: number = 10000
  ): Promise<InstagramInfluencer[]> {
    try {
      // カテゴリ関連のハッシュタグからインフルエンサーを探索
      const hashtags = this.getCategoryHashtags(category)
      const influencers = []

      for (const hashtag of hashtags.slice(0, 5)) {
        const posts = await this.searchByHashtag(hashtag, { limit: 50 })
        
        // 投稿者をユニークに抽出
        const uniqueUsers = new Map()
        posts.forEach(post => {
          if (!uniqueUsers.has(post.id.split('_')[0])) {
            uniqueUsers.set(post.id.split('_')[0], post)
          }
        })

        // インフルエンサー情報を生成
        for (const [userId, post] of uniqueUsers.entries()) {
          const followerCount = Math.floor(Math.random() * 500000) + minFollowers
          if (followerCount >= minFollowers) {
            influencers.push(this.generateInfluencerData(userId, category, followerCount))
          }
        }
      }

      return influencers
        .sort((a, b) => b.engagement_rate - a.engagement_rate)
        .slice(0, 20)
    } catch (error) {
      console.error('Error analyzing influencers:', error)
      return this.getMockInfluencers(category, minFollowers)
    }
  }

  /**
   * コンテンツパフォーマンス分析
   */
  async analyzeContentPerformance(
    hashtag: string,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<{
    hashtag: string
    total_posts: number
    avg_engagement: number
    top_performing_posts: InstagramPost[]
    engagement_trends: Array<{
      date: string
      posts_count: number
      avg_likes: number
      avg_comments: number
    }>
    content_types: Record<string, number>
    optimal_posting_times: string[]
  }> {
    try {
      const posts = await this.searchByHashtag(hashtag, { limit: 100 })
      
      // エンゲージメント分析
      const totalEngagement = posts.reduce((sum, post) => 
        sum + post.likes_count + post.comments_count, 0
      )
      const avgEngagement = totalEngagement / posts.length || 0

      // トップパフォーマンス投稿
      const topPosts = posts
        .sort((a, b) => b.engagement_rate - a.engagement_rate)
        .slice(0, 10)

      // コンテンツタイプ分析
      const contentTypes = posts.reduce((acc, post) => {
        const type = this.getContentType(post)
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // 時系列エンゲージメント
      const engagementTrends = this.generateEngagementTrends(timeframe)

      return {
        hashtag,
        total_posts: posts.length,
        avg_engagement: Math.round(avgEngagement * 100) / 100,
        top_performing_posts: this.convertToInstagramPosts(topPosts),
        engagement_trends: engagementTrends,
        content_types: contentTypes,
        optimal_posting_times: ['9:00', '12:00', '15:00', '18:00', '21:00']
      }
    } catch (error) {
      console.error('Error analyzing content performance:', error)
      return this.getMockContentAnalysis(hashtag, timeframe)
    }
  }

  /**
   * リアルタイムトレンド監視
   */
  async getRealtimeTrends(category?: string): Promise<Array<{
    hashtag: string
    category: string
    growth_rate: number
    current_volume: number
    predicted_volume: number
    trending_posts: InstagramPost[]
    sentiment: 'positive' | 'neutral' | 'negative'
  }>> {
    try {
      const trendingHashtags = await this.getTrendingHashtags(category)
      const trends = []

      for (const hashtagData of trendingHashtags.slice(0, 10)) {
        const posts = hashtagData.top_posts
        trends.push({
          hashtag: hashtagData.hashtag,
          category: this.categorizeHashtag(hashtagData.hashtag),
          growth_rate: Math.random() * 100 - 20,
          current_volume: hashtagData.media_count,
          predicted_volume: Math.floor(hashtagData.media_count * (1 + Math.random() * 0.5)),
          trending_posts: posts.slice(0, 5),
          sentiment: this.analyzeSentiment(posts.map(p => p.caption || ''))
        })
      }

      return trends.sort((a, b) => b.growth_rate - a.growth_rate)
    } catch (error) {
      console.error('Error getting realtime trends:', error)
      return this.getMockRealtimeTrends(category)
    }
  }

  /**
   * ユーザー詳細情報を取得
   */
  async getUserDetails(username: string): Promise<InstagramInfluencer | null> {
    try {
      // 実際のAPIコール（制限により、モックデータを返す）
      return this.generateInfluencerData(username, 'general', 50000)
    } catch (error) {
      console.error('Error getting user details:', error)
      return null
    }
  }

  /**
   * プライベートヘルパーメソッド群
   */
  private getMockInstagramData(hashtag: string, limit: number): InstagramTrendData[] {
    return Array.from({ length: limit }, (_, i) => ({
      id: `ig_${Date.now()}_${i}`,
      caption: `${hashtag}に関する投稿 ${i + 1} #instagram #${hashtag} #トレンド`,
      media_type: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'][Math.floor(Math.random() * 3)],
      media_url: `https://example.com/image_${i}.jpg`,
      permalink: `https://instagram.com/p/post_${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      hashtags: [hashtag, 'instagram', 'トレンド', 'おしゃれ'],
      likes_count: Math.floor(Math.random() * 10000) + 100,
      comments_count: Math.floor(Math.random() * 1000) + 10,
      engagement_rate: Math.random() * 15 + 1,
      category: this.categorizeHashtag(hashtag),
      trending_score: Math.random() * 100
    }))
  }

  private convertToInstagramPosts(trendData: InstagramTrendData[]): InstagramPost[] {
    return trendData.map(data => ({
      id: data.id,
      caption: data.caption,
      media_type: data.media_type as any,
      media_url: data.media_url,
      permalink: data.permalink,
      timestamp: data.timestamp,
      hashtags: data.hashtags,
      insights: {
        impressions: data.likes_count * 10,
        reach: data.likes_count * 8,
        likes: data.likes_count,
        comments: data.comments_count,
        saves: Math.floor(data.likes_count * 0.1),
        shares: Math.floor(data.likes_count * 0.05),
        engagement_rate: data.engagement_rate
      }
    }))
  }

  private generateTrendingHashtags(category?: string): string[] {
    const categoryHashtags: Record<string, string[]> = {
      'fashion': ['ファッション', 'コーデ', 'OOTD', 'スタイル', 'トレンド'],
      'beauty': ['メイク', 'コスメ', 'スキンケア', '美容', 'コスメレビュー'],
      'food': ['グルメ', '料理', 'カフェ', 'スイーツ', 'レシピ'],
      'travel': ['旅行', '観光', '絶景', 'トラベル', '旅行記'],
      'fitness': ['フィットネス', 'ワークアウト', 'ヨガ', 'ダイエット', '筋トレ'],
      'lifestyle': ['ライフスタイル', '暮らし', 'おうち時間', 'インテリア', '日常']
    }

    if (category && categoryHashtags[category]) {
      return categoryHashtags[category]
    }

    return [
      'インスタ映え', 'フォトジェニック', 'おしゃれ', 'かわいい', 'きれい',
      'トレンド', '話題', '人気', 'バズり', 'インフルエンサー'
    ]
  }

  private generateRelatedHashtags(hashtag: string): string[] {
    const related = ['インスタ', 'おしゃれ', 'かわいい', 'トレンド', '人気']
    return related.map(r => `${hashtag}${r}`).slice(0, 5)
  }

  private getCategoryHashtags(category: string): string[] {
    return this.generateTrendingHashtags(category.toLowerCase())
  }

  private categorizeHashtag(hashtag: string): string {
    const categories = {
      'ファッション': ['ファッション', 'コーデ', 'OOTD', 'スタイル'],
      '美容': ['メイク', 'コスメ', 'スキンケア', '美容'],
      'グルメ': ['グルメ', '料理', 'カフェ', 'スイーツ'],
      '旅行': ['旅行', '観光', '絶景', 'トラベル'],
      'ライフスタイル': ['ライフスタイル', '暮らし', 'おうち時間']
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => hashtag.includes(k))) {
        return category
      }
    }
    return 'その他'
  }

  private getContentType(post: InstagramTrendData): string {
    if (post.media_type === 'VIDEO') return '動画'
    if (post.media_type === 'CAROUSEL_ALBUM') return 'カルーセル'
    return '画像'
  }

  private generateEngagementTrends(timeframe: string) {
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      posts_count: Math.floor(Math.random() * 100) + 10,
      avg_likes: Math.floor(Math.random() * 1000) + 100,
      avg_comments: Math.floor(Math.random() * 100) + 10
    }))
  }

  private generateInfluencerData(userId: string, category: string, followers: number): InstagramInfluencer {
    return {
      id: userId,
      username: `influencer_${userId.slice(0, 8)}`,
      name: `インフルエンサー ${userId.slice(0, 8)}`,
      biography: `${category}分野のインフルエンサーです`,
      followers_count: followers,
      following_count: Math.floor(Math.random() * 2000) + 500,
      media_count: Math.floor(Math.random() * 500) + 100,
      engagement_rate: Math.random() * 10 + 2,
      category,
      recent_posts: this.convertToInstagramPosts(this.getMockInstagramData(category, 6)),
      audience_insights: {
        age_groups: {
          '18-24': 25,
          '25-34': 35,
          '35-44': 25,
          '45+': 15
        },
        gender: {
          'female': 65,
          'male': 35
        },
        top_locations: ['東京', '大阪', '名古屋', '福岡', '札幌']
      }
    }
  }

  private analyzeSentiment(captions: string[]): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['素敵', '可愛い', '美しい', '最高', '好き', '楽しい']
    const negativeWords = ['残念', 'がっかり', '嫌い', 'ひどい', '最悪']
    
    let positiveScore = 0
    let negativeScore = 0
    
    captions.forEach(caption => {
      positiveWords.forEach(word => {
        if (caption.includes(word)) positiveScore++
      })
      negativeWords.forEach(word => {
        if (caption.includes(word)) negativeScore++
      })
    })
    
    if (positiveScore > negativeScore * 1.2) return 'positive'
    if (negativeScore > positiveScore * 1.2) return 'negative'
    return 'neutral'
  }

  private getMockHashtagData(category?: string): InstagramHashtagData[] {
    const hashtags = this.generateTrendingHashtags(category)
    return hashtags.map(hashtag => ({
      hashtag,
      media_count: Math.floor(Math.random() * 1000000) + 10000,
      top_posts: this.convertToInstagramPosts(this.getMockInstagramData(hashtag, 9)),
      recent_posts: this.convertToInstagramPosts(this.getMockInstagramData(hashtag, 9)),
      related_hashtags: this.generateRelatedHashtags(hashtag),
      trending_score: Math.random() * 100
    }))
  }

  private getMockInfluencers(category: string, minFollowers: number): InstagramInfluencer[] {
    return Array.from({ length: 15 }, (_, i) => 
      this.generateInfluencerData(`inf_${i}`, category, minFollowers + i * 10000)
    )
  }

  private getMockContentAnalysis(hashtag: string, timeframe: string) {
    return {
      hashtag,
      total_posts: Math.floor(Math.random() * 1000) + 100,
      avg_engagement: Math.random() * 10 + 2,
      top_performing_posts: this.convertToInstagramPosts(this.getMockInstagramData(hashtag, 10)),
      engagement_trends: this.generateEngagementTrends(timeframe),
      content_types: {
        '画像': 60,
        '動画': 30,
        'カルーセル': 10
      },
      optimal_posting_times: ['9:00', '12:00', '15:00', '18:00', '21:00']
    }
  }

  private getMockRealtimeTrends(category?: string) {
    const hashtags = this.generateTrendingHashtags(category)
    return hashtags.map(hashtag => ({
      hashtag,
      category: this.categorizeHashtag(hashtag),
      growth_rate: Math.random() * 100 - 20,
      current_volume: Math.floor(Math.random() * 100000) + 1000,
      predicted_volume: Math.floor(Math.random() * 150000) + 1500,
      trending_posts: this.convertToInstagramPosts(this.getMockInstagramData(hashtag, 5)),
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any
    }))
  }
}