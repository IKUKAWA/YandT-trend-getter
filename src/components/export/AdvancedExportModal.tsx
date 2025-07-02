'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Table,
  BarChart3,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { AdvancedExportService } from '@/lib/export/AdvancedExportService'
import { ChannelAnalysis, ChannelSearchResult } from '@/types/channel'

interface AdvancedExportModalProps {
  isOpen: boolean
  onClose: () => void
  channels: Array<{
    channel: ChannelSearchResult
    analysis: ChannelAnalysis | null
  }>
  comparison?: any
  filters?: any
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'
type ExportTemplate = 'basic' | 'detailed' | 'executive'

export function AdvancedExportModal({
  isOpen,
  onClose,
  channels,
  comparison,
  filters
}: AdvancedExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>('detailed')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)
  const [customFields, setCustomFields] = useState<string[]>(['nextMilestone', 'trendStrength'])
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState(false)

  const exportService = AdvancedExportService.getInstance()

  const formatOptions = [
    {
      key: 'excel' as ExportFormat,
      label: 'Excel (.xlsx)',
      icon: Table,
      description: 'スプレッドシート形式。複数シート、条件付き書式付き',
      features: ['複数ワークシート', 'チャート', '条件付き書式', 'サマリー']
    },
    {
      key: 'pdf' as ExportFormat,
      label: 'PDF (.pdf)',
      icon: FileText,
      description: 'プレゼンテーション形式。レポート、チャート画像付き',
      features: ['レポート形式', 'チャート画像', 'ページネーション', 'ヘッダー/フッター']
    },
    {
      key: 'csv' as ExportFormat,
      label: 'CSV (.csv)',
      icon: BarChart3,
      description: 'データ分析用。他のツールでの処理に最適',
      features: ['軽量', '高速', '互換性', 'データ分析用']
    },
    {
      key: 'json' as ExportFormat,
      label: 'JSON (.json)',
      icon: Settings,
      description: 'プログラマー向け。API連携、自動処理に最適',
      features: ['構造化データ', 'API連携', 'プログラム処理', 'メタデータ']
    }
  ]

  const templateOptions = [
    {
      key: 'basic' as ExportTemplate,
      label: '基本',
      description: '主要メトリクスのみ',
      fields: ['基本情報', '登録者数', '成長率']
    },
    {
      key: 'detailed' as ExportTemplate,
      label: '詳細',
      description: '全メトリクスと分析',
      fields: ['基本情報', '成長分析', 'エンゲージメント', '予測']
    },
    {
      key: 'executive' as ExportTemplate,
      label: 'エグゼクティブ',
      description: '経営層向けサマリー',
      fields: ['サマリー', 'KPI', 'インサイト', '推奨事項']
    }
  ]

  const customFieldOptions = [
    { key: 'nextMilestone', label: '次のマイルストーン' },
    { key: 'timeToMilestone', label: 'マイルストーンまでの日数' },
    { key: 'trendStrength', label: 'トレンド強度' },
    { key: 'competitorRanking', label: '競合ランキング' },
    { key: 'monetizationScore', label: '収益化スコア' }
  ]

  const handleExport = async () => {
    if (channels.length === 0) {
      setExportStatus('error')
      return
    }

    setIsExporting(true)
    setExportStatus('idle')

    try {
      const exportData = {
        channels,
        comparison,
        filters,
        exportDate: new Date(),
        user: 'Current User' // TODO: Get from auth context
      }

      const options = {
        format: selectedFormat,
        includeCharts: includeCharts && (selectedFormat === 'pdf' || selectedFormat === 'excel'),
        includeSummary,
        includeRawData,
        customFields,
        template: selectedTemplate,
        metadata: {
          totalChannels: channels.length,
          exportTemplate: selectedTemplate,
          userAgent: navigator.userAgent
        }
      }

      await exportService.exportChannelAnalysis(exportData, options)
      setExportStatus('success')
      
      // Auto-close after successful export
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

  const getPreviewData = () => {
    if (channels.length === 0) return []
    
    return channels.slice(0, 3).map(({ channel, analysis }) => ({
      チャンネル名: channel.name,
      プラットフォーム: channel.platform,
      登録者数: channel.subscriberCount.toLocaleString(),
      成長率: `${analysis?.growthAnalysis.monthlyGrowthRate || 0}%`,
      エンゲージメント: `${((analysis?.growthAnalysis.current.engagementRate || 0) * 100).toFixed(1)}%`
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 neo-gradient rounded-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    高度エクスポート
                  </h2>
                  <p className="text-sm text-gray-500">
                    {channels.length}個のチャンネルをエクスポート
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                エクスポート形式
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatOptions.map(({ key, label, icon: Icon, description, features }) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedFormat(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedFormat === key
                        ? 'border-neo-purple bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-1 ${
                        selectedFormat === key ? 'text-neo-purple' : 'text-gray-400'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {label}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {features.map(feature => (
                            <span
                              key={feature}
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedFormat === key
                                  ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {selectedFormat === key && (
                        <CheckCircle className="w-5 h-5 text-neo-purple" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                レポートテンプレート
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templateOptions.map(({ key, label, description, fields }) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === key
                        ? 'border-neo-purple bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {description}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      含まれる項目: {fields.join(', ')}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                エクスポートオプション
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="rounded"
                      disabled={selectedFormat === 'csv' || selectedFormat === 'json'}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        チャート画像を含む
                      </div>
                      <div className="text-sm text-gray-500">
                        PDF・Excelにグラフを埋め込み
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="checkbox"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        サマリーを含む
                      </div>
                      <div className="text-sm text-gray-500">
                        統計情報と分析概要
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="checkbox"
                      checked={includeRawData}
                      onChange={(e) => setIncludeRawData(e.target.checked)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        生データを含む
                      </div>
                      <div className="text-sm text-gray-500">
                        詳細な分析データ（大容量）
                      </div>
                    </div>
                  </label>
                </div>

                {/* Custom Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    追加フィールド
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {customFieldOptions.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customFields.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomFields(prev => [...prev, key])
                            } else {
                              setCustomFields(prev => prev.filter(f => f !== key))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  データプレビュー
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? '非表示' : '表示'}
                </button>
              </div>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              {Object.keys(getPreviewData()[0] || {}).map(header => (
                                <th key={header} className="text-left py-2 px-3 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {getPreviewData().map((row, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {channels.length > 3 && (
                        <div className="text-center text-sm text-gray-500 mt-3">
                          他 {channels.length - 3} 件のチャンネル...
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {exportStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">
                      エクスポートが完了しました！ダウンロードが開始されます。
                    </span>
                  </div>
                </motion.div>
              )}

              {exportStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-200">
                      エクスポートに失敗しました。再度お試しください。
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {channels.length}個のチャンネル • {selectedFormat.toUpperCase()} • {selectedTemplate}テンプレート
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                キャンセル
              </button>
              
              <motion.button
                onClick={handleExport}
                disabled={isExporting || channels.length === 0}
                className="flex items-center gap-2 px-6 py-2 neo-gradient text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isExporting ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}