'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts'
import { 
  Youtube, 
  Music2, 
  Camera, 
  Monitor,
  Users,
  TrendingUp,
  BarChart3,
  Zap,
  Star,
  Crown,
  Target
} from 'lucide-react'

interface PlatformData {
  platform: string
  platformJp: string
  value: number
  percentage: number
  growth: number
  engagement: number
  users: number
  color: string
  gradient: string
  icon: any
  darkColor: string
}

interface PlatformPieChartProps {
  data?: PlatformData[]
  chartType?: 'pie' | 'donut' | 'radial' | '3d'
  showLabels?: boolean
  showAnimation?: boolean
  showStats?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// プラットフォームアイコンとカラー
const getPlatformConfig = (platform: string) => {
  const configs: Record<string, any> = {
    'YouTube': {
      icon: Youtube,
      color: '#FF0000',
      darkColor: '#CC0000',
      gradient: 'linear-gradient(135deg, #FF0000 0%, #FF4444 100%)',
      jpName: 'ユーチューブ'
    },
    'TikTok': {
      icon: Music2,
      color: '#000000',
      darkColor: '#333333',
      gradient: 'linear-gradient(135deg, #000000 0%, #444444 100%)',
      jpName: 'ティックトック'
    },
    'X': {
      icon: Monitor,
      color: '#1DA1F2',
      darkColor: '#0D8BD9',
      gradient: 'linear-gradient(135deg, #1DA1F2 0%, #4FC3F7 100%)',
      jpName: 'エックス'
    },
    'Instagram': {
      icon: Camera,
      color: '#E4405F',
      darkColor: '#C13584',
      gradient: 'linear-gradient(135deg, #E4405F 0%, #F77737 50%, #FCAF45 100%)',
      jpName: 'インスタグラム'
    }
  }
  return configs[platform] || {
    icon: Monitor,
    color: '#8B5CF6',
    darkColor: '#7C3AED',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    jpName: platform
  }
}

export function PlatformPieChart({
  data = [],
  chartType = 'donut',
  showLabels = true,
  showAnimation = true,
  showStats = true,
  size = 'md',
  className = ''
}: PlatformPieChartProps) {
  const [chartData, setChartData] = useState<PlatformData[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // サイズ設定
  const sizeConfig = {
    sm: { chart: 250, inner: 60, outer: 100 },
    md: { chart: 350, inner: 80, outer: 140 },
    lg: { chart: 450, inner: 100, outer: 180 }
  }

  // モックデータ生成
  useEffect(() => {
    const generateData = () => {
      if (data.length === 0) {
        const platforms = ['YouTube', 'TikTok', 'X', 'Instagram']
        const baseValues = [4000, 3000, 2000, 1000] // 固定値
        
        const mockData = platforms.map((platform, index) => {
          const config = getPlatformConfig(platform)
          const baseValue = baseValues[index]
          const totalValue = baseValues.reduce((sum, val) => sum + val, 0)
          const percentage = (baseValue / totalValue) * 100
          
          return {
            platform,
            platformJp: config.jpName,
            value: baseValue,
            percentage: Math.floor(percentage * 10) / 10,
            growth: [15, -5, 8, 12][index], // 固定成長率
            engagement: [8.5, 12.3, 6.8, 9.2][index], // 固定エンゲージメント
            users: [2000000, 1500000, 800000, 1200000][index], // 固定ユーザー数
            color: config.color,
            darkColor: config.darkColor,
            gradient: config.gradient,
            icon: config.icon
          }
        })
        
        return mockData.sort((a, b) => b.value - a.value)
      } else {
        return data.map(item => ({
          ...item,
          ...getPlatformConfig(item.platform)
        }))
      }
    }

    const newData = generateData()
    setChartData(newData)
    
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [data.length]) // data.length のみを依存配列に

  // カスタムラベル
  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = entry
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const Icon = data.icon
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl min-w-[280px]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: data.gradient }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {data.platformJp}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.platform}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">トレンド数:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.value.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">シェア:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.percentage}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">成長率:</span>
                <span className={`font-semibold ${
                  data.growth > 0 ? 'text-green-600' : data.growth < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.growth > 0 ? '+' : ''}{data.growth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">エンゲージメント:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.engagement}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">アクティブユーザー:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(data.users / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </motion.div>
      )
    }
    return null
  }

  // ドーナツチャート
  const renderDonutChart = () => (
    <ResponsiveContainer width="100%" height={sizeConfig[size].chart}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : false}
          outerRadius={sizeConfig[size].outer}
          innerRadius={sizeConfig[size].inner}
          fill="#8884d8"
          dataKey="value"
          animationBegin={showAnimation ? 0 : undefined}
          animationDuration={showAnimation ? 1500 : 0}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={activeIndex === index ? entry.darkColor : entry.color}
              stroke={activeIndex === index ? entry.color : 'transparent'}
              strokeWidth={activeIndex === index ? 3 : 0}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )

  // ラジアルチャート
  const renderRadialChart = () => (
    <ResponsiveContainer width="100%" height={sizeConfig[size].chart}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="20%" 
        outerRadius="90%" 
        data={chartData}
        startAngle={90}
        endAngle={450}
      >
        <PolarAngleAxis type="number" domain={[0, Math.max(...chartData.map(d => d.value))]} tick={false} />
        <Tooltip content={<CustomTooltip />} />
        {chartData.map((entry, index) => (
          <RadialBar
            key={index}
            dataKey="value"
            fill={entry.color}
            cornerRadius={10}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        ))}
      </RadialBarChart>
    </ResponsiveContainer>
  )

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`neo-card p-6 ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              プラットフォーム比較
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              トレンドシェア分布
            </p>
          </div>
        </div>

        {/* チャートタイプセレクター */}
        <div className="flex gap-1 p-1 bg-white/20 dark:bg-gray-800/20 rounded-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-md ${chartType === 'donut' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
          >
            <Target className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-md ${chartType === 'radial' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
          >
            <Zap className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* チャート */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div>
              {chartType === 'radial' ? renderRadialChart() : renderDonutChart()}
            </div>

            {/* 中央の統計 */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    総トレンド数
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        {showStats && (
          <div className="lg:w-80 space-y-4">
            {chartData.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.platform}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    hoveredPlatform === item.platform
                      ? 'border-white/40 bg-white/60 dark:bg-gray-800/60'
                      : 'border-white/20 bg-white/30 dark:bg-gray-800/30'
                  }`}
                  onMouseEnter={() => setHoveredPlatform(item.platform)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ background: item.gradient }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.platformJp}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">トレンド</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.value.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">成長</div>
                      <div className={`font-semibold ${
                        item.growth > 0 ? 'text-green-600' : item.growth < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">ユーザー</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(item.users / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  {/* プログレスバー */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ background: item.gradient, width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* フッター統計 */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {chartData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              プラットフォーム
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              総トレンド数
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{(chartData.reduce((sum, item) => sum + item.growth, 0) / chartData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              平均成長率
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(chartData.reduce((sum, item) => sum + item.engagement, 0) / chartData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              平均エンゲージメント
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}