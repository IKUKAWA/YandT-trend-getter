'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  TrendingUp,
  Eye,
  Zap,
  Trophy,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Youtube,
  Music2,
  Crown,
  Medal,
  Award
} from 'lucide-react'
import { CompetitorComparison, CompetitorChannel } from '@/types/channel'

interface CompetitorComparisonProps {
  competitorData: CompetitorComparison
  isLoading?: boolean
}

type SortKey = 'subscriberCount' | 'monthlyGrowthRate' | 'avgViews' | 'engagementRate' | 'strengthScore'
type SortOrder = 'asc' | 'desc'

export function CompetitorComparisonComponent({ competitorData, isLoading }: CompetitorComparisonProps) {
  const [sortKey, setSortKey] = useState<SortKey>('subscriberCount')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedMetric, setSelectedMetric] = useState<SortKey>('subscriberCount')

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(3)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(3)}K`
    }
    return num.toLocaleString()
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(3)}%`
  }

  const getPlatformIcon = (platform: 'youtube' | 'tiktok') => {
    return platform === 'youtube' ? Youtube : Music2
  }

  const getPlatformColor = (platform: 'youtube' | 'tiktok') => {
    return platform === 'youtube' ? 'text-red-500' : 'text-black dark:text-white'
  }

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">#{position}</span>
    }
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const sortedCompetitors = [...competitorData.competitors].sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    
    if (sortOrder === 'desc') {
      return (bValue as number) - (aValue as number)
    } else {
      return (aValue as number) - (bValue as number)
    }
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const metrics = [
    { key: 'subscriberCount' as SortKey, label: '登録者数', icon: Users, format: formatNumber },
    { key: 'monthlyGrowthRate' as SortKey, label: '月間成長率', icon: TrendingUp, format: formatPercentage },
    { key: 'avgViews' as SortKey, label: '平均再生回数', icon: Eye, format: formatNumber },
    { key: 'engagementRate' as SortKey, label: 'エンゲージメント率', icon: Zap, format: (val: number) => `${(val * 100).toFixed(3)}%` },
    { key: 'strengthScore' as SortKey, label: '総合スコア', icon: BarChart3, format: (val: number) => `${val}/100` }
  ]

  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="neo-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              競合分析
            </h3>
            <p className="text-sm text-gray-500">
              同カテゴリーチャンネルとの比較
            </p>
          </div>
        </div>

        {/* Industry Position */}
        <div className="text-right">
          <div className="text-2xl font-bold text-neo-purple">
            #{competitorData.industryRanking}
          </div>
          <div className="text-sm text-gray-500">
            業界ランキング
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {competitorData.totalChannelsInCategory.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            カテゴリ内チャンネル数
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {competitorData.marketShare.toFixed(3)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            マーケットシェア
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {competitorData.competitors.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            主要競合数
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMetric === key
                ? 'neo-gradient text-white shadow-lg'
                : 'neo-button hover:scale-105'
            }`}
            whileHover={{ scale: selectedMetric === key ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Competitors Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ランク
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                チャンネル
              </th>
              {metrics.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sortKey === key && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                      </motion.div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Main Channel Row */}
            <motion.tr
              className="bg-gradient-to-r from-neo-light/5 to-neo-dark/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <td className="px-4 py-4">
                {getRankingIcon(competitorData.industryRanking)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neo-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ME</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {competitorData.mainChannel.channelName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {competitorData.mainChannel.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 font-medium text-neo-purple">
                {formatNumber(competitorData.mainChannel.subscriberCount)}
              </td>
              <td className="px-4 py-4 font-medium text-neo-purple">-</td>
              <td className="px-4 py-4 font-medium text-neo-purple">-</td>
              <td className="px-4 py-4 font-medium text-neo-purple">-</td>
              <td className="px-4 py-4 font-medium text-neo-purple">-</td>
            </motion.tr>

            {/* Competitor Rows */}
            <AnimatePresence>
              {sortedCompetitors.map((competitor, index) => {
                const PlatformIcon = getPlatformIcon(competitor.platform)
                
                return (
                  <motion.tr
                    key={competitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      {getRankingIcon(competitor.rankingPosition)}
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <PlatformIcon className={`w-4 h-4 ${getPlatformColor(competitor.platform)}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {competitor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {competitor.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatNumber(competitor.subscriberCount)}
                        </span>
                        {competitor.subscriberCount > competitorData.mainChannel.subscriberCount && (
                          <ArrowUp className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatPercentage(competitor.monthlyGrowthRate)}
                        </span>
                        {getChangeIcon(competitor.monthlyGrowthRate)}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(competitor.avgViews)}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {(competitor.engagementRate * 100).toFixed(3)}%
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-neo-purple to-neo-pink h-2 rounded-full"
                            style={{ width: `${competitor.strengthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {competitor.strengthScore}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Competitive Analysis */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advantages */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            競合優位性
          </h4>
          <ul className="space-y-2">
            {competitorData.competitiveAdvantages.map((advantage, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                {advantage}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            改善ポイント
          </h4>
          <ul className="space-y-2">
            {competitorData.weaknesses.map((weakness, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-orange-500 rounded-full" />
                {weakness}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}