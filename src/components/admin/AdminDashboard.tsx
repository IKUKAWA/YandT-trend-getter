'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface SystemStats {
  totalTrends: number
  totalUsers: number
  apiCalls: number
  storageUsed: number
  uptime: string
  lastUpdate: string
  errorRate: number
  avgResponseTime: number
}

interface AdminDashboardProps {
  userRole?: 'admin' | 'moderator' | 'viewer'
  onNavigate?: (section: string) => void
}

export function AdminDashboard({
  userRole = 'admin',
  onNavigate
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview')
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalTrends: 15847,
    totalUsers: 1247,
    apiCalls: 125463,
    storageUsed: 78.5,
    uptime: '15 days, 8 hours',
    lastUpdate: '2024-12-30 14:30:22',
    errorRate: 0.15,
    avgResponseTime: 234
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  const menuItems = [
    { 
      id: 'overview', 
      label: 'システム概要', 
      icon: BarChart3, 
      description: 'システム全体の統計と健全性',
      permission: ['admin', 'moderator', 'viewer']
    },
    { 
      id: 'users', 
      label: 'ユーザー管理', 
      icon: Users, 
      description: 'ユーザーアカウントとアクセス権限',
      permission: ['admin', 'moderator']
    },
    { 
      id: 'trends', 
      label: 'トレンド管理', 
      icon: TrendingUp, 
      description: 'トレンドデータの管理と品質確認',
      permission: ['admin', 'moderator', 'viewer']
    },
    { 
      id: 'api', 
      label: 'API管理', 
      icon: Database, 
      description: 'API使用状況とレート制限',
      permission: ['admin']
    },
    { 
      id: 'monitoring', 
      label: 'モニタリング', 
      icon: Activity, 
      description: 'システムパフォーマンスとログ',
      permission: ['admin', 'moderator']
    },
    { 
      id: 'security', 
      label: 'セキュリティ', 
      icon: Shield, 
      description: 'セキュリティ設定とアクセスログ',
      permission: ['admin']
    },
    { 
      id: 'settings', 
      label: 'システム設定', 
      icon: Settings, 
      description: 'アプリケーション全体の設定',
      permission: ['admin']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.permission.includes(userRole)
  )

  const refreshStats = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSystemStats(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + Math.floor(Math.random() * 1000),
      avgResponseTime: 200 + Math.floor(Math.random() * 100),
      lastUpdate: new Date().toLocaleString('ja-JP')
    }))
    setIsRefreshing(false)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    if (onNavigate) {
      onNavigate(section)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  管理者ダッシュボード
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  システム管理とデータ分析 - {userRole.toUpperCase()}権限
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Data Visibility Toggle */}
              <button
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {showSensitiveData ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {showSensitiveData ? '詳細非表示' : '詳細表示'}
                </span>
              </button>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshStats}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">更新</span>
              </motion.button>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  システム正常
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 space-y-2"
          >
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 border border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-purple-500/20' 
                        : 'bg-gray-100/50 dark:bg-gray-700/50'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isActive 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* System Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {systemStats.totalTrends.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            総トレンド数
                          </div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="mt-4 text-xs text-blue-600">
                        +12% 今月
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {showSensitiveData ? systemStats.totalUsers.toLocaleString() : '***'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            登録ユーザー数
                          </div>
                        </div>
                        <Users className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-4 text-xs text-green-600">
                        +8% 今月
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {systemStats.apiCalls.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            API呼び出し
                          </div>
                        </div>
                        <Activity className="w-8 h-8 text-orange-500" />
                      </div>
                      <div className="mt-4 text-xs text-orange-600">
                        24h平均: 5.2k
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {systemStats.storageUsed}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ストレージ使用率
                          </div>
                        </div>
                        <Database className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${systemStats.storageUsed}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        システム健全性
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">稼働時間</span>
                          <span className="font-medium text-green-600">{systemStats.uptime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">エラー率</span>
                          <span className="font-medium text-yellow-600">{systemStats.errorRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">平均応答時間</span>
                          <span className="font-medium text-blue-600">{systemStats.avgResponseTime}ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">最終更新</span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {systemStats.lastUpdate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        クイックアクション
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">データエクスポート</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-medium">データインポート</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">システム診断</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">クリーンアップ</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      最近のアクティビティ
                    </h3>
                    <div className="space-y-3">
                      {[
                        { time: '14:30', action: 'データベース最適化完了', status: 'success' },
                        { time: '13:15', action: 'API レート制限更新', status: 'info' },
                        { time: '12:45', action: 'ユーザー認証エラー検出', status: 'warning' },
                        { time: '11:20', action: 'トレンドデータ同期完了', status: 'success' },
                        { time: '10:05', action: 'システムバックアップ開始', status: 'info' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <span className="text-sm text-gray-500 dark:text-gray-400 w-16">
                            {activity.time}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white flex-1">
                            {activity.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Placeholder for other sections */}
              {activeSection !== 'overview' && (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-12 text-center"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Settings className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {filteredMenuItems.find(item => item.id === activeSection)?.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      この機能は開発中です。詳細な実装は今後のアップデートで提供予定です。
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}