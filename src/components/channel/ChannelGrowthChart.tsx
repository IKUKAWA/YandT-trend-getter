'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ComposedChart,
  Scatter
} from 'recharts'
import {
  TrendingUp,
  Users,
  Eye,
  Video,
  Zap,
  Calendar,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  Loader2,
  Target,
  Sparkles
} from 'lucide-react'
import { ChannelGrowthAnalysis } from '@/types/channel'
import { getChannelGrowthAnalysis } from '@/lib/data/channelData'

interface ChannelGrowthChartProps {
  growthAnalysis: ChannelGrowthAnalysis
  channelId?: string
  isLoading?: boolean
  onRefresh?: () => void
  enableProjections?: boolean
}

type ChartType = 'subscribers' | 'views' | 'engagement' | 'videos' | 'combined'
type TimeRange = '3months' | '6months' | '1year' | '2years'
type ChartView = 'area' | 'line' | 'bar' | 'composed'

interface ProjectionData {
  months: number
  subscriberCount: number
  avgViews: number
  engagementRate: number
  confidence: number
}

export function ChannelGrowthChart({ 
  growthAnalysis, 
  channelId,
  isLoading, 
  onRefresh,
  enableProjections = true 
}: ChannelGrowthChartProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>('subscribers')
  const [timeRange, setTimeRange] = useState<TimeRange>('6months')
  const [chartView, setChartView] = useState<ChartView>('area')
  const [showProjections, setShowProjections] = useState(false)
  const [projections, setProjections] = useState<ProjectionData[] | null>(null)
  const [isLoadingProjections, setIsLoadingProjections] = useState(false)
  const [localGrowthData, setLocalGrowthData] = useState(growthAnalysis)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const chartConfigs = {
    subscribers: {
      title: '登録者数推移',
      icon: Users,
      color: '#8B5CF6',
      gradient: 'url(#subscribersGradient)',
      dataKey: 'subscriberCount',
      format: (value: number) => value >= 1000000 ? `${(value / 1000000).toFixed(3)}M` : value >= 1000 ? `${(value / 1000).toFixed(3)}K` : value.toString()
    },
    views: {
      title: '平均再生回数推移',
      icon: Eye,
      color: '#06B6D4',
      gradient: 'url(#viewsGradient)',
      dataKey: 'avgViews',
      format: (value: number) => value >= 1000000 ? `${(value / 1000000).toFixed(3)}M` : value >= 1000 ? `${(value / 1000).toFixed(3)}K` : value.toString()
    },
    engagement: {
      title: 'エンゲージメント率推移',
      icon: Zap,
      color: '#F59E0B',
      gradient: 'url(#engagementGradient)',
      dataKey: 'engagementRate',
      format: (value: number) => `${(value * 100).toFixed(3)}%`
    },
    videos: {
      title: '動画投稿数推移',
      icon: Video,
      color: '#10B981',
      gradient: 'url(#videosGradient)',
      dataKey: 'videoCount',
      format: (value: number) => value.toString()
    },
    combined: {
      title: '総合成長分析',
      icon: Sparkles,
      color: '#EC4899',
      gradient: 'url(#combinedGradient)',
      dataKey: 'multiple',
      format: (value: number) => value.toString()
    }
  }

  // Update local data when props change
  useEffect(() => {
    setLocalGrowthData(growthAnalysis)
  }, [growthAnalysis])

  // Load projections when enabled and time range changes
  useEffect(() => {
    if (enableProjections && channelId && showProjections) {
      loadProjections()
    }
  }, [timeRange, showProjections, channelId, enableProjections])

  const loadProjections = useCallback(async () => {
    if (!channelId) return
    
    setIsLoadingProjections(true)
    try {
      const response = await getChannelGrowthAnalysis(channelId, {
        timeRange,
        includeProjections: true
      })
      
      if (response.projections) {
        setProjections(response.projections)
      }
    } catch (error) {
      console.error('Failed to load projections:', error)
    } finally {
      setIsLoadingProjections(false)
    }
  }, [channelId, timeRange])

  const handleRefresh = async () => {
    if (!channelId) {
      onRefresh?.()
      return
    }
    
    setIsRefreshing(true)
    try {
      const response = await getChannelGrowthAnalysis(channelId, {
        timeRange,
        includeProjections: showProjections
      })
      
      setLocalGrowthData(response)
      if (response.projections) {
        setProjections(response.projections)
      }
      
      onRefresh?.()
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getFilteredData = () => {
    const now = new Date()
    const monthsToSubtract = 
      timeRange === '3months' ? 3 : 
      timeRange === '6months' ? 6 : 
      timeRange === '1year' ? 12 : 24
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, now.getDate())
    
    const historicalData = localGrowthData.history
      .filter(item => item.date >= cutoffDate)
      .map(item => ({
        ...item,
        date: item.date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        isProjection: false
      }))
    
    // Add projection data if enabled
    if (showProjections && projections && projections.length > 0) {
      const lastHistoricalDate = localGrowthData.history[localGrowthData.history.length - 1].date
      const projectionData = projections.map(proj => {
        const projDate = new Date(lastHistoricalDate)
        projDate.setMonth(projDate.getMonth() + proj.months)
        
        return {
          date: projDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
          subscriberCount: proj.subscriberCount,
          avgViews: proj.avgViews,
          engagementRate: proj.engagementRate,
          videoCount: localGrowthData.current.videoCount + (proj.months * 5), // Estimate
          isProjection: true,
          confidence: proj.confidence
        }
      })
      
      return [...historicalData, ...projectionData]
    }
    
    return historicalData
  }

  const exportChartData = () => {
    const data = getFilteredData()
    const csvContent = [
      ['Date', 'Subscribers', 'Average Views', 'Engagement Rate', 'Video Count', 'Is Projection'],
      ...data.map(row => [
        row.date,
        row.subscriberCount,
        row.avgViews,
        (row.engagementRate * 100).toFixed(3) + '%',
        row.videoCount,
        row.isProjection ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `growth-analysis-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const currentConfig = chartConfigs[selectedChart]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg"
      >
        <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentConfig.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {currentConfig.title}: {currentConfig.format(payload[0].value)}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3" />
          <div className="h-80 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    )
  }

  const filteredData = getFilteredData()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="neo-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              成長分析
            </h3>
            <p className="text-sm text-gray-500">
              チャンネルの成長トレンドを分析
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Chart View Selector */}
          <div className="flex items-center gap-1 p-1 neo-card rounded-lg">
            {([
              { key: 'area', icon: BarChart3 },
              { key: 'line', icon: Activity },
              { key: 'bar', icon: BarChart3 }
            ] as const).map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setChartView(key as ChartView)}
                className={`p-1.5 rounded transition-all ${
                  chartView === key
                    ? 'bg-neo-purple text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {([
              { key: '3months', label: '3ヶ月' },
              { key: '6months', label: '6ヶ月' },
              { key: '1year', label: '1年' },
              { key: '2years', label: '2年' }
            ] as const).map(({ key, label }) => (
              <motion.button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeRange === key
                    ? 'neo-gradient text-white shadow-lg'
                    : 'neo-button hover:scale-105'
                }`}
                whileHover={{ scale: timeRange === key ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Projections Toggle */}
          {enableProjections && (
            <button
              onClick={() => setShowProjections(!showProjections)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                showProjections
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  : 'neo-button hover:scale-105'
              }`}
            >
              <Target className="w-4 h-4" />
              予測
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportChartData}
              className="p-2 neo-button rounded-lg hover:scale-105 transition-transform"
              title="データをエクスポート"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 neo-button rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              title="データを更新"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {(Object.entries(chartConfigs) as Array<[ChartType, typeof chartConfigs[ChartType]]>)
          .filter(([key]) => key !== 'combined' || selectedChart === 'combined')
          .map(([key, config]) => {
          const Icon = config.icon
          const isSelected = selectedChart === key
          
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedChart(key)}
              className={`p-3 rounded-xl text-left transition-all ${
                isSelected
                  ? 'neo-gradient text-white shadow-lg'
                  : 'neo-card hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {config.title}
                </span>
              </div>
              
              {/* Current Value */}
              {key !== 'combined' && (
                <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                  {config.format(localGrowthData.current[config.dataKey as keyof typeof localGrowthData.current] as number)}
                </div>
              )}
              
              {/* Growth Indicator */}
              {key !== 'combined' && localGrowthData.monthlyGrowthRate > 0 && (
                <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +{localGrowthData.monthlyGrowthRate}%
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChart}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="h-80 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {selectedChart === 'combined' ? (
              <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="combinedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                <Bar yAxisId="left" dataKey="videoCount" fill="#10B981" opacity={0.6} />
                <Line yAxisId="left" type="monotone" dataKey="subscriberCount" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgViews" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} />
                <Area yAxisId="right" type="monotone" dataKey="engagementRate" stroke="#F59E0B" fill="url(#engagementGradient)" />
              </ComposedChart>
            ) : chartView === 'bar' ? (
              <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={currentConfig.format} />
                <Tooltip content={<CustomTooltip />} />
                
                <Bar 
                  dataKey={currentConfig.dataKey} 
                  fill={currentConfig.color}
                  radius={[8, 8, 0, 0]}
                />
                {showProjections && filteredData.map((entry, index) => (
                  entry.isProjection && (
                    <Bar
                      key={`projection-${index}`}
                      dataKey={currentConfig.dataKey}
                      fill={currentConfig.color}
                      fillOpacity={0.3}
                      radius={[8, 8, 0, 0]}
                    />
                  )
                ))}
              </BarChart>
            ) : chartView === 'line' ? (
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={currentConfig.format} />
                <Tooltip content={<CustomTooltip />} />
                
                <Line
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    if (payload.isProjection) {
                      return <circle cx={cx} cy={cy} r={4} fill={currentConfig.color} fillOpacity={0.5} strokeDasharray="3 3" />
                    }
                    return <circle cx={cx} cy={cy} r={4} fill={currentConfig.color} />
                  }}
                  activeDot={{ r: 6, stroke: currentConfig.color, strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            ) : (
              <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="subscribersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="videosGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={currentConfig.format} />
                <Tooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={3}
                  fill={currentConfig.gradient}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props
                    if (payload.isProjection) {
                      return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={currentConfig.color} fillOpacity={0.5} strokeDasharray="3 3" />
                    }
                    return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={currentConfig.color} strokeWidth={2} />
                  }}
                  activeDot={{ r: 6, stroke: currentConfig.color, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Growth Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                月間成長率
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {localGrowthData.monthlyGrowthRate > 0 ? '+' : ''}{localGrowthData.monthlyGrowthRate}%
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                週間成長率
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {localGrowthData.weeklyGrowthRate > 0 ? '+' : ''}{localGrowthData.weeklyGrowthRate}%
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                成長加速度
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {localGrowthData.growthAcceleration.toFixed(3)}x
            </div>
          </div>
        </div>
      </div>

      {/* Projections Summary */}
      {showProjections && projections && projections.length > 0 && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-900 dark:text-purple-100">将来予測</span>
            {isLoadingProjections && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projections.slice(0, 4).map((proj) => (
              <div key={proj.months} className="text-center">
                <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                  {proj.months}ヶ月後
                </div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {chartConfigs[selectedChart].format(
                    selectedChart === 'engagement' ? proj.engagementRate : 
                    selectedChart === 'views' ? proj.avgViews :
                    proj.subscriberCount
                  )}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  信頼度 {proj.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}