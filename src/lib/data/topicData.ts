export interface TopicData {
  id: string
  name: string
  category: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  growth: number
  platforms: {
    youtube: number
    tiktok: number
    x: number
    instagram: number
  }
  engagement: {
    avgLikes: number
    avgComments: number
    avgShares: number
    engagementRate: number
  }
  keywords: string[]
  description: string
}

export interface PlatformMetrics {
  platform: 'youtube' | 'tiktok' | 'x' | 'instagram'
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagementRate: number
  topCategories: Array<{
    name: string
    count: number
    percentage: number
  }>
  growthRate: number
  peakHours: Array<{
    hour: number
    activity: number
  }>
  demographics: {
    ageGroups: Array<{
      range: string
      percentage: number
    }>
    genders: Array<{
      type: string
      percentage: number
    }>
  }
}

// Sample topic data for each category
export const topicDataByCategory: Record<string, TopicData[]> = {
  '音楽': [
    {
      id: 'music-jpop',
      name: 'J-POP',
      category: '音楽',
      count: 450,
      percentage: 36.0,
      trend: 'up',
      growth: 15.2,
      platforms: { youtube: 180, tiktok: 150, x: 60, instagram: 60 },
      engagement: { avgLikes: 12500, avgComments: 450, avgShares: 280, engagementRate: 8.5 },
      keywords: ['新曲', 'アーティスト', 'ライブ', 'カバー'],
      description: '日本のポップミュージック関連のコンテンツ'
    },
    {
      id: 'music-kpop',
      name: 'K-POP',
      category: '音楽',
      count: 380,
      percentage: 30.4,
      trend: 'up',
      growth: 22.8,
      platforms: { youtube: 120, tiktok: 180, x: 40, instagram: 40 },
      engagement: { avgLikes: 18500, avgComments: 650, avgShares: 420, engagementRate: 12.3 },
      keywords: ['BTS', 'BLACKPINK', 'ダンス', 'チャレンジ'],
      description: '韓国ポップミュージック関連のコンテンツ'
    },
    {
      id: 'music-indie',
      name: 'インディー',
      category: '音楽',
      count: 210,
      percentage: 16.8,
      trend: 'stable',
      growth: 5.1,
      platforms: { youtube: 90, tiktok: 60, x: 35, instagram: 25 },
      engagement: { avgLikes: 3200, avgComments: 180, avgShares: 95, engagementRate: 6.2 },
      keywords: ['インディーズ', '新人', 'アコースティック'],
      description: 'インディペンデント音楽関連のコンテンツ'
    },
    {
      id: 'music-classical',
      name: 'クラシック',
      category: '音楽',
      count: 120,
      percentage: 9.6,
      trend: 'stable',
      growth: 2.3,
      platforms: { youtube: 70, tiktok: 15, x: 20, instagram: 15 },
      engagement: { avgLikes: 1800, avgComments: 120, avgShares: 45, engagementRate: 4.1 },
      keywords: ['オーケストラ', 'ピアノ', 'バイオリン'],
      description: 'クラシック音楽関連のコンテンツ'
    },
    {
      id: 'music-electronic',
      name: 'エレクトロニック',
      category: '音楽',
      count: 90,
      percentage: 7.2,
      trend: 'up',
      growth: 18.5,
      platforms: { youtube: 35, tiktok: 40, x: 10, instagram: 5 },
      engagement: { avgLikes: 5200, avgComments: 220, avgShares: 150, engagementRate: 7.8 },
      keywords: ['EDM', 'リミックス', 'DJ'],
      description: 'エレクトロニック音楽関連のコンテンツ'
    }
  ],
  'ゲーム': [
    {
      id: 'game-mobile',
      name: 'モバイルゲーム',
      category: 'ゲーム',
      count: 520,
      percentage: 38.5,
      trend: 'up',
      growth: 25.3,
      platforms: { youtube: 180, tiktok: 200, x: 80, instagram: 60 },
      engagement: { avgLikes: 15200, avgComments: 580, avgShares: 320, engagementRate: 9.2 },
      keywords: ['スマホゲーム', 'ガチャ', '攻略', 'レビュー'],
      description: 'スマートフォン向けゲーム関連のコンテンツ'
    },
    {
      id: 'game-console',
      name: 'コンソールゲーム',
      category: 'ゲーム',
      count: 380,
      percentage: 28.1,
      trend: 'stable',
      growth: 8.7,
      platforms: { youtube: 220, tiktok: 80, x: 50, instagram: 30 },
      engagement: { avgLikes: 12800, avgComments: 420, avgShares: 180, engagementRate: 7.5 },
      keywords: ['PS5', 'Nintendo Switch', 'Xbox', '実況'],
      description: 'コンソールゲーム関連のコンテンツ'
    },
    {
      id: 'game-pc',
      name: 'PCゲーム',
      category: 'ゲーム',
      count: 280,
      percentage: 20.7,
      trend: 'up',
      growth: 12.1,
      platforms: { youtube: 180, tiktok: 40, x: 35, instagram: 25 },
      engagement: { avgLikes: 8500, avgComments: 380, avgShares: 120, engagementRate: 6.8 },
      keywords: ['Steam', 'eSports', 'ストリーミング'],
      description: 'PC向けゲーム関連のコンテンツ'
    },
    {
      id: 'game-retro',
      name: 'レトロゲーム',
      category: 'ゲーム',
      count: 120,
      percentage: 8.9,
      trend: 'stable',
      growth: 3.2,
      platforms: { youtube: 70, tiktok: 20, x: 20, instagram: 10 },
      engagement: { avgLikes: 3200, avgComments: 150, avgShares: 65, engagementRate: 5.1 },
      keywords: ['レトロ', 'ファミコン', 'アーケード'],
      description: 'レトロゲーム関連のコンテンツ'
    },
    {
      id: 'game-vr',
      name: 'VR/ARゲーム',
      category: 'ゲーム',
      count: 50,
      percentage: 3.7,
      trend: 'up',
      growth: 35.8,
      platforms: { youtube: 30, tiktok: 15, x: 3, instagram: 2 },
      engagement: { avgLikes: 6800, avgComments: 280, avgShares: 180, engagementRate: 11.2 },
      keywords: ['VR', 'メタバース', '体験'],
      description: 'VR/AR技術を使用したゲーム関連のコンテンツ'
    }
  ],
  'ライフスタイル': [
    {
      id: 'lifestyle-health',
      name: '健康・フィットネス',
      category: 'ライフスタイル',
      count: 420,
      percentage: 35.3,
      trend: 'up',
      growth: 18.9,
      platforms: { youtube: 150, tiktok: 180, x: 45, instagram: 45 },
      engagement: { avgLikes: 8500, avgComments: 320, avgShares: 280, engagementRate: 7.8 },
      keywords: ['筋トレ', 'ダイエット', 'ヨガ', '健康'],
      description: '健康とフィットネス関連のライフスタイルコンテンツ'
    },
    {
      id: 'lifestyle-home',
      name: 'ホーム・インテリア',
      category: 'ライフスタイル',
      count: 320,
      percentage: 26.9,
      trend: 'stable',
      growth: 7.2,
      platforms: { youtube: 100, tiktok: 120, x: 50, instagram: 50 },
      engagement: { avgLikes: 6200, avgComments: 180, avgShares: 150, engagementRate: 6.1 },
      keywords: ['インテリア', 'DIY', '掃除', '収納'],
      description: 'ホームデコレーションとインテリア関連のコンテンツ'
    },
    {
      id: 'lifestyle-travel',
      name: '旅行・観光',
      category: 'ライフスタイル',
      count: 280,
      percentage: 23.5,
      trend: 'up',
      growth: 22.1,
      platforms: { youtube: 120, tiktok: 80, x: 40, instagram: 40 },
      engagement: { avgLikes: 12500, avgComments: 450, avgShares: 380, engagementRate: 9.5 },
      keywords: ['旅行', '観光地', 'グルメ', 'ホテル'],
      description: '旅行と観光関連のライフスタイルコンテンツ'
    },
    {
      id: 'lifestyle-mindfulness',
      name: 'マインドフルネス',
      category: 'ライフスタイル',
      count: 120,
      percentage: 10.1,
      trend: 'up',
      growth: 28.5,
      platforms: { youtube: 60, tiktok: 35, x: 15, instagram: 10 },
      engagement: { avgLikes: 3800, avgComments: 220, avgShares: 95, engagementRate: 8.2 },
      keywords: ['瞑想', 'マインドフルネス', 'ウェルネス'],
      description: 'マインドフルネスとメンタルヘルス関連のコンテンツ'
    },
    {
      id: 'lifestyle-sustainability',
      name: '持続可能性',
      category: 'ライフスタイル',
      count: 50,
      percentage: 4.2,
      trend: 'up',
      growth: 42.3,
      platforms: { youtube: 25, tiktok: 15, x: 7, instagram: 3 },
      engagement: { avgLikes: 2200, avgComments: 180, avgShares: 120, engagementRate: 12.8 },
      keywords: ['エコ', 'サステナブル', '環境'],
      description: '持続可能性と環境に配慮したライフスタイルコンテンツ'
    }
  ]
  // 他のカテゴリも同様に追加可能
}

// Platform-specific metrics
export const platformMetrics: Record<string, PlatformMetrics> = {
  youtube: {
    platform: 'youtube',
    totalPosts: 12500,
    totalViews: 45800000,
    totalLikes: 2180000,
    totalComments: 156000,
    totalShares: 89000,
    avgEngagementRate: 6.8,
    topCategories: [
      { name: 'エンタメ', count: 3200, percentage: 25.6 },
      { name: 'テクノロジー', count: 2800, percentage: 22.4 },
      { name: 'ゲーム', count: 2150, percentage: 17.2 },
      { name: '音楽', count: 1890, percentage: 15.1 },
      { name: 'ライフスタイル', count: 1460, percentage: 11.7 }
    ],
    growthRate: 12.3,
    peakHours: [
      { hour: 19, activity: 100 },
      { hour: 20, activity: 95 },
      { hour: 21, activity: 88 },
      { hour: 18, activity: 75 }
    ],
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 28.5 },
        { range: '25-34', percentage: 35.2 },
        { range: '35-44', percentage: 22.1 },
        { range: '45+', percentage: 14.2 }
      ],
      genders: [
        { type: '男性', percentage: 58.3 },
        { type: '女性', percentage: 41.7 }
      ]
    }
  },
  tiktok: {
    platform: 'tiktok',
    totalPosts: 18600,
    totalViews: 89200000,
    totalLikes: 4150000,
    totalComments: 892000,
    totalShares: 1240000,
    avgEngagementRate: 12.5,
    topCategories: [
      { name: 'ファッション', count: 4850, percentage: 26.1 },
      { name: 'ダンス・音楽', count: 4120, percentage: 22.2 },
      { name: 'コメディ', count: 3580, percentage: 19.2 },
      { name: 'ライフスタイル', count: 2890, percentage: 15.5 },
      { name: 'フード', count: 2160, percentage: 11.6 }
    ],
    growthRate: 28.7,
    peakHours: [
      { hour: 20, activity: 100 },
      { hour: 21, activity: 98 },
      { hour: 19, activity: 85 },
      { hour: 22, activity: 82 }
    ],
    demographics: {
      ageGroups: [
        { range: '16-24', percentage: 45.8 },
        { range: '25-34', percentage: 28.9 },
        { range: '35-44', percentage: 15.2 },
        { range: '45+', percentage: 10.1 }
      ],
      genders: [
        { type: '女性', percentage: 62.8 },
        { type: '男性', percentage: 37.2 }
      ]
    }
  },
  x: {
    platform: 'x',
    totalPosts: 8200,
    totalViews: 12500000,
    totalLikes: 580000,
    totalComments: 125000,
    totalShares: 280000,
    avgEngagementRate: 4.2,
    topCategories: [
      { name: 'ニュース', count: 2150, percentage: 26.2 },
      { name: 'テクノロジー', count: 1890, percentage: 23.0 },
      { name: 'スポーツ', count: 1520, percentage: 18.5 },
      { name: '政治', count: 1180, percentage: 14.4 },
      { name: 'ビジネス', count: 1010, percentage: 12.3 }
    ],
    growthRate: 5.8,
    peakHours: [
      { hour: 12, activity: 100 },
      { hour: 18, activity: 88 },
      { hour: 8, activity: 75 },
      { hour: 20, activity: 72 }
    ],
    demographics: {
      ageGroups: [
        { range: '25-34', percentage: 32.5 },
        { range: '35-44', percentage: 28.9 },
        { range: '18-24', percentage: 22.1 },
        { range: '45+', percentage: 16.5 }
      ],
      genders: [
        { type: '男性', percentage: 65.2 },
        { type: '女性', percentage: 34.8 }
      ]
    }
  },
  instagram: {
    platform: 'instagram',
    totalPosts: 15800,
    totalViews: 32100000,
    totalLikes: 1890000,
    totalComments: 285000,
    totalShares: 156000,
    avgEngagementRate: 8.9,
    topCategories: [
      { name: 'ファッション', count: 3950, percentage: 25.0 },
      { name: 'ライフスタイル', count: 3480, percentage: 22.0 },
      { name: '美容', count: 2840, percentage: 18.0 },
      { name: 'フード', count: 2530, percentage: 16.0 },
      { name: 'アート', count: 1580, percentage: 10.0 }
    ],
    growthRate: 15.2,
    peakHours: [
      { hour: 19, activity: 100 },
      { hour: 20, activity: 92 },
      { hour: 12, activity: 78 },
      { hour: 21, activity: 75 }
    ],
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 38.2 },
        { range: '25-34', percentage: 31.5 },
        { range: '35-44', percentage: 18.8 },
        { range: '45+', percentage: 11.5 }
      ],
      genders: [
        { type: '女性', percentage: 68.5 },
        { type: '男性', percentage: 31.5 }
      ]
    }
  }
}