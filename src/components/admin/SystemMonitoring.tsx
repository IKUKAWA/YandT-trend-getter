'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  MemoryStick,
  RefreshCw
} from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    temperature: number
    cores: number
  }
  memory: {
    used: number
    total: number
    available: number
  }
  disk: {
    used: number
    total: number
    free: number
  }
  network: {
    inbound: number
    outbound: number
    connections: number
  }
  database: {
    connections: number
    queries: number
    avgResponseTime: number
  }
  api: {
    requestsPerSecond: number
    errorRate: number
    avgResponseTime: number
  }
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  service: string
  message: string
  details?: any
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  lastCheck: string
  url?: string
}

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 45.2, temperature: 62, cores: 8 },
    memory: { used: 12.4, total: 32, available: 19.6 },
    disk: { used: 456, total: 1000, free: 544 },
    network: { inbound: 125.6, outbound: 89.3, connections: 1247 },
    database: { connections: 24, queries: 1534, avgResponseTime: 12.5 },
    api: { requestsPerSecond: 45.7, errorRate: 0.12, avgResponseTime: 234 }
  })

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-12-30 14:35:22',
      level: 'info',
      service: 'API',
      message: 'トレンドデータ同期完了',
      details: { records: 1245, duration: '2.3s' }
    },
    {
      id: '2',
      timestamp: '2024-12-30 14:33:15',
      level: 'warning',
      service: 'Database',
      message: 'スロークエリ検出',
      details: { query: 'SELECT * FROM trends WHERE...', duration: '5.2s' }
    },
    {
      id: '3',
      timestamp: '2024-12-30 14:30:08',
      level: 'error',
      service: 'Auth',
      message: '認証失敗の試行が増加',
      details: { attempts: 15, source: '192.168.1.100' }
    },
    {
      id: '4',
      timestamp: '2024-12-30 14:28:44',
      level: 'info',
      service: 'Cache',
      message: 'キャッシュクリア完了',
      details: { keys: 847, size: '125MB' }
    }
  ])

  const [services] = useState<ServiceStatus[]>([
    { name: 'API Server', status: 'healthy', uptime: '15d 8h 24m', lastCheck: '14:35:22' },
    { name: 'Database', status: 'healthy', uptime: '15d 8h 24m', lastCheck: '14:35:20' },
    { name: 'Redis Cache', status: 'warning', uptime: '2d 14h 12m', lastCheck: '14:35:18' },
    { name: 'File Storage', status: 'healthy', uptime: '15d 8h 24m', lastCheck: '14:35:25' },
    { name: 'Authentication', status: 'error', uptime: '0m', lastCheck: '14:32:15' },
    { name: 'Background Jobs', status: 'healthy', uptime: '7d 3h 45m', lastCheck: '14:35:19' }
  ])

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(0, Math.min(100, prev.cpu.usage + (Math.random() - 0.5) * 10))
        },
        memory: {
          ...prev.memory,
          used: Math.max(0, Math.min(prev.memory.total, prev.memory.used + (Math.random() - 0.5) * 2))
        },
        api: {
          ...prev.api,
          requestsPerSecond: Math.max(0, prev.api.requestsPerSecond + (Math.random() - 0.5) * 10)
        }
      }))
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return XCircle
      default: return Clock
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'debug': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
            <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              システムモニタリング
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              リアルタイムシステム監視
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              自動更新
            </label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Refresh Interval */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
          >
            <option value={1}>1秒</option>
            <option value={5}>5秒</option>
            <option value={10}>10秒</option>
            <option value={30}>30秒</option>
          </select>

          {/* Manual Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">CPU</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {metrics.cpu.usage.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.cpu.usage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>温度: {metrics.cpu.temperature}°C</span>
              <span>コア数: {metrics.cpu.cores}</span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">メモリ</h3>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>使用中: {metrics.memory.used.toFixed(1)} GB</span>
              <span>総容量: {metrics.memory.total} GB</span>
            </div>
          </div>
        </div>

        {/* Disk */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">ディスク</h3>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {((metrics.disk.used / metrics.disk.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(metrics.disk.used / metrics.disk.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>使用中: {metrics.disk.used} GB</span>
              <span>空き: {metrics.disk.free} GB</span>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">ネットワーク</h3>
            </div>
            <span className="text-lg font-bold text-green-600">
              {metrics.network.connections}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">受信</span>
              <span className="font-medium">{metrics.network.inbound.toFixed(1)} MB/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">送信</span>
              <span className="font-medium">{metrics.network.outbound.toFixed(1)} MB/s</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">データベース</h3>
            </div>
            <span className="text-lg font-bold text-indigo-600">
              {metrics.database.connections}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">クエリ/s</span>
              <span className="font-medium">{metrics.database.queries}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">応答時間</span>
              <span className="font-medium">{metrics.database.avgResponseTime.toFixed(1)}ms</span>
            </div>
          </div>
        </div>

        {/* API */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">API</h3>
            </div>
            <span className="text-lg font-bold text-yellow-600">
              {metrics.api.requestsPerSecond.toFixed(1)}/s
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">エラー率</span>
              <span className="font-medium text-red-600">{metrics.api.errorRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">応答時間</span>
              <span className="font-medium">{metrics.api.avgResponseTime}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            サービス状態
          </h3>
          <div className="space-y-3">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-5 h-5" style={{ 
                      color: service.status === 'healthy' ? '#10B981' : 
                             service.status === 'warning' ? '#F59E0B' : '#EF4444' 
                    }} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        稼働時間: {service.uptime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {service.lastCheck}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Logs */}
        <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              システムログ
            </h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
            >
              <option value="1h">過去1時間</option>
              <option value="6h">過去6時間</option>
              <option value="24h">過去24時間</option>
              <option value="7d">過去7日</option>
            </select>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/70 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {log.service}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {log.timestamp}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white mb-1">
                  {log.message}
                </div>
                {log.details && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(log.details).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}