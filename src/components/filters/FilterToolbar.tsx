'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Filter, 
  Search, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Eye, 
  Heart,
  MessageCircle,
  X,
  Settings,
  Sparkles
} from 'lucide-react'

interface FilterToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onQuickFilter: (preset: string) => void
  onToggleFilterPanel: () => void
  hasActiveFilters: boolean
  activeFiltersCount: number
  filterStats: {
    totalItems: number
    filteredItems: number
    filterEfficiency: number
  }
  onResetFilters: () => void
}

const quickFilterPresets = [
  { id: 'trending', label: 'トレンド', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'viral', label: 'バイラル', icon: Zap, color: 'from-purple-500 to-pink-500' },
  { id: 'recent', label: '最新', icon: Calendar, color: 'from-green-500 to-emerald-500' },
  { id: 'popular', label: '人気', icon: Eye, color: 'from-orange-500 to-red-500' },
  { id: 'youtube', label: 'YouTube', icon: Heart, color: 'from-red-500 to-red-600' },
  { id: 'tiktok', label: 'TikTok', icon: MessageCircle, color: 'from-gray-800 to-gray-900' },
]

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  onQuickFilter,
  onToggleFilterPanel,
  hasActiveFilters,
  activeFiltersCount,
  filterStats,
  onResetFilters,
}: FilterToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/10 p-4"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Search and Filter Controls */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="タイトル、カテゴリ、ハッシュタグで検索..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Filter Stats */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-white/10">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {filterStats.filteredItems.toLocaleString()}
              </span>
              <span className="mx-1">/</span>
              <span>{filterStats.totalItems.toLocaleString()}</span>
              <span className="ml-1">件</span>
            </div>
            <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filterStats.filterEfficiency}%
            </div>
          </div>

          {/* Advanced Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFilterPanel}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
              hasActiveFilters
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-white/20'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">高度フィルター</span>
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {activeFiltersCount}
              </motion.div>
            )}
          </motion.button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetFilters}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">リセット</span>
            </motion.button>
          )}
        </div>

        {/* Quick Filter Presets */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
            <Sparkles className="w-4 h-4" />
            クイックフィルター:
          </div>
          
          <div className="flex gap-2">
            {quickFilterPresets.map((preset) => {
              const Icon = preset.icon
              return (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onQuickFilter(preset.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 border border-white/20 transition-all whitespace-nowrap"
                >
                  <div className={`p-1 rounded-lg bg-gradient-to-r ${preset.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {preset.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
          >
            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {activeFiltersCount}個のフィルターが適用中
            </span>
            <div className="flex-1"></div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {filterStats.filteredItems.toLocaleString()}件が表示
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}