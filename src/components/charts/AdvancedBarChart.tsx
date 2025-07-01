'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Youtube,
  Music2,
  Camera,
  Monitor
} from 'lucide-react'

interface PlatformData {
  name: string
  youtube: number
  tiktok: number
  x: number
  instagram: number
}

interface AdvancedBarChartProps {
  data?: PlatformData[]
  type?: 'vertical' | 'horizontal' | 'stacked' | 'grouped'
  metric?: 'total' | 'engagement' | 'platform'
  selectedPlatform?: string
  selectedCategory?: string
  showLegend?: boolean
  showGrid?: boolean
  animated?: boolean
}

const mockPlatformData: PlatformData[] = [
  {
    name: '音楽',
    youtube: 1250,
    tiktok: 890,
    x: 640,
    instagram: 720
  },
  {
    name: 'ゲーム',
    youtube: 1120,
    tiktok: 1340,
    x: 580,
    instagram: 650
  },
  {
    name: 'ライフスタイル',
    youtube: 980,
    tiktok: 1150,
    x: 720,
    instagram: 1100
  },
  {
    name: 'テクノロジー',
    youtube: 1450,
    tiktok: 650,
    x: 890,
    instagram: 540
  },
  {
    name: 'ファッション',
    youtube: 750,
    tiktok: 1580,
    x: 420,
    instagram: 1320
  },
  {
    name: 'フード',
    youtube: 920,
    tiktok: 1240,
    x: 580,
    instagram: 980
  },
  {
    name: 'スポーツ',
    youtube: 1380,
    tiktok: 780,
    x: 1120,
    instagram: 690
  },
  {
    name: 'エンタメ',
    youtube: 1650,
    tiktok: 1420,
    x: 980,
    instagram: 1180
  }
]

const platformConfig = {
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    gradient: 'url(#youtubeGradient)',
    icon: Youtube
  },
  tiktok: {
    name: 'TikTok', 
    color: '#000000',
    gradient: 'url(#tiktokGradient)',
    icon: Music2
  },
  x: {
    name: 'X (Twitter)',
    color: '#1DA1F2',
    gradient: 'url(#xGradient)', 
    icon: Monitor
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    gradient: 'url(#instagramGradient)',
    icon: Camera
  }
}

export function AdvancedBarChart({
  data = mockPlatformData,
  type = 'grouped',
  metric = 'platform',
  selectedPlatform = '',
  selectedCategory = '',
  showLegend = true,
  showGrid = true,
  animated = true
}: AdvancedBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [focusedPlatform, setFocusedPlatform] = useState<string | null>(null)

  const chartData = useMemo(() => {
    let filteredData = data
    
    // Filter by category if selected
    if (selectedCategory) {
      filteredData = data.filter(item => item.name === selectedCategory)
    }
    
    return filteredData
  }, [data, selectedCategory])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg"
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </h3>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {platformConfig[entry.dataKey as keyof typeof platformConfig]?.name}: {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null

    return (
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {payload.map((entry: any, index: number) => {
          const platform = entry.dataKey
          const config = platformConfig[platform as keyof typeof platformConfig]
          const Icon = config?.icon
          const isActive = !focusedPlatform || focusedPlatform === platform

          return (
            <motion.button
              key={index}
              onClick={() => setFocusedPlatform(focusedPlatform === platform ? null : platform)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive ? 'opacity-100' : 'opacity-50'
              } hover:opacity-100 hover:scale-105`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-4 h-4" style={{ color: config.color }} />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {config?.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    )
  }

  const getBarOpacity = (dataKey: string) => {
    if (!focusedPlatform) return 1
    return focusedPlatform === dataKey ? 1 : 0.3
  }

  // Calculate statistics
  const totalsByPlatform = useMemo(() => {
    const totals = { youtube: 0, tiktok: 0, x: 0, instagram: 0 }
    chartData.forEach(item => {
      totals.youtube += item.youtube
      totals.tiktok += item.tiktok
      totals.x += item.x
      totals.instagram += item.instagram
    })
    return totals
  }, [chartData])

  const grandTotal = Object.values(totalsByPlatform).reduce((sum, val) => sum + val, 0)

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent">
              プラットフォーム別バーチャート分析
            </h3>
            <p className="text-sm text-gray-500">
              YouTube, TikTok, X, Instagram のカテゴリ別比較
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocusedPlatform(null)}
            className="neo-button px-3 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
          >
            全表示
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <defs>
              {/* YouTube Gradient */}
              <linearGradient id="youtubeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF0000" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#CC0000" stopOpacity={0.7} />
              </linearGradient>
              
              {/* TikTok Gradient */}
              <linearGradient id="tiktokGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#333333" stopOpacity={0.7} />
              </linearGradient>
              
              {/* X Gradient */}
              <linearGradient id="xGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1DA1F2" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1890E0" stopOpacity={0.7} />
              </linearGradient>
              
              {/* Instagram Gradient */}
              <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E4405F" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#C13584" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(156, 163, 175, 0.2)"
                className="dark:stroke-gray-600"
              />
            )}
            
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              className="text-gray-600 dark:text-gray-400"
            />
            
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              className="text-gray-600 dark:text-gray-400"
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {showLegend && <Legend content={<CustomLegend />} />}

            {/* YouTube Bar */}
            <Bar
              dataKey="youtube"
              fill={platformConfig.youtube.gradient}
              radius={[2, 2, 0, 0]}
              opacity={getBarOpacity('youtube')}
              animationDuration={animated ? 800 : 0}
              animationBegin={100}
              onMouseEnter={() => setHoveredBar('youtube')}
              onMouseLeave={() => setHoveredBar(null)}
            />

            {/* TikTok Bar */}
            <Bar
              dataKey="tiktok"
              fill={platformConfig.tiktok.gradient}
              radius={[2, 2, 0, 0]}
              opacity={getBarOpacity('tiktok')}
              animationDuration={animated ? 800 : 0}
              animationBegin={200}
              onMouseEnter={() => setHoveredBar('tiktok')}
              onMouseLeave={() => setHoveredBar(null)}
            />

            {/* X Bar */}
            <Bar
              dataKey="x"
              fill={platformConfig.x.gradient}
              radius={[2, 2, 0, 0]}
              opacity={getBarOpacity('x')}
              animationDuration={animated ? 800 : 0}
              animationBegin={300}
              onMouseEnter={() => setHoveredBar('x')}
              onMouseLeave={() => setHoveredBar(null)}
            />

            {/* Instagram Bar */}
            <Bar
              dataKey="instagram"
              fill={platformConfig.instagram.gradient}
              radius={[2, 2, 0, 0]}
              opacity={getBarOpacity('instagram')}
              animationDuration={animated ? 800 : 0}
              animationBegin={400}
              onMouseEnter={() => setHoveredBar('instagram')}
              onMouseLeave={() => setHoveredBar(null)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totalsByPlatform).map(([platform, total]) => {
          const config = platformConfig[platform as keyof typeof platformConfig]
          const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0'
          const Icon = config?.icon

          return (
            <motion.div
              key={platform}
              className={`text-center p-4 rounded-xl transition-all ${
                hoveredBar === platform || focusedPlatform === platform
                  ? 'bg-gray-50 dark:bg-gray-800 scale-105'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {Icon && <Icon className="w-5 h-5" style={{ color: config.color }} />}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {config?.name}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {percentage}%
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            合計データポイント: <span className="font-medium">{grandTotal.toLocaleString()}</span>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            カテゴリ数: <span className="font-medium">{chartData.length}</span>
          </span>
        </div>
      </div>
    </div>
  )
}