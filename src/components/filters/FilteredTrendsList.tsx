'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilterPanel } from './FilterPanel'
import { FilterToolbar } from './FilterToolbar'
import { useFilters } from '@/hooks/useFilters'
import { TrendCard } from '@/components/TrendCard'
import { Loader2, BarChart3, TrendingUp, Zap } from 'lucide-react'

interface TrendData {
  id: string
  title?: string
  platform: 'YOUTUBE' | 'TIKTOK'
  category?: string
  views?: string | number
  likes?: number
  comments?: number
  shares?: number
  hashtags?: string[]
  createdAt: Date | string
  updatedAt?: Date | string
  thumbnail?: string
  description?: string
  channelName?: string
}

interface FilteredTrendsListProps {
  data: TrendData[]
  isLoading?: boolean
  onTrendClick?: (trend: TrendData) => void
}

export function FilteredTrendsList({ 
  data, 
  isLoading = false, 
  onTrendClick 
}: FilteredTrendsListProps) {
  const {
    filteredData,
    availableCategories,
    availableTags,
    filterStats,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    toggleFilterPanel,
    applyQuickFilter,
    calculateEngagementRate,
  } = useFilters({ data })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [displayLimit, setDisplayLimit] = useState(20)

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
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
  }, [filters])

  // Handle search input
  const handleSearchChange = (query: string) => {
    updateFilters({ searchQuery: query })
  }

  // Load more items
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20)
  }

  // Get displayed data (with limit)
  const displayedData = filteredData.slice(0, displayLimit)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-gray-600 dark:text-gray-400">データを読み込んでいます...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        onQuickFilter={applyQuickFilter}
        onToggleFilterPanel={toggleFilterPanel}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        filterStats={filterStats}
        onResetFilters={resetFilters}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onFiltersChange={updateFilters}
        initialFilters={filters}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Analytics Cards */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredData.filter(item => item.platform === 'YOUTUBE').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">YouTube動画</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-gray-800/10 to-gray-900/10 border border-gray-800/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800/20">
                  <TrendingUp className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {filteredData.filter(item => item.platform === 'TIKTOK').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">TikTok動画</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(filteredData.reduce((sum, item) => sum + calculateEngagementRate(item), 0) / filteredData.length * 100) / 100}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">平均エンゲージメント</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              トレンド一覧
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {displayedData.length} / {filteredData.length} 件
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-500/20 text-purple-600' 
                  : 'hover:bg-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-500/20 text-purple-600' 
                  : 'hover:bg-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-0.5 rounded-sm"></div>
                <div className="bg-current h-0.5 rounded-sm"></div>
                <div className="bg-current h-0.5 rounded-sm"></div>
                <div className="bg-current h-0.5 rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                条件に一致するトレンドが見つかりません
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                フィルター条件を調整するか、検索キーワードを変更してみてください
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                フィルターをリセット
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Trend Cards */}
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {displayedData.map((trend, index) => (
                  <motion.div
                    key={trend.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    onClick={() => onTrendClick?.(trend)}
                  >
                    <TrendCard
                      title={trend.title || 'Untitled'}
                      platform={trend.platform}
                      views={Number(trend.views) || 0}
                      likes={trend.likes || 0}
                      comments={trend.comments || 0}
                      shares={trend.shares || 0}
                      thumbnail={trend.thumbnail}
                      hashtags={trend.hashtags || []}
                      category={trend.category}
                      createdAt={new Date(trend.createdAt)}
                      channelName={trend.channelName}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            {displayedData.length < filteredData.length && (
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-medium rounded-lg transition-all"
                >
                  さらに表示 ({filteredData.length - displayedData.length}件)
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}