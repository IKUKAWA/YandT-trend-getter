'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Platform } from '@prisma/client'
import { Calendar, Filter, X, ChevronDown, Search, RotateCcw, Sparkles } from 'lucide-react'

interface FilterState {
  platforms: Platform[]
  categories: string[]
  dateRange: {
    start: string
    end: string
  }
  viewRange: {
    min: number
    max: number
  }
  engagementRange: {
    min: number
    max: number
  }
  sortBy: 'views' | 'likes' | 'comments' | 'createdAt' | 'engagement'
  sortOrder: 'asc' | 'desc'
  searchQuery: string
  tags: string[]
  contentType: 'all' | 'viral' | 'trending' | 'emerging'
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  availableCategories?: string[]
  availableTags?: string[]
}

const defaultFilters: FilterState = {
  platforms: [],
  categories: [],
  dateRange: {
    start: '',
    end: '',
  },
  viewRange: {
    min: 0,
    max: 10000000,
  },
  engagementRange: {
    min: 0,
    max: 100,
  },
  sortBy: 'views',
  sortOrder: 'desc',
  searchQuery: '',
  tags: [],
  contentType: 'all',
}

export function FilterPanel({
  isOpen,
  onClose,
  onFiltersChange,
  initialFilters = {},
  availableCategories = [],
  availableTags = [],
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  })
  const [activeSection, setActiveSection] = useState<string | null>('platforms')
  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    tags: '',
  })

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform]
    updateFilter('platforms', newPlatforms)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilter('categories', newCategories)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    updateFilter('tags', newTags)
  }

  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(searchTerms.categories.toLowerCase())
  )

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerms.tags.toLowerCase())
  )

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.platforms.length > 0) count++
    if (filters.categories.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.viewRange.min > 0 || filters.viewRange.max < 10000000) count++
    if (filters.engagementRange.min > 0 || filters.engagementRange.max < 100) count++
    if (filters.searchQuery) count++
    if (filters.contentType !== 'all') count++
    return count
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 border-l border-white/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      高度フィルター
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getActiveFiltersCount()}個のフィルターが有効
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  リセット
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI推奨
                </motion.button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Search */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  検索キーワード
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    placeholder="タイトル、説明文で検索..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  コンテンツタイプ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'viral', 'trending', 'emerging'] as const).map((type) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFilter('contentType', type)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        filters.contentType === type
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type === 'all' && '全て'}
                      {type === 'viral' && 'バイラル'}
                      {type === 'trending' && 'トレンド'}
                      {type === 'emerging' && '新興'}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveSection(activeSection === 'platforms' ? null : 'platforms')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    プラットフォーム
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      activeSection === 'platforms' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeSection === 'platforms' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {(['YOUTUBE', 'TIKTOK'] as Platform[]).map((platform) => (
                        <motion.button
                          key={platform}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => togglePlatform(platform)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            filters.platforms.includes(platform)
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {platform === 'YOUTUBE' ? 'YT' : 'TT'}
                            </div>
                            <span className="font-medium">
                              {platform === 'YOUTUBE' ? 'YouTube' : 'TikTok'}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Categories */}
              {availableCategories.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      カテゴリ ({filters.categories.length})
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        activeSection === 'categories' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'categories' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerms.categories}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, categories: e.target.value }))}
                            placeholder="カテゴリを検索..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                          />
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {filteredCategories.map((category) => (
                            <motion.button
                              key={category}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => toggleCategory(category)}
                              className={`w-full p-2 rounded-lg text-left text-sm transition-all ${
                                filters.categories.includes(category)
                                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                  : 'hover:bg-white/10 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {category}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Date Range */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveSection(activeSection === 'date' ? null : 'date')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    期間
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      activeSection === 'date' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeSection === 'date' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">開始日</label>
                          <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                            className="w-full p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">終了日</label>
                          <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                            className="w-full p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Range */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveSection(activeSection === 'views' ? null : 'views')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    再生数範囲
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      activeSection === 'views' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeSection === 'views' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">最小</label>
                          <input
                            type="number"
                            value={filters.viewRange.min}
                            onChange={(e) => updateFilter('viewRange', { ...filters.viewRange, min: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">最大</label>
                          <input
                            type="number"
                            value={filters.viewRange.max}
                            onChange={(e) => updateFilter('viewRange', { ...filters.viewRange, max: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveSection(activeSection === 'sort' ? null : 'sort')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    並び順
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      activeSection === 'sort' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeSection === 'sort' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <select
                          value={filters.sortBy}
                          onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                          className="w-full p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        >
                          <option value="views">再生数</option>
                          <option value="likes">いいね数</option>
                          <option value="comments">コメント数</option>
                          <option value="engagement">エンゲージメント率</option>
                          <option value="createdAt">投稿日時</option>
                        </select>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFilter('sortOrder', 'desc')}
                            className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                              filters.sortOrder === 'desc'
                                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            降順
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFilter('sortOrder', 'asc')}
                            className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                              filters.sortOrder === 'asc'
                                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            昇順
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}