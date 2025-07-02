'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Lightbulb,
  Calendar,
  BarChart3,
  Users,
  Eye,
  Zap,
  Award,
  AlertCircle
} from 'lucide-react'
import { MonetizationAnalysis } from '@/types/channel'

interface MonetizationAnalysisProps {
  monetizationData: MonetizationAnalysis
  isLoading?: boolean
}

type TimeframeType = 'threeMonths' | 'sixMonths' | 'oneYear'

export function MonetizationAnalysisComponent({ monetizationData, isLoading }: MonetizationAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('sixMonths')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getProjection = (timeframe: TimeframeType) => {
    switch (timeframe) {
      case 'threeMonths':
        return monetizationData.projections.threeMonths
      case 'sixMonths':
        return monetizationData.projections.sixMonths
      case 'oneYear':
        return monetizationData.projections.oneYear
      default:
        return monetizationData.projections.sixMonths
    }
  }

  const getTimeframeLabel = (timeframe: TimeframeType) => {
    switch (timeframe) {
      case 'threeMonths':
        return '3ヶ月後'
      case 'sixMonths':
        return '6ヶ月後'
      case 'oneYear':
        return '1年後'
      default:
        return '6ヶ月後'
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20'
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20'
    }
  }

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />
      case 'medium':
        return <Clock className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
          <div className="h-40 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="neo-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              収益化分析
            </h3>
            <p className="text-sm text-gray-500">
              収益ポテンシャルと最適化戦略
            </p>
          </div>
        </div>

        {/* Priority Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getPriorityColor(monetizationData.recommendations.priority)}`}>
          {getPriorityIcon(monetizationData.recommendations.priority)}
          {monetizationData.recommendations.priority.toUpperCase()} 優先度
        </div>
      </div>

      {/* Eligibility Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* YouTube Eligibility */}
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">YT</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              YouTube収益化
            </span>
            {monetizationData.eligibilityStatus.youtube.eligible ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">登録者数 (1,000+)</span>
              <div className="flex items-center gap-1">
                {monetizationData.eligibilityStatus.youtube.subscribers ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={monetizationData.eligibilityStatus.youtube.subscribers ? 'text-green-600' : 'text-red-600'}>
                  {monetizationData.eligibilityStatus.youtube.subscribers ? '達成' : '未達成'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">視聴時間 (4,000時間)</span>
              <div className="flex items-center gap-1">
                {monetizationData.eligibilityStatus.youtube.watchHours ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={monetizationData.eligibilityStatus.youtube.watchHours ? 'text-green-600' : 'text-red-600'}>
                  {monetizationData.eligibilityStatus.youtube.watchHours ? '達成' : '未達成'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TikTok Eligibility */}
        <div className="p-4 bg-gradient-to-r from-black/5 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black text-xs font-bold">TT</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              TikTok収益化
            </span>
            {monetizationData.eligibilityStatus.tiktok.eligible ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">フォロワー数 (1,000+)</span>
              <div className="flex items-center gap-1">
                {monetizationData.eligibilityStatus.tiktok.followers ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={monetizationData.eligibilityStatus.tiktok.followers ? 'text-green-600' : 'text-red-600'}>
                  {monetizationData.eligibilityStatus.tiktok.followers ? '達成' : '未達成'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">総再生回数 (10,000+)</span>
              <div className="flex items-center gap-1">
                {monetizationData.eligibilityStatus.tiktok.views ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={monetizationData.eligibilityStatus.tiktok.views ? 'text-green-600' : 'text-red-600'}>
                  {monetizationData.eligibilityStatus.tiktok.views ? '達成' : '未達成'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Estimates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Revenue */}
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              月間収益推定
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatCurrency(monetizationData.revenueEstimate.monthly.min)} - {formatCurrency(monetizationData.revenueEstimate.monthly.max)}
          </div>
          <div className="text-sm text-gray-500">
            現在のレベル
          </div>
        </div>

        {/* CPM Rate */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Eye className="w-6 h-6 text-blue-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              CPM レート
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatCurrency(monetizationData.revenueEstimate.cpmRate)}
          </div>
          <div className="text-sm text-gray-500">
            1,000回表示あたり
          </div>
        </div>

        {/* Sponsorship Value */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award className="w-6 h-6 text-purple-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              スポンサー価値
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {formatCurrency(monetizationData.revenueEstimate.sponsorshipValue)}
          </div>
          <div className="text-sm text-gray-500">
            1件あたり推定
          </div>
        </div>
      </div>

      {/* Future Projections */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            収益予測
          </h4>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            {(['threeMonths', 'sixMonths', 'oneYear'] as const).map((timeframe) => (
              <motion.button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === timeframe
                    ? 'neo-gradient text-white shadow-lg'
                    : 'neo-button hover:scale-105'
                }`}
                whileHover={{ scale: selectedTimeframe === timeframe ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getTimeframeLabel(timeframe)}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTimeframe}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center p-6 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-xl border border-neo-light/20"
          >
            <div className="text-3xl font-bold text-neo-purple mb-2">
              {formatCurrency(getProjection(selectedTimeframe))}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getTimeframeLabel(selectedTimeframe)}の月間収益予測
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            収益化戦略
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {monetizationData.recommendations.nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="w-6 h-6 rounded-full bg-neo-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {step}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-orange-800 dark:text-orange-300">
              実装タイムライン
            </span>
          </div>
          <p className="text-orange-700 dark:text-orange-300">
            {monetizationData.recommendations.timeline}
          </p>
        </div>
      </div>
    </motion.div>
  )
}