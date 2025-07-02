'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  TrendingUp,
  Eye,
  Zap,
  Plus,
  X,
  BarChart3,
  Target,
  Trophy,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react'
import { ChannelSearchResult, ChannelAnalysis } from '@/types/channel'
import { ChannelSearch } from './ChannelSearch'
import { getChannelAnalysis } from '@/lib/data/channelData'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts'

interface ComparisonChannel {
  channel: ChannelSearchResult
  analysis: ChannelAnalysis | null
  color: string
  isLoading: boolean
}

const CHANNEL_COLORS = [
  '#8B5CF6',
  '#06B6D4',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#3B82F6'
]

type ComparisonMetric = 'overview' | 'growth' | 'engagement' | 'performance'

export function ChannelComparison() {
  const [channels, setChannels] = useState<ComparisonChannel[]>([])
  const [selectedMetric, setSelectedMetric] = useState<ComparisonMetric>('overview')
  const [isAddingChannel, setIsAddingChannel] = useState(false)
  const [comparisonError, setComparisonError] = useState<string | null>(null)

  const metrics = [
    { key: 'overview' as ComparisonMetric, label: '概要比較', icon: BarChart3 },
    { key: 'growth' as ComparisonMetric, label: '成長率比較', icon: TrendingUp },
    { key: 'engagement' as ComparisonMetric, label: 'エンゲージメント比較', icon: Zap },
    { key: 'performance' as ComparisonMetric, label: 'パフォーマンス比較', icon: Trophy }
  ]

  const handleAddChannel = async (channel: ChannelSearchResult) => {
    if (channels.length >= 6) {
      setComparisonError('比較できるチャンネルは最大6個までです')
      return
    }

    if (channels.some(c => c.channel.id === channel.id)) {
      setComparisonError('このチャンネルは既に追加されています')
      return
    }

    const newChannel: ComparisonChannel = {
      channel,
      analysis: null,
      color: CHANNEL_COLORS[channels.length],
      isLoading: true
    }

    setChannels(prev => [...prev, newChannel])
    setIsAddingChannel(false)
    setComparisonError(null)

    // Load channel analysis
    try {
      const analysis = await getChannelAnalysis(channel.id, {
        depth: 'detailed',
        includeCompetitors: false,
        includeAI: false
      })

      setChannels(prev => prev.map(c => 
        c.channel.id === channel.id 
          ? { ...c, analysis, isLoading: false }
          : c
      ))
    } catch (error) {
      console.error('Failed to load channel analysis:', error)
      setChannels(prev => prev.map(c => 
        c.channel.id === channel.id 
          ? { ...c, isLoading: false }
          : c
      ))
    }
  }

  const handleRemoveChannel = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.channel.id !== channelId))
    setComparisonError(null)
  }

  const getOverviewData = () => {
    return channels.map(({ channel, analysis }) => ({
      name: channel.name,
      subscribers: channel.subscriberCount,
      avgViews: analysis?.growthAnalysis.current.avgViews || 0,
      engagementRate: (analysis?.growthAnalysis.current.engagementRate || 0) * 100,
      videoCount: analysis?.growthAnalysis.current.videoCount || 0
    }))
  }

  const getGrowthData = () => {
    return channels.map(({ channel, analysis }) => ({
      name: channel.name,
      monthlyGrowth: analysis?.growthAnalysis.monthlyGrowthRate || 0,
      weeklyGrowth: analysis?.growthAnalysis.weeklyGrowthRate || 0,
      acceleration: analysis?.growthAnalysis.growthAcceleration || 1,
      trendStrength: analysis?.growthAnalysis.trendStrength || 0
    }))
  }

  const getEngagementData = () => {
    const metrics = ['エンゲージメント率', '平均再生回数', 'いいね率', 'コメント率', 'シェア率']
    
    return metrics.map(metric => {
      const dataPoint: any = { metric }
      
      channels.forEach(({ channel, analysis }, index) => {
        if (analysis) {
          switch (metric) {
            case 'エンゲージメント率':
              dataPoint[`channel${index}`] = analysis.growthAnalysis.current.engagementRate * 100
              break
            case '平均再生回数':
              dataPoint[`channel${index}`] = (analysis.growthAnalysis.current.avgViews / 1000).toFixed(3)
              break
            case 'いいね率':
              dataPoint[`channel${index}`] = analysis.growthAnalysis.current.engagementRate * 100 * 0.7
              break
            case 'コメント率':
              dataPoint[`channel${index}`] = analysis.growthAnalysis.current.engagementRate * 100 * 0.2
              break
            case 'シェア率':
              dataPoint[`channel${index}`] = analysis.growthAnalysis.current.engagementRate * 100 * 0.1
              break
          }
        }
      })
      
      return dataPoint
    })
  }

  const getPerformanceData = () => {
    if (channels.length === 0) return []

    const maxSubscribers = Math.max(...channels.map(c => c.channel.subscriberCount))
    const maxViews = Math.max(...channels.map(c => c.analysis?.growthAnalysis.current.avgViews || 0))
    const maxEngagement = Math.max(...channels.map(c => (c.analysis?.growthAnalysis.current.engagementRate || 0) * 100))
    const maxGrowth = Math.max(...channels.map(c => c.analysis?.growthAnalysis.monthlyGrowthRate || 0))
    const maxVideos = Math.max(...channels.map(c => c.analysis?.growthAnalysis.current.videoCount || 0))

    return channels.map(({ channel, analysis }) => ({
      name: channel.name,
      subscribers: (channel.subscriberCount / maxSubscribers) * 100,
      avgViews: ((analysis?.growthAnalysis.current.avgViews || 0) / maxViews) * 100,
      engagement: ((analysis?.growthAnalysis.current.engagementRate || 0) * 100 / maxEngagement) * 100,
      growth: ((analysis?.growthAnalysis.monthlyGrowthRate || 0) / maxGrowth) * 100,
      videos: ((analysis?.growthAnalysis.current.videoCount || 0) / maxVideos) * 100
    }))
  }

  const exportComparisonData = () => {
    const data = channels.map(({ channel, analysis }) => ({
      チャンネル名: channel.name,
      プラットフォーム: channel.platform,
      登録者数: channel.subscriberCount,
      平均再生回数: analysis?.growthAnalysis.current.avgViews || 0,
      エンゲージメント率: `${((analysis?.growthAnalysis.current.engagementRate || 0) * 100).toFixed(3)}%`,
      月間成長率: `${analysis?.growthAnalysis.monthlyGrowthRate || 0}%`,
      動画数: analysis?.growthAnalysis.current.videoCount || 0
    }))

    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `channel-comparison-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(3)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(3)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            チャンネル比較分析
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            最大6つのチャンネルを同時に比較分析
          </p>
        </div>
        
        <button
          onClick={exportComparisonData}
          disabled={channels.length === 0}
          className="flex items-center gap-2 px-4 py-2 neo-button rounded-lg disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          エクスポート
        </button>
      </div>

      {/* Channel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channelData, index) => (
          <motion.div
            key={channelData.channel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="neo-card p-4 relative"
          >
            <button
              onClick={() => handleRemoveChannel(channelData.channel.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: channelData.color }}
              >
                {channelData.channel.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {channelData.channel.name}
                </h3>
                <div className="text-sm text-gray-500">
                  <Users className="w-3 h-3 inline mr-1" />
                  {formatNumber(channelData.channel.subscriberCount)}
                </div>
              </div>
            </div>
            
            {channelData.isLoading && (
              <div className="mt-3 text-center text-sm text-gray-500">
                データ読み込み中...
              </div>
            )}
            
            {channelData.analysis && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">成長率:</span>
                  <span className="ml-1 font-medium">
                    {channelData.analysis.growthAnalysis.monthlyGrowthRate > 0 ? '+' : ''}
                    {channelData.analysis.growthAnalysis.monthlyGrowthRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">動画数:</span>
                  <span className="ml-1 font-medium">
                    {channelData.analysis.growthAnalysis.current.videoCount}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Add Channel Button */}
        {channels.length < 6 && (
          <motion.button
            onClick={() => setIsAddingChannel(true)}
            className="neo-card p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                     hover:border-neo-purple dark:hover:border-neo-purple transition-colors
                     flex flex-col items-center justify-center gap-2 min-h-[120px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">チャンネルを追加</span>
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      {comparisonError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{comparisonError}</span>
          </div>
        </motion.div>
      )}

      {/* Add Channel Modal */}
      <AnimatePresence>
        {isAddingChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                比較チャンネルを追加
              </h3>
              
              <ChannelSearch
                onChannelSelect={handleAddChannel}
                showAdvancedFilters={false}
              />
              
              <button
                onClick={() => setIsAddingChannel(false)}
                className="mt-4 w-full neo-button py-2 rounded-lg font-medium"
              >
                キャンセル
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Charts */}
      {channels.length >= 2 && (
        <>
          {/* Metric Selector */}
          <div className="flex flex-wrap gap-2">
            {metrics.map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedMetric === key
                    ? 'neo-gradient text-white shadow-lg'
                    : 'neo-card hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Chart Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="neo-card p-6"
            >
              {selectedMetric === 'overview' && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getOverviewData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="subscribers" name="登録者数" fill="#8B5CF6" />
                      <Bar dataKey="avgViews" name="平均再生回数" fill="#06B6D4" />
                      <Bar dataKey="videoCount" name="動画数" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selectedMetric === 'growth' && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="monthlyGrowth" name="月間成長率 (%)" stroke="#8B5CF6" strokeWidth={3} />
                      <Line type="monotone" dataKey="weeklyGrowth" name="週間成長率 (%)" stroke="#06B6D4" strokeWidth={3} />
                      <Line type="monotone" dataKey="acceleration" name="成長加速度" stroke="#F59E0B" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selectedMetric === 'engagement' && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getEngagementData()}>
                      <PolarGrid stroke="rgba(156, 163, 175, 0.2)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      {channels.map((channelData, index) => (
                        <Radar
                          key={channelData.channel.id}
                          name={channelData.channel.name}
                          dataKey={`channel${index}`}
                          stroke={channelData.color}
                          fill={channelData.color}
                          fillOpacity={0.3}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selectedMetric === 'performance' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    各メトリクスは最高値を100として正規化されています
                  </div>
                  {getPerformanceData().map((channelPerf, index) => (
                    <div key={channels[index].channel.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: channels[index].color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {channelPerf.name}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {[
                          { label: '登録者数', value: channelPerf.subscribers },
                          { label: '平均再生回数', value: channelPerf.avgViews },
                          { label: 'エンゲージメント', value: channelPerf.engagement },
                          { label: '成長率', value: channelPerf.growth },
                          { label: '動画数', value: channelPerf.videos }
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-24">{label}</span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: channels[index].color }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {value.toFixed(3)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Empty State */}
      {channels.length === 0 && (
        <div className="text-center py-12 neo-card rounded-xl">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            チャンネルを追加して比較開始
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            複数のチャンネルを追加して、成長率、エンゲージメント、パフォーマンスを比較分析しましょう
          </p>
        </div>
      )}

      {/* Need More Channels */}
      {channels.length === 1 && (
        <div className="text-center py-8 neo-card rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            比較するには最低2つのチャンネルが必要です
          </p>
        </div>
      )}
    </div>
  )
}