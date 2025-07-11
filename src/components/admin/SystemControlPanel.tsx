'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Play, 
  Square, 
  RefreshCw, 
  Database, 
  Cloud, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  Users,
  Download,
  Upload,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  Network,
  Timer,
  Bell,
  Lock,
  Unlock
} from 'lucide-react'

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'error'
  services: {
    database: 'online' | 'offline' | 'maintenance'
    api: 'online' | 'offline' | 'maintenance'
    scheduler: 'running' | 'stopped' | 'error'
    ai_service: 'online' | 'offline' | 'maintenance'
  }
  performance: {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    response_time: number
  }
  last_updated: string
}

interface SystemOperation {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'completed' | 'error'
  progress?: number
  logs?: string[]
  duration?: number
}

function getMockOperations(): SystemOperation[] {
  return [
    {
      id: 'data-collection',
      name: 'データ収集実行',
      description: 'YouTube、TikTok、X、Instagramからの最新データを収集します',
      status: 'idle'
    },
    {
      id: 'ai-analysis',
      name: 'AI分析実行',
      description: 'Claude APIを使用してトレンド分析とカテゴリ分析を実行します',
      status: 'idle'
    },
    {
      id: 'database-cleanup',
      name: 'データベースクリーンアップ',
      description: '古いデータを削除し、データベースを最適化します',
      status: 'idle'
    },
    {
      id: 'cache-refresh',
      name: 'キャッシュ更新',
      description: 'システムキャッシュを更新して最新データを反映します',
      status: 'idle'
    },
    {
      id: 'backup-create',
      name: 'バックアップ作成',
      description: 'データベースとファイルのバックアップを作成します',
      status: 'idle'
    }
  ]
}

export function SystemControlPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [operations, setOperations] = useState<SystemOperation[]>(getMockOperations())
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'monitoring' | 'maintenance'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({})

  // システム状態を取得
  useEffect(() => {
    fetchSystemStatus()
    fetchOperations()
    
    const interval = setInterval(() => {
      fetchSystemStatus()
    }, 30000) // 30秒ごとに更新

    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      // 実際のAPIコール
      const response = await fetch('/api/admin/system/status')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      } else {
        // モックデータ
        setSystemStatus(getMockSystemStatus())
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setSystemStatus(getMockSystemStatus())
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/admin/system/operations')
      if (response.ok) {
        const data = await response.json()
        setOperations(data)
      } else {
        setOperations(getMockOperations())
      }
    } catch (error) {
      console.error('Failed to fetch operations:', error)
      setOperations(getMockOperations())
    }
  }

  const executeOperation = async (operationId: string) => {
    try {
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'running', progress: 0, logs: ['操作を開始しています...'] }
          : op
      ))

      const response = await fetch('/api/admin/system/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId })
      })

      if (response.ok) {
        simulateOperation(operationId)
      } else {
        throw new Error('Operation failed')
      }
    } catch (error) {
      console.error('Failed to execute operation:', error)
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'error', logs: [...(op.logs || []), 'エラーが発生しました'] }
          : op
      ))
    }
  }

  const simulateOperation = (operationId: string) => {
    const steps = [
      '初期化中...',
      'データベース接続確認中...',
      'API接続確認中...',
      '処理実行中...',
      '結果検証中...',
      '完了'
    ]

    let step = 0
    const interval = setInterval(() => {
      step++
      const progress = (step / steps.length) * 100

      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              progress,
              logs: [...(op.logs || []), steps[step - 1] || ''],
              status: step >= steps.length ? 'completed' : 'running'
            }
          : op
      ))

      if (step >= steps.length) {
        clearInterval(interval)
        // システム状態を更新
        fetchSystemStatus()
      }
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'running':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'warning':
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'error':
      case 'offline':
      case 'stopped':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'running':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
      case 'offline':
      case 'stopped':
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* システム全体の状態 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="neo-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">システム状態</p>
              <p className={`text-lg font-semibold ${getStatusColor(systemStatus?.overall || 'healthy')}`}>
                {systemStatus?.overall === 'healthy' ? '正常' : 
                 systemStatus?.overall === 'warning' ? '注意' : 'エラー'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${getStatusColor(systemStatus?.overall || 'healthy')}`}>
              {getStatusIcon(systemStatus?.overall || 'healthy')}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="neo-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">CPU使用率</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {systemStatus?.performance.cpu_usage || 0}%
              </p>
            </div>
            <Cpu className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${systemStatus?.performance.cpu_usage || 0}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="neo-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">メモリ使用率</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {systemStatus?.performance.memory_usage || 0}%
              </p>
            </div>
            <Server className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${systemStatus?.performance.memory_usage || 0}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="neo-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">応答時間</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {systemStatus?.performance.response_time || 0}ms
              </p>
            </div>
            <Network className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* サービス状態 */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          サービス状態
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemStatus?.services || {}).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {service.replace('_', ' ')}
                </p>
                <p className={`text-sm ${getStatusColor(status)}`}>
                  {status === 'online' ? 'オンライン' : 
                   status === 'offline' ? 'オフライン' : 'メンテナンス中'}
                </p>
              </div>
              <div className={`p-1 rounded ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOperationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          システム操作
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchOperations}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          更新
        </motion.button>
      </div>

      <div className="grid gap-4">
        {operations && operations.length > 0 ? operations.map((operation) => (
          <motion.div
            key={operation.id}
            whileHover={{ scale: 1.01 }}
            className="neo-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {operation.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {operation.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(operation.status)}`}>
                  {operation.status === 'idle' ? '待機中' :
                   operation.status === 'running' ? '実行中' :
                   operation.status === 'completed' ? '完了' : 'エラー'}
                </span>
                {operation.status === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeOperation(operation.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    実行
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogs(prev => ({ ...prev, [operation.id]: !prev[operation.id] }))}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showLogs[operation.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {operation.status === 'running' && operation.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>進行状況</span>
                  <span>{Math.round(operation.progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${operation.progress}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {showLogs[operation.id] && operation.logs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto"
                >
                  {operation.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )) : (
          <div className="neo-card p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              操作データを読み込んでいます...
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // リアルタイム監視タブ
  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          リアルタイム監視
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchSystemStatus}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          更新
        </motion.button>
      </div>

      {/* システムパフォーマンス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div className="neo-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">CPU使用率</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {systemStatus?.performance.cpu_usage.toFixed(3)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${systemStatus?.performance.cpu_usage || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        <motion.div className="neo-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">メモリ使用率</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {systemStatus?.performance.memory_usage.toFixed(3)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${systemStatus?.performance.memory_usage || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        <motion.div className="neo-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold">ディスク使用率</h4>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {systemStatus?.performance.disk_usage.toFixed(3)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${systemStatus?.performance.disk_usage || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        <motion.div className="neo-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Network className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold">応答時間</h4>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {systemStatus?.performance.response_time.toFixed(3)}ms
          </div>
          <div className="text-sm text-gray-500 mt-1">
            平均レスポンス時間
          </div>
        </motion.div>
      </div>

      {/* サービス状態監視 */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          サービス状態
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(systemStatus?.services || {}).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'online' ? 'bg-green-500' :
                  status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-medium capitalize">{service.replace('_', ' ')}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* アラート履歴 */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          最近のアラート
        </h4>
        <div className="space-y-3">
          {[
            { time: '15:32', type: 'warning', message: 'CPU使用率が80%を超えました' },
            { time: '14:15', type: 'info', message: 'データベースバックアップが完了しました' },
            { time: '13:45', type: 'error', message: 'AI分析サービスで一時的なエラーが発生しました' },
            { time: '12:30', type: 'success', message: 'システム再起動が正常に完了しました' }
          ].map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full ${
                alert.type === 'error' ? 'bg-red-500' :
                alert.type === 'warning' ? 'bg-yellow-500' :
                alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <span className="text-sm text-gray-500">{alert.time}</span>
              <span className="text-sm flex-1">{alert.message}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  // メンテナンスタブ
  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5" />
          システムメンテナンス
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">最終メンテナンス: 2024-12-30 15:30</span>
        </div>
      </div>

      {/* データベースメンテナンス */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          データベースメンテナンス
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">データベース最適化</h5>
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              インデックスの再構築とクエリパフォーマンスの最適化
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              実行
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">古いデータ削除</h5>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              30日以上前の不要なデータを削除
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              実行
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* システムメンテナンス */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          システムメンテナンス
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">キャッシュクリア</h5>
              <RefreshCw className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              システム全体のキャッシュをクリア
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              実行
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">ログローテーション</h5>
              <Timer className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              古いログファイルを圧縮・アーカイブ
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              実行
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">セキュリティスキャン</h5>
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              システムのセキュリティチェック
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              実行
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* バックアップ管理 */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          バックアップ管理
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h5 className="font-semibold">自動バックアップ</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">毎日午前3:00に実行</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                有効
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                今すぐ実行
              </motion.button>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold">最近のバックアップ</h5>
            {[
              { date: '2024-12-30 03:00', size: '2.3 GB', status: 'success' },
              { date: '2024-12-29 03:00', size: '2.1 GB', status: 'success' },
              { date: '2024-12-28 03:00', size: '2.0 GB', status: 'success' },
              { date: '2024-12-27 03:00', size: '1.9 GB', status: 'failed' }
            ].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    backup.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm">{backup.date}</span>
                  <span className="text-sm text-gray-500">{backup.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.status === 'success' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {backup.status === 'success' ? '成功' : '失敗'}
                  </span>
                  {backup.status === 'success' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      復元
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メンテナンススケジュール */}
      <div className="neo-card p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          メンテナンススケジュール
        </h4>
        <div className="space-y-3">
          {[
            { task: 'データベース最適化', next: '2025-01-01 02:00', frequency: '週次' },
            { task: 'ログクリーンアップ', next: '2025-01-02 01:00', frequency: '日次' },
            { task: 'セキュリティスキャン', next: '2025-01-07 03:00', frequency: '週次' },
            { task: 'フルバックアップ', next: '2025-01-01 00:00', frequency: '月次' }
          ].map((schedule, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h5 className="font-medium">{schedule.task}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">次回実行: {schedule.next}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  {schedule.frequency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // タブナビゲーション
  const tabs = [
    { key: 'overview', label: '概要', icon: Monitor },
    { key: 'operations', label: '操作', icon: Settings },
    { key: 'monitoring', label: '監視', icon: Activity },
    { key: 'maintenance', label: 'メンテナンス', icon: Shield }
  ]

  if (isLoading) {
    return (
      <div className="neo-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"></div>
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
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              システム制御パネル
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              最終更新: {systemStatus?.last_updated ? new Date(systemStatus.last_updated).toLocaleString('ja-JP') : ''}
            </p>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-1 p-1 bg-white/20 dark:bg-gray-800/20 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* タブコンテンツ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'operations' && renderOperationsTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
          {activeTab === 'maintenance' && renderMaintenanceTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )

  // モックデータ生成関数
  function getMockSystemStatus(): SystemStatus {
    return {
      overall: 'healthy',
      services: {
        database: 'online',
        api: 'online',
        scheduler: 'running',
        ai_service: 'online'
      },
      performance: {
        cpu_usage: Math.floor(Math.random() * 30) + 20,
        memory_usage: Math.floor(Math.random() * 40) + 30,
        disk_usage: Math.floor(Math.random() * 20) + 10,
        response_time: Math.floor(Math.random() * 100) + 50
      },
      last_updated: new Date().toISOString()
    }
  }

}