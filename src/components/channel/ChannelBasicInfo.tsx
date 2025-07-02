'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Video,
  Calendar,
  CheckCircle,
  Youtube,
  Music2,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  Trophy,
  Zap,
  Clock
} from 'lucide-react'
import { ChannelBasicInfo, ChannelGrowthAnalysis } from '@/types/channel'

interface ChannelBasicInfoProps {
  channelInfo: ChannelBasicInfo
  growthAnalysis?: ChannelGrowthAnalysis
  isLoading?: boolean
}

export function ChannelBasicInfoCard({ channelInfo, growthAnalysis, isLoading }: ChannelBasicInfoProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(3)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(3)}K`
    }
    return num.toLocaleString()
  }

  const formatDate = (date: Date | string | number) => {
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return '日付不明'
      }
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return '日付不明'
    }
  }

  const calculateYearsAgo = (date: Date | string | number) => {
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return '不明'
      }
      const years = Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24 * 365))
      return years > 0 ? `${years}年前` : '1年未満'
    } catch (error) {
      console.warn('Date calculation error:', error)
      return '不明'
    }
  }

  const getPlatformIcon = () => {
    return channelInfo.platform === 'youtube' ? Youtube : Music2
  }

  const getPlatformColor = () => {
    return channelInfo.platform === 'youtube' ? 'text-red-500' : 'text-black dark:text-white'
  }

  const getPlatformGradient = () => {
    return channelInfo.platform === 'youtube' 
      ? 'from-red-500 to-red-600' 
      : 'from-gray-800 to-black'
  }

  const getTrendIcon = () => {
    if (!growthAnalysis) return null
    
    switch (growthAnalysis.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-0.5 bg-gray-400 rounded" />
    }
  }

  const getTrendColor = () => {
    if (!growthAnalysis) return 'text-gray-500'
    
    switch (growthAnalysis.trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="flex-1">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const PlatformIcon = getPlatformIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="neo-card p-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getPlatformGradient()} flex items-center justify-center shadow-lg`}>
          <PlatformIcon className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {channelInfo.channelName}
            </h2>
            {channelInfo.verified && (
              <CheckCircle className="w-5 h-5 text-blue-500" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getPlatformColor()}`}>
              {channelInfo.platform.toUpperCase()}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {channelInfo.category}
          </div>
          
          {channelInfo.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {channelInfo.description}
            </p>
          )}
        </div>

        {growthAnalysis && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {growthAnalysis.monthlyGrowthRate > 0 ? '+' : ''}{growthAnalysis.monthlyGrowthRate}%
              </span>
            </div>
            <div className="text-xs text-gray-500">月間成長率</div>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Subscribers */}
        <motion.div
          className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              登録者数
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatNumber(channelInfo.subscriberCount)}
          </div>
          {growthAnalysis && (
            <div className="text-xs text-gray-500 mt-1">
              ランク変動: {growthAnalysis.rankingChange > 0 ? '+' : ''}{growthAnalysis.rankingChange}
            </div>
          )}
        </motion.div>

        {/* Video Count */}
        <motion.div
          className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              動画数
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {channelInfo.videoCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            総投稿数
          </div>
        </motion.div>

        {/* Average Views */}
        {growthAnalysis && (
          <motion.div
            className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                平均再生回数
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(growthAnalysis.current.avgViews)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              動画あたり
            </div>
          </motion.div>
        )}

        {/* Engagement Rate */}
        {growthAnalysis && (
          <motion.div
            className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                エンゲージメント率
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(growthAnalysis.current.engagementRate * 100).toFixed(3)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              業界平均比較
            </div>
          </motion.div>
        )}
      </div>

      {/* Growth Insights */}
      {growthAnalysis && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Next Milestone */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  次のマイルストーン
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(growthAnalysis.milestones.nextSubscriberMilestone)}
              </div>
              <div className="text-xs text-gray-500">
                推定{growthAnalysis.milestones.timeToMilestone}日後
              </div>
            </div>

            {/* Channel Age */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  開設日
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatDate(channelInfo.createdDate)}
              </div>
              <div className="text-xs text-gray-500">
                {calculateYearsAgo(channelInfo.createdDate)}
              </div>
            </div>

            {/* Trend Strength */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-neo-purple" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  トレンド強度
                </span>
              </div>
              <div className="text-lg font-bold text-neo-purple">
                {growthAnalysis.trendStrength}/10
              </div>
              <div className="text-xs text-gray-500">
                成長の安定性
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}