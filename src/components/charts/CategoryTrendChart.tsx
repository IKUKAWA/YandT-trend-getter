'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PolarRadiusAxis,
  PolarGrid
} from 'recharts'
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Target,
  Zap,
  Star,
  Flame,
  Crown
} from 'lucide-react'

interface CategoryData {
  category: string
  categoryJp: string
  value: number
  growth: number
  engagement: number
  trend: 'up' | 'down' | 'stable'
  color: string
  gradient: string
  icon: string
}

interface CategoryTrendChartProps {
  data?: CategoryData[]
  timeRange?: 'daily' | 'weekly' | 'monthly'
  chartType?: 'area' | 'bar' | 'line' | 'radial'
  showGradient?: boolean
  showAnimation?: boolean
  className?: string
}

// カテゴリーアイコンマッピング
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'Music': '🎵',
    'Sports': '⚽',
    'Gaming': '🎮',
    'Technology': '💻',
    'Comedy': '😂',
    'Education': '📚',
    'News': '📰',
    'Entertainment': '🎭',
    'Beauty': '💄',
    'Food': '🍕',
    'Travel': '✈️',
    'Fashion': '👗',
    'Health': '💪',
    'Science': '🔬',
    'Art': '🎨'
  }
  return iconMap[category] || '📊'
}

// カテゴリー日本語名マッピング
const getCategoryJapanese = (category: string): string => {
  const jpMap: Record<string, string> = {
    'Music': '音楽',
    'Sports': 'スポーツ',
    'Gaming': 'ゲーム',
    'Technology': 'テクノロジー',
    'Comedy': 'コメディ',
    'Education': '教育',
    'News': 'ニュース',
    'Entertainment': 'エンターテイメント',
    'Beauty': '美容',
    'Food': 'グルメ',
    'Travel': '旅行',
    'Fashion': 'ファッション',
    'Health': 'ヘルス',
    'Science': 'サイエンス',
    'Art': 'アート'
  }
  return jpMap[category] || category
}

// カラーパレット（ネオモーフィズム対応）
const getColorPalette = (index: number) => {
  const colors = [
    {
      main: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      shadow: '#6D28D9',
      glow: 'rgba(139, 92, 246, 0.3)'
    },
    {
      main: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #67E8F9 100%)',
      shadow: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.3)'
    },
    {
      main: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)',
      shadow: '#059669',
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    {
      main: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
      shadow: '#D97706',
      glow: 'rgba(245, 158, 11, 0.3)'
    },
    {
      main: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%)',
      shadow: '#DC2626',
      glow: 'rgba(239, 68, 68, 0.3)'
    },
    {
      main: '#8B5A2B',
      gradient: 'linear-gradient(135deg, #8B5A2B 0%, #D2B48C 100%)',
      shadow: '#6B4423',
      glow: 'rgba(139, 90, 43, 0.3)'
    }
  ]
  return colors[index % colors.length]
}

export function CategoryTrendChart({
  data = [],
  timeRange = 'weekly',
  chartType = 'area',
  showGradient = true,
  showAnimation = true,
  className = ''
}: CategoryTrendChartProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [chartData, setChartData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // モックデータ生成（実際のデータがない場合）
  useEffect(() => {
    const generateData = () => {
      if (data.length === 0) {
        const mockCategories = [
          'Music', 'Sports', 'Gaming', 'Technology', 'Comedy', 
          'Education', 'News', 'Entertainment', 'Beauty', 'Food'
        ]
        
        const mockData = mockCategories.map((category, index) => {
          const colorInfo = getColorPalette(index)
          const baseValue = 500 + (index * 100) // 固定値を使用してランダム性を排除
          const growth = (index % 3 === 0 ? 1 : index % 3 === 1 ? -1 : 0) * 10 // 固定成長率
          
          return {
            category,
            categoryJp: getCategoryJapanese(category),
            value: Math.floor(baseValue),
            growth: Math.floor(growth * 10) / 10,
            engagement: 50 + (index * 5), // 固定エンゲージメント
            trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable' as const,
            color: colorInfo.main,
            gradient: colorInfo.gradient,
            icon: getCategoryIcon(category)
          }
        })
        
        return mockData.sort((a, b) => b.value - a.value)
      } else {
        return data.map((item, index) => ({
          ...item,
          categoryJp: getCategoryJapanese(item.category),
          ...getColorPalette(index)
        }))
      }
    }

    const newData = generateData()
    setChartData(newData)
    
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [data.length]) // data.length のみを依存配列に

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{data.icon}</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.categoryJp}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.category}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">再生数:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">成長率:</span>
              <span className={`font-medium flex items-center gap-1 ${
                data.growth > 0 ? 'text-green-600' : data.growth < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {data.growth > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                {data.growth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">エンゲージメント:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.engagement}%
              </span>
            </div>
          </div>
        </motion.div>
      )
    }
    return null
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4"></div>
          <div className="h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Area Chart レンダリング
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {chartData.map((item, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={item.color} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="categoryJp" 
          stroke="rgba(255,255,255,0.6)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={chartData[0]?.color || '#8B5CF6'}
          fill={showGradient ? 'url(#gradient-0)' : chartData[0]?.color}
          strokeWidth={3}
          dot={{ fill: chartData[0]?.color, strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: chartData[0]?.color, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  // Bar Chart レンダリング
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="categoryJp" 
          stroke="rgba(255,255,255,0.6)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        {chartData.map((item, index) => (
          <Bar 
            key={index}
            dataKey="value" 
            fill={item.color}
            radius={[8, 8, 0, 0]}
            opacity={activeCategory === null || activeCategory === item.category ? 1 : 0.3}
            onMouseEnter={() => setActiveCategory(item.category)}
            onMouseLeave={() => setActiveCategory(null)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  // Radial Chart レンダリング
  const renderRadialChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="20%" 
        outerRadius="80%" 
        data={chartData.slice(0, 6)}
        startAngle={90}
        endAngle={450}
      >
        <PolarAngleAxis type="number" domain={[0, Math.max(...chartData.map(d => d.value))]} />
        <PolarRadiusAxis tick={false} />
        <PolarGrid />
        <Tooltip content={<CustomTooltip />} />
        {chartData.slice(0, 6).map((item, index) => (
          <RadialBar
            key={index}
            dataKey="value"
            fill={item.color}
            cornerRadius={8}
            opacity={activeCategory === null || activeCategory === item.category ? 1 : 0.3}
            onMouseEnter={() => setActiveCategory(item.category)}
            onMouseLeave={() => setActiveCategory(null)}
          />
        ))}
      </RadialBarChart>
    </ResponsiveContainer>
  )

  // Chart Type Selector
  const chartTypeOptions = [
    { type: 'area', label: 'エリア', icon: Activity },
    { type: 'bar', label: 'バー', icon: BarChart3 },
    { type: 'radial', label: 'ラジアル', icon: Target }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`neo-card p-6 ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              カテゴリ別トレンド
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timeRange === 'daily' ? '日次' : timeRange === 'weekly' ? '週次' : '月次'}データ
            </p>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-1 p-1 bg-white/20 dark:bg-gray-800/20 rounded-lg">
          {chartTypeOptions.map((option) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {/* チャートタイプ変更ロジック */}}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  chartType === option.type
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* チャート */}
      <div className="relative">
        <div>
          {chartType === 'area' && renderAreaChart()}
          {chartType === 'bar' && renderBarChart()}
          {chartType === 'radial' && renderRadialChart()}
        </div>
      </div>

      {/* カテゴリ統計 */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {chartData.slice(0, 5).map((item, index) => (
          <div
            key={item.category}
            className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.categoryJp}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {item.value.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium flex items-center gap-1 ${
                item.growth > 0 ? 'text-green-600' : item.growth < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.growth > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                {item.growth > 0 ? '+' : ''}{item.growth}%
              </span>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* レジェンド */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {chartData.slice(0, 10).map((item, index) => (
          <div
            key={item.category}
            className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
            onMouseEnter={() => setActiveCategory(item.category)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {item.categoryJp}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}