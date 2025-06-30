'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Users, 
  Shield,
  Clock,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success' | 'trend' | 'system'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'system' | 'trends' | 'users' | 'security' | 'performance'
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  metadata?: {
    source?: string
    url?: string
    data?: any
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNotificationRead?: (id: string) => void
  onNotificationAction?: (id: string, action: string) => void
}

export function NotificationCenter({
  isOpen,
  onClose,
  onNotificationRead,
  onNotificationAction
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'システム負荷上昇',
      message: 'CPU使用率が85%を超えています。システムパフォーマンスの監視が必要です。',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      priority: 'high',
      category: 'system',
      actions: [
        { label: 'ダッシュボードを確認', action: () => console.log('View dashboard'), variant: 'primary' },
        { label: '詳細を表示', action: () => console.log('View details'), variant: 'secondary' }
      ],
      metadata: { source: 'System Monitor', data: { cpu: 87.5, memory: 65.2 } }
    },
    {
      id: '2',
      type: 'trend',
      title: '急上昇トレンド検出',
      message: '「AI技術」カテゴリで300%の視聴数増加を検出しました。',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      priority: 'medium',
      category: 'trends',
      actions: [
        { label: 'トレンドを表示', action: () => console.log('View trend'), variant: 'primary' }
      ],
      metadata: { source: 'Trend Analyzer', data: { category: 'AI技術', growth: 300 } }
    },
    {
      id: '3',
      type: 'error',
      title: 'API接続エラー',
      message: 'YouTube APIとの接続に失敗しました。データ同期が停止しています。',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      priority: 'urgent',
      category: 'system',
      actions: [
        { label: '再接続を試行', action: () => console.log('Retry connection'), variant: 'primary' },
        { label: '設定を確認', action: () => console.log('Check settings'), variant: 'secondary' }
      ],
      metadata: { source: 'API Client', url: '/api/youtube' }
    },
    {
      id: '4',
      type: 'success',
      title: 'データベース最適化完了',
      message: 'スケジュールされたデータベース最適化が正常に完了しました。',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low',
      category: 'system',
      metadata: { source: 'Database Optimizer' }
    },
    {
      id: '5',
      type: 'info',
      title: '新規ユーザー登録',
      message: '過去24時間で15人の新規ユーザーが登録されました。',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: false,
      priority: 'low',
      category: 'users',
      actions: [
        { label: 'ユーザー一覧を表示', action: () => console.log('View users'), variant: 'primary' }
      ],
      metadata: { source: 'User Manager', data: { newUsers: 15 } }
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'important' && ['high', 'urgent'].includes(notification.priority))
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      notification.category === selectedCategory

    return matchesFilter && matchesCategory
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'error': return XCircle
      case 'success': return CheckCircle
      case 'trend': return TrendingUp
      case 'system': return Shield
      default: return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'trend': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'system': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500'
      case 'high': return 'border-l-4 border-orange-500'
      case 'medium': return 'border-l-4 border-yellow-500'
      default: return 'border-l-4 border-gray-300'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '今すぐ'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    return `${diffDays}日前`
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
    if (onNotificationRead) {
      onNotificationRead(id)
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      通知センター
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount}件の未読通知
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: '全て' },
                    { key: 'unread', label: '未読' },
                    { key: 'important', label: '重要' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key as any)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        filter === option.key
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : 'bg-white/20 hover:bg-white/30 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                >
                  <option value="all">全てのカテゴリ</option>
                  <option value="system">システム</option>
                  <option value="trends">トレンド</option>
                  <option value="users">ユーザー</option>
                  <option value="security">セキュリティ</option>
                  <option value="performance">パフォーマンス</option>
                </select>
              </div>

              {/* Quick Actions */}
              {unreadCount > 0 && (
                <div className="mt-3">
                  <button
                    onClick={markAllAsRead}
                    className="w-full px-3 py-2 text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                  >
                    すべて既読にする
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    通知がありません
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    新しい通知が届くとここに表示されます
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotifications.map((notification) => {
                    const TypeIcon = getTypeIcon(notification.type)
                    
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all cursor-pointer ${
                          getPriorityIndicator(notification.priority)
                        } ${!notification.isRead ? 'ring-2 ring-purple-500/20' : ''}`}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(notification.type)} flex-shrink-0`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`font-medium text-gray-900 dark:text-white ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="p-1 rounded hover:bg-white/20 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                              {notification.metadata?.source && (
                                <>
                                  <span>•</span>
                                  <span>{notification.metadata.source}</span>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      action.action()
                                      if (onNotificationAction) {
                                        onNotificationAction(notification.id, action.label)
                                      }
                                    }}
                                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                      action.variant === 'primary' 
                                        ? 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30' :
                                      action.variant === 'danger'
                                        ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30' :
                                        'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                                    }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}