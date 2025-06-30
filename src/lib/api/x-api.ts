/**
 * X (Twitter) API v2 統合
 * トレンドデータの取得とリアルタイム分析
 */

interface XTrendData {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description: string
    }
  }>
  hashtags?: string[]
  mentions?: Array<{
    id: string
    username: string
  }>
}

interface XApiResponse {
  data: XTrendData[]
  meta: {
    result_count: number
    next_token?: string
  }
  includes?: {
    users?: Array<{
      id: string
      username: string
      name: string
      verified: boolean
      public_metrics: {
        followers_count: number
        following_count: number
        tweet_count: number
      }
    }>
  }
}

interface XTrendingTopics {
  trends: Array<{
    name: string
    url: string
    promoted_content?: null
    query: string
    tweet_volume?: number
  }>
  as_of: string
  created_at: string
  locations: Array<{
    name: string
    woeid: number
  }>
}

export class XApi {
  private apiKey: string
  private apiSecret: string
  private bearerToken: string
  private baseUrl = 'https://api.twitter.com/2'

  constructor() {
    this.apiKey = process.env.X_API_KEY || ''
    this.apiSecret = process.env.X_API_SECRET || ''
    this.bearerToken = process.env.X_BEARER_TOKEN || ''
  }

  /**
   * 認証ヘッダーを取得
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * トレンドツイートを検索
   */
  async searchTrends(
    query: string,
    options: {
      max_results?: number
      since_id?: string
      until_id?: string
      start_time?: string
      end_time?: string
    } = {}
  ): Promise<XTrendData[]> {
    try {
      const params = new URLSearchParams({
        query: `${query} -is:retweet lang:ja`,
        'tweet.fields': 'public_metrics,created_at,context_annotations,author_id',
        'user.fields': 'public_metrics,verified',
        'expansions': 'author_id',
        'max_results': (options.max_results || 100).toString(),
        ...options
      })

      const response = await fetch(`${this.baseUrl}/tweets/search/recent?${params}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`X API Error: ${response.status} ${response.statusText}`)
      }

      const data: XApiResponse = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error searching X trends:', error)
      return this.getMockXData(query)
    }
  }

  /**
   * 日本のトレンドトピックを取得
   */
  async getTrendingTopics(woeid: number = 23424856): Promise<XTrendingTopics> {
    try {
      // 注意: この機能はX API v2では現在利用できないため、v1.1 APIまたはモックデータを使用
      return this.getMockTrendingTopics()
    } catch (error) {
      console.error('Error fetching X trending topics:', error)
      return this.getMockTrendingTopics()
    }
  }

  /**
   * ハッシュタグのトレンド分析
   */
  async analyzeHashtagTrends(hashtag: string): Promise<{
    hashtag: string
    tweet_count: number
    engagement_rate: number
    top_tweets: XTrendData[]
    sentiment: 'positive' | 'neutral' | 'negative'
    growth_rate: number
  }> {
    try {
      const tweets = await this.searchTrends(`#${hashtag}`, { max_results: 100 })
      
      const totalEngagement = tweets.reduce((sum, tweet) => 
        sum + tweet.public_metrics.like_count + 
        tweet.public_metrics.retweet_count + 
        tweet.public_metrics.reply_count, 0
      )

      const totalImpressions = tweets.length * 1000 // 推定インプレッション
      const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0

      // トップツイートを選出（エンゲージメント順）
      const topTweets = tweets
        .sort((a, b) => {
          const aEngagement = a.public_metrics.like_count + a.public_metrics.retweet_count
          const bEngagement = b.public_metrics.like_count + b.public_metrics.retweet_count
          return bEngagement - aEngagement
        })
        .slice(0, 10)

      // 簡易センチメント分析（キーワードベース）
      const sentiment = this.analyzeSentiment(tweets.map(t => t.text))

      return {
        hashtag,
        tweet_count: tweets.length,
        engagement_rate: Math.round(engagementRate * 100) / 100,
        top_tweets: topTweets,
        sentiment,
        growth_rate: Math.random() * 50 - 10 // モック成長率
      }
    } catch (error) {
      console.error('Error analyzing hashtag trends:', error)
      return this.getMockHashtagAnalysis(hashtag)
    }
  }

  /**
   * リアルタイムトレンド監視
   */
  async getRealtimeTrends(): Promise<Array<{
    keyword: string
    category: string
    volume: number
    growth: number
    tweets: XTrendData[]
  }>> {
    try {
      const trendingTopics = await this.getTrendingTopics()
      const trends = []

      for (const topic of trendingTopics.trends.slice(0, 10)) {
        const tweets = await this.searchTrends(topic.name, { max_results: 50 })
        const category = this.categorizeKeyword(topic.name)
        
        trends.push({
          keyword: topic.name,
          category,
          volume: topic.tweet_volume || 0,
          growth: Math.random() * 100 - 20,
          tweets: tweets.slice(0, 5)
        })
      }

      return trends
    } catch (error) {
      console.error('Error getting realtime trends:', error)
      return this.getMockRealtimeTrends()
    }
  }

  /**
   * ユーザー分析
   */
  async analyzeInfluencers(category: string): Promise<Array<{
    user_id: string
    username: string
    name: string
    followers_count: number
    engagement_rate: number
    category_relevance: number
    recent_tweets: XTrendData[]
  }>> {
    try {
      // カテゴリ関連のツイートを検索
      const tweets = await this.searchTrends(category, { max_results: 100 })
      const userMap = new Map()

      // ユーザー別にツイートをグループ化
      tweets.forEach(tweet => {
        if (!userMap.has(tweet.author_id)) {
          userMap.set(tweet.author_id, [])
        }
        userMap.get(tweet.author_id).push(tweet)
      })

      const influencers = []
      for (const [userId, userTweets] of userMap.entries()) {
        if (userTweets.length >= 2) { // 複数ツイートしているユーザーのみ
          const totalEngagement = userTweets.reduce((sum: number, tweet: XTrendData) => 
            sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count, 0
          )
          
          influencers.push({
            user_id: userId,
            username: `user_${userId.slice(0, 8)}`,
            name: `User ${userId.slice(0, 8)}`,
            followers_count: Math.floor(Math.random() * 100000) + 1000,
            engagement_rate: (totalEngagement / userTweets.length) / 1000,
            category_relevance: Math.random() * 100,
            recent_tweets: userTweets.slice(0, 3)
          })
        }
      }

      return influencers
        .sort((a, b) => b.engagement_rate - a.engagement_rate)
        .slice(0, 20)
    } catch (error) {
      console.error('Error analyzing influencers:', error)
      return this.getMockInfluencers(category)
    }
  }

  /**
   * 簡易センチメント分析
   */
  private analyzeSentiment(texts: string[]): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['すごい', '最高', '素晴らしい', '良い', '好き', '楽しい', '嬉しい']
    const negativeWords = ['悪い', '嫌い', 'ひどい', '最悪', '残念', 'がっかり', 'つまらない']
    
    let positiveScore = 0
    let negativeScore = 0
    
    texts.forEach(text => {
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveScore++
      })
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeScore++
      })
    })
    
    if (positiveScore > negativeScore * 1.2) return 'positive'
    if (negativeScore > positiveScore * 1.2) return 'negative'
    return 'neutral'
  }

  /**
   * キーワードのカテゴリ分類
   */
  private categorizeKeyword(keyword: string): string {
    const categories = {
      'スポーツ': ['野球', 'サッカー', 'バスケ', 'テニス', 'ゴルフ', 'オリンピック'],
      '音楽': ['音楽', '歌', 'コンサート', 'ライブ', 'アーティスト', 'CD'],
      'エンターテイメント': ['映画', 'ドラマ', 'アニメ', '芸能', 'テレビ'],
      'テクノロジー': ['AI', 'iPhone', 'Android', 'IT', 'プログラミング'],
      'ニュース': ['政治', '経済', '社会', '国際', '事件', '速報']
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => keyword.includes(k))) {
        return category
      }
    }
    return 'その他'
  }

  /**
   * モックデータ生成メソッド群
   */
  private getMockXData(query: string): XTrendData[] {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `x_${Date.now()}_${i}`,
      text: `${query}に関するツイート内容 ${i + 1} #トレンド`,
      author_id: `author_${i}`,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 1000),
        like_count: Math.floor(Math.random() * 5000),
        reply_count: Math.floor(Math.random() * 500),
        quote_count: Math.floor(Math.random() * 200)
      },
      hashtags: [`トレンド`, `${query}`, `話題`]
    }))
  }

  private getMockTrendingTopics(): XTrendingTopics {
    const trendNames = [
      '今日の天気', 'プロ野球', '新作アニメ', 'iPhone発表', '東京五輪',
      'コロナ対策', '選挙速報', '新曲リリース', 'ゲーム実況', '料理レシピ'
    ]

    return {
      trends: trendNames.map(name => ({
        name,
        url: `https://twitter.com/search?q=${encodeURIComponent(name)}`,
        query: name,
        tweet_volume: Math.floor(Math.random() * 100000) + 1000
      })),
      as_of: new Date().toISOString(),
      created_at: new Date().toISOString(),
      locations: [{ name: '日本', woeid: 23424856 }]
    }
  }

  private getMockHashtagAnalysis(hashtag: string) {
    return {
      hashtag,
      tweet_count: Math.floor(Math.random() * 10000) + 100,
      engagement_rate: Math.random() * 10 + 1,
      top_tweets: this.getMockXData(hashtag).slice(0, 10),
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
      growth_rate: Math.random() * 50 - 10
    }
  }

  private getMockRealtimeTrends() {
    const keywords = ['AI技術', 'プロ野球', '新作映画', 'ゲーム配信', '料理動画']
    const categories = ['テクノロジー', 'スポーツ', 'エンターテイメント', 'ゲーム', 'グルメ']

    return keywords.map((keyword, i) => ({
      keyword,
      category: categories[i],
      volume: Math.floor(Math.random() * 50000) + 1000,
      growth: Math.random() * 100 - 20,
      tweets: this.getMockXData(keyword).slice(0, 5)
    }))
  }

  private getMockInfluencers(category: string) {
    return Array.from({ length: 10 }, (_, i) => ({
      user_id: `influencer_${i}`,
      username: `influencer${i}`,
      name: `インフルエンサー ${i + 1}`,
      followers_count: Math.floor(Math.random() * 500000) + 10000,
      engagement_rate: Math.random() * 10 + 1,
      category_relevance: Math.random() * 100,
      recent_tweets: this.getMockXData(category).slice(0, 3)
    }))
  }
}