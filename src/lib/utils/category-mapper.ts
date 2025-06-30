/**
 * カテゴリ名の日本語化とローカライゼーション
 * YouTube、TikTok、X、Instagramの全カテゴリに対応
 */

export interface CategoryMapping {
  en: string
  jp: string
  icon: string
  color: string
  description: string
  platforms: string[]
}

// 包括的なカテゴリマッピング
export const categoryMappings: Record<string, CategoryMapping> = {
  // 音楽・エンターテイメント
  'Music': {
    en: 'Music',
    jp: '音楽',
    icon: '🎵',
    color: '#FF6B6B',
    description: '音楽、楽曲、アーティスト',
    platforms: ['YouTube', 'TikTok', 'X', 'Instagram']
  },
  'Entertainment': {
    en: 'Entertainment',
    jp: 'エンターテイメント',
    icon: '🎭',
    color: '#4ECDC4',
    description: 'エンターテイメント、芸能',
    platforms: ['YouTube', 'TikTok', 'X', 'Instagram']
  },
  'Comedy': {
    en: 'Comedy',
    jp: 'コメディ',
    icon: '😂',
    color: '#FFE66D',
    description: 'コメディ、お笑い、ユーモア',
    platforms: ['YouTube', 'TikTok', 'X', 'Instagram']
  },
  'Dance': {
    en: 'Dance',
    jp: 'ダンス',
    icon: '💃',
    color: '#FF8B94',
    description: 'ダンス、振り付け、パフォーマンス',
    platforms: ['TikTok', 'Instagram', 'YouTube']
  },

  // スポーツ・フィットネス
  'Sports': {
    en: 'Sports',
    jp: 'スポーツ',
    icon: '⚽',
    color: '#A8E6CF',
    description: 'スポーツ、競技、アスリート',
    platforms: ['YouTube', 'TikTok', 'X', 'Instagram']
  },
  'Fitness': {
    en: 'Fitness',
    jp: 'フィットネス',
    icon: '💪',
    color: '#B4E7CE',
    description: 'フィットネス、筋トレ、ヨガ',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Health': {
    en: 'Health',
    jp: 'ヘルス',
    icon: '🏥',
    color: '#C7CEEA',
    description: '健康、医療、ウェルネス',
    platforms: ['YouTube', 'X', 'Instagram']
  },

  // ゲーミング・テクノロジー
  'Gaming': {
    en: 'Gaming',
    jp: 'ゲーム',
    icon: '🎮',
    color: '#8B5CF6',
    description: 'ゲーム、eSports、ゲーム実況',
    platforms: ['YouTube', 'TikTok', 'X']
  },
  'Technology': {
    en: 'Technology',
    jp: 'テクノロジー',
    icon: '💻',
    color: '#06B6D4',
    description: 'テクノロジー、IT、ガジェット',
    platforms: ['YouTube', 'X', 'Instagram']
  },
  'Science': {
    en: 'Science',
    jp: 'サイエンス',
    icon: '🔬',
    description: '科学、研究、実験',
    color: '#10B981',
    platforms: ['YouTube', 'X']
  },

  // ライフスタイル
  'Lifestyle': {
    en: 'Lifestyle',
    jp: 'ライフスタイル',
    icon: '🌟',
    color: '#F59E0B',
    description: 'ライフスタイル、日常、趣味',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Beauty': {
    en: 'Beauty',
    jp: '美容',
    icon: '💄',
    color: '#EC4899',
    description: '美容、メイク、スキンケア',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Fashion': {
    en: 'Fashion',
    jp: 'ファッション',
    icon: '👗',
    color: '#EF4444',
    description: 'ファッション、スタイル、トレンド',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },

  // フード・料理
  'Food': {
    en: 'Food',
    jp: 'グルメ',
    icon: '🍕',
    color: '#F97316',
    description: 'グルメ、料理、レシピ',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Cooking': {
    en: 'Cooking',
    jp: '料理',
    icon: '🍳',
    color: '#FB923C',
    description: '料理、クッキング、レシピ',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },

  // 教育・学習
  'Education': {
    en: 'Education',
    jp: '教育',
    icon: '📚',
    color: '#3B82F6',
    description: '教育、学習、勉強法',
    platforms: ['YouTube', 'X']
  },
  'Tutorial': {
    en: 'Tutorial',
    jp: 'チュートリアル',
    icon: '📖',
    color: '#6366F1',
    description: 'チュートリアル、解説、ハウツー',
    platforms: ['YouTube', 'TikTok']
  },

  // 旅行・アドベンチャー
  'Travel': {
    en: 'Travel',
    jp: '旅行',
    icon: '✈️',
    color: '#14B8A6',
    description: '旅行、観光、冒険',
    platforms: ['YouTube', 'Instagram', 'TikTok']
  },
  'Adventure': {
    en: 'Adventure',
    jp: 'アドベンチャー',
    icon: '🏔️',
    color: '#059669',
    description: 'アドベンチャー、冒険、アウトドア',
    platforms: ['YouTube', 'Instagram']
  },

  // アート・クリエイティブ
  'Art': {
    en: 'Art',
    jp: 'アート',
    icon: '🎨',
    color: '#8B5A2B',
    description: 'アート、美術、クリエイティブ',
    platforms: ['YouTube', 'Instagram', 'TikTok']
  },
  'Photography': {
    en: 'Photography',
    jp: '写真',
    icon: '📸',
    color: '#6B7280',
    description: '写真、撮影、フォトグラフィー',
    platforms: ['Instagram', 'YouTube']
  },

  // ニュース・政治
  'News': {
    en: 'News',
    jp: 'ニュース',
    icon: '📰',
    color: '#374151',
    description: 'ニュース、時事、報道',
    platforms: ['YouTube', 'X']
  },
  'Politics': {
    en: 'Politics',
    jp: '政治',
    icon: '🏛️',
    color: '#4B5563',
    description: '政治、政策、社会問題',
    platforms: ['X', 'YouTube']
  },

  // ビジネス・金融
  'Business': {
    en: 'Business',
    jp: 'ビジネス',
    icon: '💼',
    color: '#1F2937',
    description: 'ビジネス、起業、経営',
    platforms: ['YouTube', 'X']
  },
  'Finance': {
    en: 'Finance',
    jp: '金融',
    icon: '💰',
    color: '#059669',
    description: '金融、投資、経済',
    platforms: ['YouTube', 'X']
  },

  // 動物・ペット
  'Animals': {
    en: 'Animals',
    jp: '動物',
    icon: '🐕',
    color: '#92400E',
    description: '動物、ペット、生き物',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Pets': {
    en: 'Pets',
    jp: 'ペット',
    icon: '🐱',
    color: '#B45309',
    description: 'ペット、犬、猫',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },

  // 自動車・乗り物
  'Automotive': {
    en: 'Automotive',
    jp: '自動車',
    icon: '🚗',
    color: '#1E40AF',
    description: '自動車、車、バイク',
    platforms: ['YouTube', 'Instagram']
  },
  'Transportation': {
    en: 'Transportation',
    jp: '交通',
    icon: '🚇',
    color: '#1D4ED8',
    description: '交通、電車、飛行機',
    platforms: ['YouTube', 'X']
  },

  // その他
  'DIY': {
    en: 'DIY',
    jp: 'DIY',
    icon: '🔨',
    color: '#7C2D12',
    description: 'DIY、手作り、クラフト',
    platforms: ['YouTube', 'TikTok', 'Instagram']
  },
  'Reviews': {
    en: 'Reviews',
    jp: 'レビュー',
    icon: '⭐',
    color: '#DC2626',
    description: 'レビュー、評価、商品紹介',
    platforms: ['YouTube']
  },
  'Vlogs': {
    en: 'Vlogs',
    jp: 'ブログ',
    icon: '📹',
    color: '#7C3AED',
    description: 'ブログ、日常、ライフログ',
    platforms: ['YouTube', 'Instagram']
  }
}

/**
 * 英語のカテゴリ名を日本語に変換
 */
export function getCategoryJapanese(category: string): string {
  const mapping = categoryMappings[category]
  return mapping?.jp || category
}

/**
 * 日本語のカテゴリ名を英語に変換
 */
export function getCategoryEnglish(categoryJp: string): string {
  const entry = Object.entries(categoryMappings).find(([_, mapping]) => mapping.jp === categoryJp)
  return entry?.[0] || categoryJp
}

/**
 * カテゴリのアイコンを取得
 */
export function getCategoryIcon(category: string): string {
  const mapping = categoryMappings[category]
  return mapping?.icon || '📊'
}

/**
 * カテゴリの色を取得
 */
export function getCategoryColor(category: string): string {
  const mapping = categoryMappings[category]
  return mapping?.color || '#8B5CF6'
}

/**
 * カテゴリの説明を取得
 */
export function getCategoryDescription(category: string): string {
  const mapping = categoryMappings[category]
  return mapping?.description || ''
}

/**
 * プラットフォーム別のカテゴリリストを取得
 */
export function getCategoriesByPlatform(platform: string): CategoryMapping[] {
  return Object.values(categoryMappings).filter(mapping => 
    mapping.platforms.includes(platform)
  )
}

/**
 * 全カテゴリの日本語リストを取得
 */
export function getAllCategoriesJapanese(): string[] {
  return Object.values(categoryMappings).map(mapping => mapping.jp)
}

/**
 * 全カテゴリの英語リストを取得
 */
export function getAllCategoriesEnglish(): string[] {
  return Object.keys(categoryMappings)
}

/**
 * カテゴリの完全な情報を取得
 */
export function getCategoryInfo(category: string): CategoryMapping | null {
  return categoryMappings[category] || null
}

/**
 * カテゴリを検索（日本語・英語両対応）
 */
export function searchCategories(query: string): CategoryMapping[] {
  const lowerQuery = query.toLowerCase()
  return Object.entries(categoryMappings)
    .filter(([key, mapping]) => 
      key.toLowerCase().includes(lowerQuery) ||
      mapping.jp.includes(query) ||
      mapping.description.includes(query)
    )
    .map(([_, mapping]) => mapping)
}

/**
 * カテゴリをソート（日本語順）
 */
export function sortCategoriesJapanese(categories: string[]): string[] {
  return categories.sort((a, b) => {
    const aJp = getCategoryJapanese(a)
    const bJp = getCategoryJapanese(b)
    return aJp.localeCompare(bJp, 'ja')
  })
}

/**
 * トレンドデータにカテゴリ情報を追加
 */
export function enrichTrendWithCategory<T extends { category?: string }>(trend: T): T & {
  categoryJp?: string
  categoryIcon?: string
  categoryColor?: string
} {
  if (!trend.category) return trend
  
  const categoryInfo = getCategoryInfo(trend.category)
  return {
    ...trend,
    categoryJp: categoryInfo?.jp,
    categoryIcon: categoryInfo?.icon,
    categoryColor: categoryInfo?.color
  }
}

/**
 * バルクでトレンドデータを変換
 */
export function enrichTrendsWithCategories<T extends { category?: string }>(trends: T[]): Array<T & {
  categoryJp?: string
  categoryIcon?: string
  categoryColor?: string
}> {
  return trends.map(enrichTrendWithCategory)
}