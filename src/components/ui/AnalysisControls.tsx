'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Youtube,
  Music2,
  Camera,
  Monitor,
  ChevronDown,
  Filter,
  List,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Users,
  Zap,
  Info
} from 'lucide-react'
import { platformMetrics, topicDataByCategory } from '@/lib/data/topicData'

interface AnalysisControlsProps {
  selectedPlatform: string
  selectedCategory: string
  onPlatformChange: (platform: string) => void
  onCategoryChange: (category: string) => void
  availableCategories?: string[]
}

const platforms = [
  { id: 'all', label: '全プラットフォーム', icon: Filter, color: '#6366f1', gradient: 'from-indigo-500 to-purple-600' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000', gradient: 'from-red-500 to-red-600' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000', gradient: 'from-gray-800 to-black' },
  { id: 'x', label: 'X (Twitter)', icon: Monitor, color: '#1DA1F2', gradient: 'from-blue-400 to-blue-600' },
  { id: 'instagram', label: 'Instagram', icon: Camera, color: '#E4405F', gradient: 'from-pink-500 to-purple-600' }
]

const categories = [
  '全カテゴリ', '音楽', 'ゲーム', 'ライフスタイル', 'テクノロジー',
  'ファッション', 'フード', 'スポーツ', 'エンタメ', 'ニュース',
  '教育', '旅行', '美容', 'ペット', 'アート', '健康'
]

export function AnalysisControls({
  selectedPlatform,
  selectedCategory,
  onPlatformChange,
  onCategoryChange,
  availableCategories = categories
}: AnalysisControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null)

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 neo-gradient rounded-xl">
          <Filter className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            分析コントロール
          </h3>
          <p className="text-sm text-gray-500">
            フィルター設定を調整
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Platform Selector */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            プラットフォーム選択
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {platforms.map((platform) => {
              const Icon = platform.icon
              const isSelected = selectedPlatform === platform.id

              return (
                <motion.button
                  key={platform.id}
                  onClick={() => onPlatformChange(platform.id)}
                  className={`
                    relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-r ' + platform.gradient + ' text-white shadow-lg transform scale-105' 
                      : 'neo-card hover:shadow-md hover:scale-102'
                    }
                  `}
                  whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-700'
                    }
                  `}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                      {platform.label}
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <List className="w-4 h-4" />
            カテゴリフィルター
          </h4>
          
          <div className="relative">
            <motion.button
              onClick={() => setIsDropdownOpen(isDropdownOpen === 'category' ? null : 'category')}
              className="w-full neo-card p-3 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedCategory || '全カテゴリ'}
              </span>
              <motion.div
                animate={{ rotate: isDropdownOpen === 'category' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto"
                >
                  {availableCategories.map((category, index) => (
                    <motion.button
                      key={category}
                      onClick={() => {
                        onCategoryChange(category === '全カテゴリ' ? '' : category)
                        setIsDropdownOpen(null)
                      }}
                      className={`
                        w-full px-4 py-3 text-left text-sm transition-colors
                        ${selectedCategory === (category === '全カテゴリ' ? '' : category)
                          ? 'bg-gradient-to-r from-neo-purple/20 to-neo-pink/20 text-neo-purple font-medium'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }
                        ${index === 0 ? 'rounded-t-xl' : ''}
                        ${index === availableCategories.length - 1 ? 'rounded-b-xl' : ''}
                      `}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Platform Details */}
        {selectedPlatform && selectedPlatform !== 'all' && platformMetrics[selectedPlatform] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-xl border border-neo-light/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-neo-purple" />
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedPlatformData?.label} 詳細分析
              </h5>
            </div>
            
            {(() => {
              const metrics = platformMetrics[selectedPlatform]
              return (
                <div className="space-y-3">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">総ビュー</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {metrics.totalViews.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">総いいね</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {metrics.totalLikes.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">総コメント</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {metrics.totalComments.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">エンゲージ率</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {metrics.avgEngagementRate}%
                      </div>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-500" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">人口統計</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">主要年齢層:</span>
                        <span className="font-medium ml-1">
                          {metrics.demographics.ageGroups[0]?.range} ({metrics.demographics.ageGroups[0]?.percentage}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">性別比:</span>
                        <span className="font-medium ml-1">
                          {metrics.demographics.genders[0]?.type} {metrics.demographics.genders[0]?.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">ピーク時間</span>
                    </div>
                    <div className="flex gap-1">
                      {metrics.peakHours.slice(0, 3).map((hour, index) => (
                        <div key={index} className="flex-1 text-center p-1 bg-orange-100 dark:bg-orange-900/30 rounded text-xs">
                          <div className="font-medium">{hour.hour}時</div>
                          <div className="text-gray-600 dark:text-gray-400">{hour.activity}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">トップカテゴリ</span>
                    <div className="space-y-1">
                      {metrics.topCategories.slice(0, 3).map((cat, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-neo-purple to-neo-pink"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                            <span className="font-medium">{cat.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}

        {/* Topic Breakdown */}
        {selectedCategory && topicDataByCategory[selectedCategory] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-xl border border-neo-light/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <List className="w-4 h-4 text-neo-pink" />
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCategory} トピック内訳
              </h5>
            </div>
            
            <div className="space-y-2">
              {topicDataByCategory[selectedCategory].slice(0, 5).map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {topic.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {topic.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {topic.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                        {topic.trend === 'stable' && <div className="w-3 h-0.5 bg-gray-400 rounded" />}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {topic.percentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.count.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Top Keywords */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                関連キーワード
              </span>
              <div className="flex flex-wrap gap-1">
                {topicDataByCategory[selectedCategory][0]?.keywords.slice(0, 4).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neo-purple/10 text-neo-purple text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Selection Summary */}
        <div className="p-4 bg-gradient-to-r from-neo-light/5 to-neo-dark/5 rounded-xl border border-neo-light/20">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            現在の選択
          </h5>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              {selectedPlatformData && (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedPlatformData.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedPlatformData.label}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <List className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {selectedCategory || '全カテゴリ'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => {
              onPlatformChange('all')
              onCategoryChange('')
            }}
            className="flex-1 neo-button py-2 px-3 rounded-lg text-xs font-medium hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            リセット
          </motion.button>
          <motion.button
            onClick={() => setIsDropdownOpen(null)}
            className="flex-1 neo-gradient py-2 px-3 rounded-lg text-xs font-medium text-white hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            適用
          </motion.button>
        </div>
      </div>
    </div>
  )
}