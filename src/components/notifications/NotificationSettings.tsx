'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Volume2, 
  Monitor, 
  Mail, 
  Shield, 
  TrendingUp, 
  Users, 
  Activity,
  Database,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useNotifications, NotificationSettings as SettingsType } from '@/context/NotificationContext'

interface NotificationSettingsProps {
  onClose?: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { settings, updateSettings } = useNotifications()

  const categoryConfig = [
    {
      key: 'system' as const,
      label: 'システム',
      description: 'システムの状態とエラー',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      key: 'trends' as const,
      label: 'トレンド',
      description: '新しいトレンドと分析結果',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      key: 'users' as const,
      label: 'ユーザー',
      description: 'ユーザー登録と活動',
      icon: Users,
      color: 'text-green-600'
    },
    {
      key: 'security' as const,
      label: 'セキュリティ',
      description: 'セキュリティアラートと認証',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      key: 'performance' as const,
      label: 'パフォーマンス',
      description: 'システムパフォーマンスと監視',
      icon: Activity,
      color: 'text-orange-600'
    }
  ]

  const priorityConfig = [
    {
      key: 'urgent' as const,
      label: '緊急',
      description: '即座の対応が必要',
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      key: 'high' as const,
      label: '高',
      description: '重要な通知',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      key: 'medium' as const,
      label: '中',
      description: '一般的な通知',
      icon: Info,
      color: 'text-blue-600'
    },
    {
      key: 'low' as const,
      label: '低',
      description: '情報提供のみ',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ]

  const handleToggle = (
    section: keyof SettingsType,
    key?: string
  ) => {
    if (key && typeof settings[section] === 'object') {
      updateSettings({
        [section]: {
          ...settings[section] as object,
          [key]: !((settings[section] as any)[key])
        }
      })
    } else {
      updateSettings({
        [section]: !settings[section]
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            通知設定
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            通知の受信方法と種類をカスタマイズ
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            基本設定
          </h3>
          <div className="space-y-4">
            {/* Enable Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    通知を有効にする
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    すべての通知の受信を制御
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    音声通知
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    通知音を再生
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sound')}
                disabled={!settings.enabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sound && settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!settings.enabled ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sound && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    デスクトップ通知
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ブラウザの通知機能を使用
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('desktop')}
                disabled={!settings.enabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.desktop && settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!settings.enabled ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.desktop && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    メール通知
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    重要な通知をメールで受信
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email')}
                disabled={!settings.enabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.email && settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!settings.enabled ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.email && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            カテゴリ別設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryConfig.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('categories', category.key)}
                    disabled={!settings.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.categories[category.key] && settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                    } ${!settings.enabled ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.categories[category.key] && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priorities */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            優先度別設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityConfig.map((priority) => {
              const Icon = priority.icon
              return (
                <div
                  key={priority.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-700/30 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${priority.color}`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {priority.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {priority.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('priorities', priority.key)}
                    disabled={!settings.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.priorities[priority.key] && settings.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                    } ${!settings.enabled ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.priorities[priority.key] && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Test Notification */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            通知テスト
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            設定した通知が正常に動作するかテストできます
          </p>
          <button
            onClick={() => {
              // This would trigger a test notification
              console.log('Test notification triggered')
            }}
            disabled={!settings.enabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.enabled
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            テスト通知を送信
          </button>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      )}
    </motion.div>
  )
}