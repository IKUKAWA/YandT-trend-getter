'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  X, 
  Settings, 
  Calendar,
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { ExportService } from '@/lib/export/exportService'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  data: any[]
  dataType: 'trends' | 'analytics' | 'custom'
  title?: string
  filters?: Record<string, any>
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  includeMetrics: boolean
  includeCharts: boolean
  dateRange: {
    start: string
    end: string
  }
  selectedColumns: string[]
  author: string
  customTitle: string
  pageOrientation: 'portrait' | 'landscape'
  includeFilters: boolean
}

export function ExportModal({
  isOpen,
  onClose,
  data,
  dataType,
  title = 'データエクスポート',
  filters = {}
}: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeMetrics: true,
    includeCharts: false,
    dateRange: {
      start: '',
      end: ''
    },
    selectedColumns: [
      'title', 'platform', 'category', 'views', 'likes', 'comments', 'engagement', 'createdAt'
    ],
    author: 'User',
    customTitle: title,
    pageOrientation: 'portrait',
    includeFilters: true
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'format' | 'content' | 'settings'>('format')

  const availableColumns = [
    { key: 'title', label: 'タイトル', default: true },
    { key: 'platform', label: 'プラットフォーム', default: true },
    { key: 'category', label: 'カテゴリ', default: true },
    { key: 'views', label: '再生数', default: true },
    { key: 'likes', label: 'いいね数', default: true },
    { key: 'comments', label: 'コメント数', default: true },
    { key: 'shares', label: 'シェア数', default: false },
    { key: 'engagement', label: 'エンゲージメント率', default: true },
    { key: 'createdAt', label: '投稿日時', default: true },
    { key: 'hashtags', label: 'ハッシュタグ', default: false },
    { key: 'description', label: '説明', default: false }
  ]

  const formatOptions = [
    {
      value: 'excel',
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: '高度な分析とフィルタリングに最適',
      pros: ['複数シート対応', '数式とチャート', 'データ型の保持'],
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20'
    },
    {
      value: 'csv',
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'シンプルなデータ交換に最適',
      pros: ['軽量ファイル', '汎用性が高い', '高速処理'],
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    },
    {
      value: 'pdf',
      label: 'PDF (.pdf)',
      icon: File,
      description: 'レポートや印刷に最適',
      pros: ['レイアウト保持', '印刷対応', 'セキュリティ'],
      color: 'text-red-600 bg-red-100 dark:bg-red-900/20'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus('idle')

    try {
      // Filter data based on date range if specified
      let filteredData = [...data]
      
      if (options.dateRange.start || options.dateRange.end) {
        filteredData = data.filter(item => {
          const itemDate = new Date(item.createdAt)
          const startDate = options.dateRange.start ? new Date(options.dateRange.start) : null
          const endDate = options.dateRange.end ? new Date(options.dateRange.end) : null
          
          if (startDate && itemDate < startDate) return false
          if (endDate && itemDate > endDate) return false
          return true
        })
      }

      if (dataType === 'trends') {
        await ExportService.exportTrendsData(filteredData, options.format as any, {
          includeMetrics: options.includeMetrics,
          includeCharts: options.includeCharts,
          filters: options.includeFilters ? filters : {},
          author: options.author
        })
      } else if (dataType === 'analytics') {
        await ExportService.exportAnalyticsReport(
          {
            trends: filteredData,
            predictions: [],
            categories: [],
            engagement: []
          },
          options.format as 'pdf' | 'excel',
          {
            author: options.author,
            includeCharts: options.includeCharts
          }
        )
      } else {
        // Custom export
        const headers = availableColumns
          .filter(col => options.selectedColumns.includes(col.key))
          .map(col => col.label)
        
        const rows = filteredData.map(item => 
          options.selectedColumns.map(colKey => {
            switch (colKey) {
              case 'views':
                return Number(item.views) || 0
              case 'engagement':
                const views = Number(item.views) || 0
                const engagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0)
                return views > 0 ? `${(engagement / views * 100).toFixed(2)}%` : '0.00%'
              case 'createdAt':
                return new Date(item.createdAt).toLocaleString('ja-JP')
              case 'hashtags':
                return (item.hashtags || []).join(', ')
              default:
                return item[colKey] || ''
            }
          })
        )

        const exportData = {
          title: options.customTitle,
          headers,
          rows,
          metadata: {
            author: options.author,
            subject: `${options.customTitle} - YandTトレンドゲッター`,
            createdAt: new Date(),
            filters: options.includeFilters ? filters : undefined,
            summary: options.includeMetrics ? {
              '総データ数': filteredData.length.toLocaleString(),
              '期間': options.dateRange.start && options.dateRange.end 
                ? `${options.dateRange.start} ~ ${options.dateRange.end}`
                : '指定なし'
            } : undefined
          }
        }

        switch (options.format) {
          case 'csv':
            await ExportService.exportToCSV(exportData)
            break
          case 'excel':
            await ExportService.exportToExcel(exportData)
            break
          case 'pdf':
            await ExportService.exportToPDF(exportData, {
              orientation: options.pageOrientation
            })
            break
        }
      }

      setExportStatus('success')
      setTimeout(() => {
        onClose()
        setExportStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const updateOptions = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const toggleColumn = (columnKey: string) => {
    setOptions(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns.includes(columnKey)
        ? prev.selectedColumns.filter(col => col !== columnKey)
        : [...prev.selectedColumns, columnKey]
    }))
  }

  const estimatedFileSize = () => {
    const baseSize = data.length * options.selectedColumns.length * 10 // rough estimate
    const formatMultiplier = {
      csv: 0.5,
      excel: 2,
      pdf: 3
    }
    const size = baseSize * formatMultiplier[options.format]
    if (size < 1024) return `${Math.round(size)} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${Math.round(size / (1024 * 1024))} MB`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      データエクスポート
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.length.toLocaleString()}件のデータ
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

              {/* Tabs */}
              <div className="flex gap-1 mt-4 p-1 bg-white/20 dark:bg-gray-800/20 rounded-lg">
                {[
                  { key: 'format', label: 'フォーマット', icon: FileText },
                  { key: 'content', label: 'コンテンツ', icon: Filter },
                  { key: 'settings', label: '設定', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {/* Format Tab */}
                {activeTab === 'format' && (
                  <motion.div
                    key="format"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      エクスポート形式を選択
                    </h4>
                    <div className="grid gap-4">
                      {formatOptions.map((format) => {
                        const Icon = format.icon
                        return (
                          <motion.button
                            key={format.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateOptions('format', format.value as any)}
                            className={`p-4 rounded-xl border transition-all text-left ${
                              options.format === format.value
                                ? 'border-purple-500/50 bg-purple-500/10'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${format.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {format.label}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {format.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {format.pros.map((pro, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-white/20 rounded-full text-gray-600 dark:text-gray-400"
                                    >
                                      {pro}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {options.format === format.value && (
                                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Column Selection */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        含める列を選択
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {availableColumns.map((column) => (
                          <label
                            key={column.key}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={options.selectedColumns.includes(column.key)}
                              onChange={() => toggleColumn(column.key)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {column.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        期間を指定（オプション）
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            開始日
                          </label>
                          <input
                            type="date"
                            value={options.dateRange.start}
                            onChange={(e) => updateOptions('dateRange', {
                              ...options.dateRange,
                              start: e.target.value
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            終了日
                          </label>
                          <input
                            type="date"
                            value={options.dateRange.end}
                            onChange={(e) => updateOptions('dateRange', {
                              ...options.dateRange,
                              end: e.target.value
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white/20 dark:bg-gray-800/20">
                        <input
                          type="checkbox"
                          checked={options.includeMetrics}
                          onChange={(e) => updateOptions('includeMetrics', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            メトリクスとサマリーを含める
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            総計、平均値、その他の統計情報
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white/20 dark:bg-gray-800/20">
                        <input
                          type="checkbox"
                          checked={options.includeFilters}
                          onChange={(e) => updateOptions('includeFilters', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            適用したフィルターを含める
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            エクスポート時のフィルター条件を記録
                          </p>
                        </div>
                      </label>

                      {options.format === 'pdf' && (
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-white/20 dark:bg-gray-800/20">
                          <input
                            type="checkbox"
                            checked={options.includeCharts}
                            onChange={(e) => updateOptions('includeCharts', e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              チャートとグラフを含める
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              可視化されたデータを PDF に含める
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ファイル名
                      </label>
                      <input
                        type="text"
                        value={options.customTitle}
                        onChange={(e) => updateOptions('customTitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        作成者
                      </label>
                      <input
                        type="text"
                        value={options.author}
                        onChange={(e) => updateOptions('author', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    {options.format === 'pdf' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ページの向き
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: 'portrait', label: '縦向き' },
                            { value: 'landscape', label: '横向き' }
                          ].map((orientation) => (
                            <button
                              key={orientation.value}
                              onClick={() => updateOptions('pageOrientation', orientation.value as any)}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                options.pageOrientation === orientation.value
                                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                  : 'bg-white/20 hover:bg-white/30 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {orientation.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                        エクスポート情報
                      </h5>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>データ件数: {data.length.toLocaleString()}件</div>
                        <div>選択列数: {options.selectedColumns.length}列</div>
                        <div>推定ファイルサイズ: {estimatedFileSize()}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {exportStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      エクスポートが完了しました
                    </div>
                  )}
                  {exportStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      エクスポートに失敗しました
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting || options.selectedColumns.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        エクスポート中...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        エクスポート
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}