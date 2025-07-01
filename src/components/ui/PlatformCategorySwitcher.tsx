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
  Grid,
  List,
  BarChart3,
  Circle,
  Grid3X3,
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

interface PlatformCategorySwitcherProps {
  selectedChartType: string
  onChartTypeChange: (type: string) => void
}

const platforms = [
  { id: 'all', label: '全プラットフォーム', icon: Grid, color: '#6366f1', gradient: 'from-indigo-500 to-purple-600' },
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

const chartTypes = [
  { id: 'bar', label: 'バーチャート', icon: BarChart3, description: 'カテゴリ別比較' },
  { id: 'radial', label: 'ラジアルチャート', icon: Circle, description: '放射状データ表示' },
  { id: 'scatter', label: '散布図マトリックス', icon: Grid3X3, description: '相関関係分析' }
]

export function PlatformCategorySwitcher({
  selectedChartType,
  onChartTypeChange
}: PlatformCategorySwitcherProps) {
  const selectedChartData = chartTypes.find(c => c.id === selectedChartType)

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          チャートタイプ
        </h4>
        <div className="space-y-2">
          {chartTypes.map((chart) => {
            const Icon = chart.icon
            const isSelected = selectedChartType === chart.id

            return (
              <motion.button
                key={chart.id}
                onClick={() => onChartTypeChange(chart.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                  ${isSelected 
                    ? 'neo-gradient text-white shadow-lg' 
                    : 'neo-card hover:shadow-md'
                  }
                `}
                whileHover={{ scale: 1.02 }}
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
                    {chart.label}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {chart.description}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Current Selection */}
      <div className="p-4 bg-gradient-to-r from-neo-light/5 to-neo-dark/5 rounded-xl border border-neo-light/20">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          選択中のチャート
        </h5>
        <div className="flex items-center gap-2 text-xs">
          {selectedChartData && (
            <>
              <selectedChartData.icon className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {selectedChartData.label}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}