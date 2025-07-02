'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Users,
  Eye,
  TrendingUp,
  Bell,
  Settings,
  Pause,
  Play,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react'
import { ChannelSearchResult, ChannelAnalysis } from '@/types/channel'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { getChannelAnalysis, getChannelGrowthAnalysis } from '@/lib/data/channelData'

interface RealtimeChannelMonitorProps {
  channel: ChannelSearchResult
  onDataUpdate?: (analysis: ChannelAnalysis) => void
}

interface UpdateNotification {
  id: string
  type: 'growth' | 'engagement' | 'milestone' | 'alert'
  message: string
  timestamp: Date
  value?: number
  change?: number
}

export function RealtimeChannelMonitor({ channel, onDataUpdate }: RealtimeChannelMonitorProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [updateInterval, setUpdateInterval] = useState(30000) // 30 seconds
  const [currentData, setCurrentData] = useState<ChannelAnalysis | null>(null)
  const [previousData, setPreviousData] = useState<ChannelAnalysis | null>(null)
  const [notifications, setNotifications] = useState<UpdateNotification[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [alertThresholds, setAlertThresholds] = useState({
    subscriberChange: 100,
    viewsChange: 1000,
    engagementChange: 0.5
  })

  // Fetch latest data
  const fetchLatestData = useCallback(async () => {
    try {
      const [analysis, growthData] = await Promise.all([
        getChannelAnalysis(channel.id, {
          depth: 'basic',
          refresh: true
        }),
        getChannelGrowthAnalysis(channel.id, {
          timeRange: '3months',
          includeProjections: false
        })
      ])

      const newAnalysis: ChannelAnalysis = {
        ...analysis,
        growthAnalysis: growthData
      }

      // Compare with previous data
      if (previousData) {
        checkForNotifications(previousData, newAnalysis)
      }

      setPreviousData(currentData)
      setCurrentData(newAnalysis)
      onDataUpdate?.(newAnalysis)

    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
      addNotification({
        type: 'alert',
        message: 'データの取得に失敗しました',
        timestamp: new Date()
      })
    }
  }, [channel.id, currentData, previousData, onDataUpdate])

  // Use realtime updates hook
  const {
    isUpdating,
    lastUpdate,
    updateCount,
    triggerUpdate,
    nextUpdateIn
  } = useRealtimeUpdates({
    enabled: isEnabled,
    interval: updateInterval,
    onUpdate: fetchLatestData,
    onError: (error) => {
      console.error('Realtime update error:', error)
      addNotification({
        type: 'alert',
        message: 'リアルタイム更新エラー',
        timestamp: new Date()
      })
    }
  })

  // Check for significant changes and create notifications
  const checkForNotifications = (oldData: ChannelAnalysis, newData: ChannelAnalysis) => {
    const oldSubs = oldData.basicInfo.subscriberCount
    const newSubs = newData.basicInfo.subscriberCount
    const subChange = newSubs - oldSubs

    const oldViews = oldData.growthAnalysis.current.avgViews
    const newViews = newData.growthAnalysis.current.avgViews
    const viewChange = newViews - oldViews

    const oldEngagement = oldData.growthAnalysis.current.engagementRate
    const newEngagement = newData.growthAnalysis.current.engagementRate
    const engagementChange = (newEngagement - oldEngagement) * 100

    // Subscriber milestone check
    if (Math.abs(subChange) >= alertThresholds.subscriberChange) {
      addNotification({
        type: 'growth',
        message: `登録者数が${subChange > 0 ? '+' : ''}${subChange.toLocaleString()}人変化しました`,
        timestamp: new Date(),
        value: newSubs,
        change: subChange
      })
    }

    // Check for milestone achievements
    const milestones = [100000, 500000, 1000000, 5000000, 10000000]
    milestones.forEach(milestone => {
      if (oldSubs < milestone && newSubs >= milestone) {
        addNotification({
          type: 'milestone',
          message: `🎉 ${(milestone / 10000).toFixed(3)}万人突破！`,
          timestamp: new Date(),
          value: newSubs
        })
      }
    })

    // Views change
    if (Math.abs(viewChange) >= alertThresholds.viewsChange) {
      addNotification({
        type: 'engagement',
        message: `平均再生回数が${viewChange > 0 ? '+' : ''}${viewChange.toLocaleString()}回変化`,
        timestamp: new Date(),
        value: newViews,
        change: viewChange
      })
    }

    // Engagement rate change
    if (Math.abs(engagementChange) >= alertThresholds.engagementChange) {
      addNotification({
        type: 'engagement',
        message: `エンゲージメント率が${engagementChange > 0 ? '+' : ''}${engagementChange.toFixed(3)}%変化`,
        timestamp: new Date(),
        value: newEngagement * 100,
        change: engagementChange
      })
    }
  }

  const addNotification = (notification: Omit<UpdateNotification, 'id'>) => {
    const newNotification: UpdateNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)) // Keep last 10
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(3)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(3)}K`
    return num.toString()
  }

  const formatTimeRemaining = (ms: number | null) => {
    if (!ms) return '--:--'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="neo-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {isEnabled ? (
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                リアルタイムモニタリング
              </h3>
              <p className="text-sm text-gray-500">
                {channel.name}のデータを自動更新
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 neo-button rounded-lg"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <motion.button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isEnabled
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'neo-gradient text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEnabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  開始
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {isEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    次回更新: {formatTimeRemaining(nextUpdateIn)}
                  </span>
                </div>
                
                {isUpdating && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>更新中...</span>
                  </div>
                )}
              </>
            )}
            
            {lastUpdate && (
              <div className="text-gray-500">
                最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
              </div>
            )}
          </div>

          {updateCount > 0 && (
            <div className="text-gray-500">
              更新回数: {updateCount}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="neo-card p-4 overflow-hidden"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              モニタリング設定
            </h4>
            
            <div className="space-y-4">
              {/* Update Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  更新間隔
                </label>
                <select
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value={10000}>10秒</option>
                  <option value={30000}>30秒</option>
                  <option value={60000}>1分</option>
                  <option value={300000}>5分</option>
                  <option value={600000}>10分</option>
                </select>
              </div>

              {/* Alert Thresholds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  アラートしきい値
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-32">
                      登録者数変化
                    </span>
                    <input
                      type="number"
                      value={alertThresholds.subscriberChange}
                      onChange={(e) => setAlertThresholds(prev => ({
                        ...prev,
                        subscriberChange: Number(e.target.value)
                      }))}
                      className="flex-1 p-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-32">
                      再生回数変化
                    </span>
                    <input
                      type="number"
                      value={alertThresholds.viewsChange}
                      onChange={(e) => setAlertThresholds(prev => ({
                        ...prev,
                        viewsChange: Number(e.target.value)
                      }))}
                      className="flex-1 p-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-32">
                      エンゲージメント率
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={alertThresholds.engagementChange}
                      onChange={(e) => setAlertThresholds(prev => ({
                        ...prev,
                        engagementChange: Number(e.target.value)
                      }))}
                      className="flex-1 p-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Metrics */}
      {currentData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="neo-card p-4 text-center"
            animate={{
              scale: previousData && currentData.basicInfo.subscriberCount !== previousData.basicInfo.subscriberCount
                ? [1, 1.05, 1]
                : 1
            }}
          >
            <Users className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(currentData.basicInfo.subscriberCount)}
            </div>
            <div className="text-sm text-gray-500">登録者数</div>
            {previousData && currentData.basicInfo.subscriberCount !== previousData.basicInfo.subscriberCount && (
              <div className={`text-xs mt-1 ${
                currentData.basicInfo.subscriberCount > previousData.basicInfo.subscriberCount
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {currentData.basicInfo.subscriberCount > previousData.basicInfo.subscriberCount ? '+' : ''}
                {currentData.basicInfo.subscriberCount - previousData.basicInfo.subscriberCount}
              </div>
            )}
          </motion.div>

          <motion.div
            className="neo-card p-4 text-center"
            animate={{
              scale: previousData && currentData.growthAnalysis.current.avgViews !== previousData.growthAnalysis.current.avgViews
                ? [1, 1.05, 1]
                : 1
            }}
          >
            <Eye className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(currentData.growthAnalysis.current.avgViews)}
            </div>
            <div className="text-sm text-gray-500">平均再生回数</div>
          </motion.div>

          <motion.div
            className="neo-card p-4 text-center"
            animate={{
              scale: previousData && currentData.growthAnalysis.current.engagementRate !== previousData.growthAnalysis.current.engagementRate
                ? [1, 1.05, 1]
                : 1
            }}
          >
            <Zap className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(currentData.growthAnalysis.current.engagementRate * 100).toFixed(3)}%
            </div>
            <div className="text-sm text-gray-500">エンゲージメント率</div>
          </motion.div>

          <motion.div className="neo-card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentData.growthAnalysis.monthlyGrowthRate > 0 ? '+' : ''}
              {currentData.growthAnalysis.monthlyGrowthRate}%
            </div>
            <div className="text-sm text-gray-500">月間成長率</div>
          </motion.div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="neo-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              最新の通知
            </h4>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    notification.type === 'alert'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : notification.type === 'milestone'
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : notification.type === 'growth'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    notification.type === 'alert'
                      ? 'bg-red-500'
                      : notification.type === 'milestone'
                      ? 'bg-purple-500'
                      : notification.type === 'growth'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString('ja-JP')}
                    </p>
                  </div>
                  
                  {notification.change !== undefined && (
                    <div className={`text-sm font-medium ${
                      notification.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {notification.change > 0 ? '+' : ''}{notification.change.toLocaleString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Manual Refresh Button */}
      <button
        onClick={triggerUpdate}
        disabled={isUpdating}
        className="w-full neo-button py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
        今すぐ更新
      </button>
    </div>
  )
}