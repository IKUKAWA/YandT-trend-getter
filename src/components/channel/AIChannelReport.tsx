'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Eye,
  Calendar,
  Sparkles,
  Star,
  Zap
} from 'lucide-react'
import { AIChannelReport } from '@/types/channel'

interface AIChannelReportProps {
  aiReport: AIChannelReport
  isLoading?: boolean
}

type ReportSection = 'summary' | 'growth' | 'competition' | 'monetization' | 'actions'

export function AIChannelReportComponent({ aiReport, isLoading }: AIChannelReportProps) {
  const [activeSection, setActiveSection] = useState<ReportSection>('summary')
  const [isGenerating, setIsGenerating] = useState(false)

  const sections = [
    { key: 'summary' as ReportSection, label: '要約', icon: Brain },
    { key: 'growth' as ReportSection, label: '成長要因', icon: TrendingUp },
    { key: 'competition' as ReportSection, label: '競合分析', icon: Target },
    { key: 'monetization' as ReportSection, label: '収益化戦略', icon: DollarSign },
    { key: 'actions' as ReportSection, label: 'アクション', icon: CheckCircle }
  ]

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
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

  const handleRegenerateReport = async () => {
    setIsGenerating(true)
    // Simulate AI report generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGenerating(false)
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return '日付不明'
    }
  }

  if (isLoading) {
    return (
      <div className="neo-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded" />
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="neo-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              AI分析レポート
            </h3>
            <p className="text-sm text-gray-500">
              Claude AIによる包括的チャンネル分析
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Confidence Score */}
          <div className="text-center">
            <div className="text-2xl font-bold text-neo-purple">
              {aiReport.confidenceScore}%
            </div>
            <div className="text-xs text-gray-500">信頼度</div>
          </div>

          {/* Regenerate Button */}
          <motion.button
            onClick={handleRegenerateReport}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isGenerating
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'neo-gradient text-white hover:scale-105'
            }`}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                更新
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-neo-light/5 to-neo-dark/5 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          最終更新: {formatDate(aiReport.reportDate)}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(aiReport.confidenceScore / 20)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            分析品質
          </span>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === key
                ? 'neo-gradient text-white shadow-lg'
                : 'neo-button hover:scale-105'
            }`}
            whileHover={{ scale: activeSection === key ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300">
                    総合分析サマリー
                  </h4>
                </div>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  {aiReport.summary}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">
                    競合分析インサイト
                  </h4>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  {aiReport.competitiveInsights}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'growth' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h4 className="text-lg font-bold text-green-800 dark:text-green-300">
                    成長要因分析
                  </h4>
                </div>
                <ul className="space-y-3">
                  {aiReport.growthFactors.map((factor, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-green-700 dark:text-green-300">{factor}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'competition' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-orange-500" />
                  <h4 className="text-lg font-bold text-orange-800 dark:text-orange-300">
                    差別化ポイント
                  </h4>
                </div>
                <ul className="space-y-3">
                  {aiReport.differentiationPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-orange-700 dark:text-orange-300">{point}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'monetization' && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  <h4 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    収益化戦略
                  </h4>
                </div>
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
                  {aiReport.monetizationStrategy}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-gray-500" />
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-300">
                    推奨アクションプラン
                  </h4>
                </div>
                <div className="space-y-4">
                  {aiReport.actionItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {item.action}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.expectedImpact}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {getPriorityIcon(item.priority)}
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>実装期間: {item.timeline}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Report Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Claude AI (Sonnet 4) による分析</span>
          </div>
          <div className="flex items-center gap-2">
            <span>信頼度: {aiReport.confidenceScore}%</span>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neo-purple to-neo-pink"
                style={{ width: `${aiReport.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}