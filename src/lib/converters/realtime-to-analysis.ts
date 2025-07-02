import { RealtimeSearchResult } from '@/lib/api/realtime-search'
import { ChannelSearchResult, ChannelAnalysis, BasicChannelInfo } from '@/types/channel'

/**
 * リアルタイム検索結果をChannelSearchResultに変換
 */
export function convertRealtimeToChannelSearchResult(result: RealtimeSearchResult): ChannelSearchResult {
  return {
    id: result.id,
    platform: result.platform as 'youtube' | 'tiktok',
    name: result.displayName,
    subscriberCount: result.followerCount,
    category: result.category || categorizeFromDescription(result.description || '', result.platform),
    verified: result.verified,
    description: result.description
  }
}

/**
 * リアルタイム検索結果から基本チャンネル情報を生成
 */
export function generateBasicChannelInfo(result: RealtimeSearchResult): BasicChannelInfo {
  return {
    id: result.id,
    platform: result.platform as 'youtube' | 'tiktok',
    channelId: result.id,
    channelName: result.displayName,
    subscriberCount: result.followerCount,
    videoCount: estimateVideoCount(result.followerCount, result.platform),
    createdDate: estimateCreationDate(result.followerCount, result.platform),
    category: result.category || categorizeFromDescription(result.description || '', result.platform),
    lastUpdated: new Date(),
    description: result.description,
    verified: result.verified
  }
}

/**
 * リアルタイム検索結果から模擬的な分析データを生成
 * 実際のAPIを呼び出すまでの暫定データ
 */
export function generateMockAnalysisData(result: RealtimeSearchResult): ChannelAnalysis {
  const basicInfo = generateBasicChannelInfo(result)
  const platform = result.platform as 'youtube' | 'tiktok'
  
  // プラットフォーム固有の推定値
  const platformMultipliers = {
    youtube: { engagement: 0.04, growth: 2.5, views: 15 },
    tiktok: { engagement: 0.08, growth: 5.2, views: 25 },
    x: { engagement: 0.02, growth: 1.8, views: 5 },
    instagram: { engagement: 0.06, growth: 3.1, views: 8 }
  }
  
  const multipliers = platformMultipliers[platform] || platformMultipliers.youtube
  
  // フォロワー数に基づく推定値計算
  const avgViews = Math.floor(result.followerCount * multipliers.views / 100)
  const engagementRate = multipliers.engagement * (1 + Math.random() * 0.5 - 0.25) // ±25%の変動
  const monthlyGrowthRate = multipliers.growth * (1 + Math.random() * 0.3 - 0.15) // ±15%の変動
  
  return {
    basicInfo,
    growthAnalysis: {
      current: {
        date: new Date(),
        subscriberCount: result.followerCount,
        videoCount: basicInfo.videoCount,
        avgViews,
        engagementRate
      },
      history: generateGrowthHistory(result.followerCount, 6),
      monthlyGrowthRate,
      weeklyGrowthRate: monthlyGrowthRate / 4,
      trend: monthlyGrowthRate > 0 ? 'up' : monthlyGrowthRate < 0 ? 'down' : 'stable',
      trendStrength: Math.min(Math.abs(monthlyGrowthRate) * 2, 10),
      rankingChange: Math.floor(Math.random() * 10) - 5,
      growthAcceleration: 1 + (Math.random() * 0.4 - 0.2),
      milestones: {
        nextSubscriberMilestone: getNextMilestone(result.followerCount),
        timeToMilestone: estimateTimeToMilestone(result.followerCount, monthlyGrowthRate),
        confidenceScore: Math.floor(70 + Math.random() * 25)
      }
    },
    competitorComparison: {
      mainChannel: basicInfo,
      competitors: generateMockCompetitors(platform, result.category),
      industryRanking: estimateIndustryRanking(result.followerCount, platform),
      totalChannelsInCategory: estimateCategorySize(result.category || 'その他'),
      competitiveAdvantages: generateCompetitiveAdvantages(result, avgViews, engagementRate),
      weaknesses: generateWeaknesses(result, avgViews, engagementRate),
      marketShare: calculateMarketShare(result.followerCount, platform)
    },
    monetization: generateMonetizationData(result, avgViews, platform),
    aiReport: generateAIReport(result, avgViews, engagementRate, monthlyGrowthRate),
    lastAnalyzed: new Date()
  }
}

/**
 * 説明文からカテゴリを推定
 */
function categorizeFromDescription(description: string, platform: string): string {
  const keywords = {
    'テクノロジー': ['tech', 'technology', 'ai', 'programming', 'coding', 'software', 'テクノロジー', 'プログラミング', 'AI', 'ソフトウェア'],
    'ゲーム': ['game', 'gaming', 'gamer', 'ゲーム', 'ゲーマー', 'プレイ'],
    'ライフスタイル': ['lifestyle', 'life', 'daily', 'vlog', 'ライフスタイル', '日常', 'ブログ'],
    'ファッション': ['fashion', 'style', 'beauty', 'makeup', 'ファッション', 'スタイル', '美容', 'メイク'],
    '教育': ['education', 'tutorial', 'how to', 'learn', '教育', 'チュートリアル', '学習', '講座'],
    'エンターテイメント': ['entertainment', 'comedy', 'funny', 'music', 'エンターテイメント', 'コメディ', '音楽', '面白い'],
    'スポーツ': ['sports', 'fitness', 'workout', 'athlete', 'スポーツ', 'フィットネス', '運動', 'アスリート'],
    '料理': ['cooking', 'recipe', 'food', 'chef', '料理', 'レシピ', '食べ物', 'シェフ']
  }
  
  const lowerDescription = description.toLowerCase()
  
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerDescription.includes(term.toLowerCase()))) {
      return category
    }
  }
  
  // プラットフォーム別デフォルトカテゴリ
  const platformDefaults = {
    youtube: 'エンターテイメント',
    tiktok: 'ダンス・音楽',
    x: 'ニュース・時事',
    instagram: 'ライフスタイル'
  }
  
  return platformDefaults[platform as keyof typeof platformDefaults] || 'その他'
}

/**
 * フォロワー数から動画数を推定
 */
function estimateVideoCount(followerCount: number, platform: string): number {
  const platformRatios = {
    youtube: 0.002, // 1000フォロワーあたり2本
    tiktok: 0.01,   // 1000フォロワーあたり10本
    x: 0,           // Xは動画数をカウントしない
    instagram: 0.005 // 1000フォロワーあたり5本
  }
  
  const ratio = platformRatios[platform as keyof typeof platformRatios] || 0.002
  return Math.max(1, Math.floor(followerCount * ratio))
}

/**
 * フォロワー数から作成日を推定
 */
function estimateCreationDate(followerCount: number, platform: string): Date {
  // フォロワー数が多いほど古いアカウントと推定
  const yearsOld = Math.min(Math.log(followerCount / 1000) / Math.log(10), 10)
  const date = new Date()
  date.setFullYear(date.getFullYear() - Math.max(0.1, yearsOld))
  return date
}

/**
 * 成長履歴を生成
 */
function generateGrowthHistory(currentFollowers: number, months: number) {
  const history = []
  const now = new Date()
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    // 過去から現在にかけて成長する傾向
    const growthFactor = (months - i) / months
    const followers = Math.floor(currentFollowers * (0.6 + 0.4 * growthFactor))
    const videos = estimateVideoCount(followers, 'youtube')
    
    history.push({
      date,
      subscriberCount: followers,
      videoCount: videos,
      avgViews: Math.floor(followers * (0.05 + Math.random() * 0.1)),
      engagementRate: 0.03 + Math.random() * 0.04
    })
  }
  
  return history
}

/**
 * 次のマイルストーンを計算
 */
function getNextMilestone(currentFollowers: number): number {
  const milestones = [1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000]
  return milestones.find(milestone => milestone > currentFollowers) || currentFollowers * 2
}

/**
 * マイルストーンまでの予想日数
 */
function estimateTimeToMilestone(currentFollowers: number, monthlyGrowthRate: number): number {
  const nextMilestone = getNextMilestone(currentFollowers)
  const growthNeeded = (nextMilestone - currentFollowers) / currentFollowers
  
  if (monthlyGrowthRate <= 0) return 365 * 10 // 成長率が0以下なら10年
  
  const monthsNeeded = growthNeeded / (monthlyGrowthRate / 100)
  return Math.min(Math.max(30, monthsNeeded * 30), 365 * 5) // 30日〜5年の範囲
}

/**
 * 模擬的な競合チャンネルを生成
 */
function generateMockCompetitors(platform: string, category?: string) {
  const competitorNames = [
    'Tech Review Hub', 'Gaming Central', 'Daily Lifestyle', 'Fashion Forward',
    'Learning Lab', 'Comedy Corner', 'Sports Zone', 'Cooking Master'
  ]
  
  return competitorNames.slice(0, 3).map((name, index) => ({
    id: `competitor_${index}`,
    name,
    platform: platform as 'youtube' | 'tiktok',
    subscriberCount: Math.floor(50000 + Math.random() * 500000),
    monthlyGrowthRate: Math.random() * 10 - 2,
    avgViews: Math.floor(10000 + Math.random() * 50000),
    engagementRate: 0.02 + Math.random() * 0.06,
    category: category || 'エンターテイメント',
    rankingPosition: index + 1,
    strengthScore: 60 + Math.random() * 30
  }))
}

/**
 * 業界ランキングを推定
 */
function estimateIndustryRanking(followerCount: number, platform: string): number {
  // フォロワー数に基づく大まかなランキング推定
  if (followerCount > 1000000) return Math.floor(Math.random() * 100) + 1
  if (followerCount > 100000) return Math.floor(Math.random() * 1000) + 100
  if (followerCount > 10000) return Math.floor(Math.random() * 5000) + 1000
  return Math.floor(Math.random() * 50000) + 5000
}

/**
 * カテゴリサイズを推定
 */
function estimateCategorySize(category: string): number {
  const categorySizes = {
    'テクノロジー': 50000,
    'ゲーム': 100000,
    'ライフスタイル': 200000,
    'ファッション': 80000,
    '教育': 60000,
    'エンターテイメント': 500000,
    'スポーツ': 70000,
    '料理': 40000
  }
  
  return categorySizes[category as keyof typeof categorySizes] || 30000
}

/**
 * 競合優位性を生成
 */
function generateCompetitiveAdvantages(result: RealtimeSearchResult, avgViews: number, engagementRate: number): string[] {
  const advantages = []
  
  if (result.verified) advantages.push('認証済みアカウント')
  if (engagementRate > 0.06) advantages.push('高いエンゲージメント率')
  if (result.followerCount > 100000) advantages.push('大規模なフォロワーベース')
  if (avgViews > result.followerCount * 0.1) advantages.push('優秀な視聴回数率')
  
  // デフォルト優位性
  if (advantages.length === 0) {
    advantages.push('一貫したコンテンツ品質', '活発なコミュニティ')
  }
  
  return advantages
}

/**
 * 弱点を生成
 */
function generateWeaknesses(result: RealtimeSearchResult, avgViews: number, engagementRate: number): string[] {
  const weaknesses = []
  
  if (!result.verified) weaknesses.push('アカウント未認証')
  if (engagementRate < 0.03) weaknesses.push('エンゲージメント率が低い')
  if (avgViews < result.followerCount * 0.05) weaknesses.push('視聴回数率が低い')
  
  // プラットフォーム固有の弱点
  if (result.platform === 'tiktok' && result.followerCount < 50000) {
    weaknesses.push('フォロワーベースが小規模')
  }
  
  return weaknesses.length > 0 ? weaknesses : ['改善の余地があるエンゲージメント戦略']
}

/**
 * マーケットシェアを計算
 */
function calculateMarketShare(followerCount: number, platform: string): number {
  // プラットフォーム別の総ユーザー数（推定）
  const totalUsers = {
    youtube: 2000000000,
    tiktok: 1000000000,
    x: 400000000,
    instagram: 1500000000
  }
  
  const total = totalUsers[platform as keyof typeof totalUsers] || 1000000000
  return (followerCount / total) * 100
}

/**
 * 収益化データを生成
 */
function generateMonetizationData(result: RealtimeSearchResult, avgViews: number, platform: string) {
  const isEligible = result.followerCount >= (platform === 'youtube' ? 1000 : 10000)
  
  const monthlyRevenue = isEligible ? {
    min: Math.floor(avgViews * 0.001 * 100), // 0.1円/view
    max: Math.floor(avgViews * 0.005 * 100), // 0.5円/view
    currency: 'JPY' as const
  } : { min: 0, max: 0, currency: 'JPY' as const }
  
  return {
    eligibilityStatus: {
      youtube: {
        subscribers: result.followerCount >= 1000,
        watchHours: result.followerCount >= 1000, // 推定
        eligible: result.followerCount >= 1000 && platform === 'youtube'
      },
      tiktok: {
        followers: result.followerCount >= 10000,
        views: avgViews >= 100000, // 推定
        eligible: result.followerCount >= 10000 && platform === 'tiktok'
      }
    },
    revenueEstimate: {
      monthly: monthlyRevenue,
      cpmRate: 100 + Math.random() * 200, // 100-300円
      sponsorshipValue: Math.floor(result.followerCount * 0.01) // フォロワー数 × 1円
    },
    projections: {
      threeMonths: monthlyRevenue.max * 3 * 1.1,
      sixMonths: monthlyRevenue.max * 6 * 1.25,
      oneYear: monthlyRevenue.max * 12 * 1.5
    },
    recommendations: {
      nextSteps: generateMonetizationRecommendations(result, isEligible),
      timeline: isEligible ? '1ヶ月' : '3-6ヶ月',
      priority: isEligible ? 'high' : 'medium'
    }
  }
}

/**
 * 収益化推奨事項を生成
 */
function generateMonetizationRecommendations(result: RealtimeSearchResult, isEligible: boolean): string[] {
  if (!isEligible) {
    return ['フォロワー数の増加', 'エンゲージメント向上', 'コンテンツの一貫性確保']
  }
  
  const recommendations = ['広告収益の最適化', 'スポンサーシップの検討']
  
  if (result.platform === 'youtube') {
    recommendations.push('メンバーシップ機能の活用', 'Super Chatの促進')
  } else if (result.platform === 'tiktok') {
    recommendations.push('ライブ配信の活用', 'ギフト機能の促進')
  }
  
  return recommendations
}

/**
 * AIレポートを生成
 */
function generateAIReport(result: RealtimeSearchResult, avgViews: number, engagementRate: number, monthlyGrowthRate: number) {
  const strengths = []
  const recommendations = []
  
  // 強みの分析
  if (result.verified) strengths.push('認証済みアカウントとしての信頼性')
  if (engagementRate > 0.05) strengths.push('優秀なエンゲージメント率')
  if (monthlyGrowthRate > 3) strengths.push('継続的な成長トレンド')
  
  // 推奨事項
  if (engagementRate < 0.04) {
    recommendations.push('エンゲージメント向上のためのコンテンツ戦略見直し')
  }
  if (monthlyGrowthRate < 2) {
    recommendations.push('成長加速のための投稿頻度・品質改善')
  }
  recommendations.push('クロスプラットフォーム戦略の検討')
  
  return {
    summary: `${result.displayName}は${result.platform}で${result.followerCount.toLocaleString()}フォロワーを持つ${result.verified ? '認証済み' : ''}アカウントです。エンゲージメント率${(engagementRate * 100).toFixed(1)}%、月間成長率${monthlyGrowthRate.toFixed(1)}%で運営されています。`,
    growthFactors: strengths.length > 0 ? strengths : ['一貫したコンテンツ投稿', 'フォロワーとの積極的な交流'],
    differentiationPoints: [`${result.platform}でのユニークなコンテンツスタイル`, '特定ニッチでの専門性'],
    monetizationStrategy: result.followerCount >= 10000 ? 
      'スポンサーシップと広告収益の両軸での収益化を推奨' : 
      'フォロワー増加を優先し、将来的な収益化基盤を構築',
    actionItems: recommendations.map((rec, index) => ({
      action: rec,
      priority: index === 0 ? 'high' : 'medium',
      timeline: '1-3ヶ月',
      expectedImpact: index === 0 ? 'エンゲージメント向上' : '長期的成長'
    })),
    competitiveInsights: `${result.platform}の同カテゴリ内での競争優位性を維持するため、コンテンツの差別化と継続的な改善が重要`,
    confidenceScore: 75 + Math.floor(Math.random() * 20),
    reportDate: new Date()
  }
}