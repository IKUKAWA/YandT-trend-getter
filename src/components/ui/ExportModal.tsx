'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  X,
  Check,
  Loader2
} from 'lucide-react'
import { ChartExportService } from '@/lib/export/chartExportService'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    chartType: string
    platform: string
    category: string
    timestamp: string
    data: any[]
  }
  chartElement?: HTMLElement | null
}

export function ExportModal({ isOpen, onClose, data, chartElement }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const exportFormats = [
    {
      id: 'json',
      label: 'JSON',
      description: 'データをJSON形式でエクスポート',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      id: 'csv',
      label: 'CSV',
      description: 'ExcelやGoogle Sheetsで開けるCSV形式',
      icon: FileSpreadsheet,
      color: 'text-green-500'
    },
    {
      id: 'pdf',
      label: 'PDF',
      description: 'チャート付きPDFレポートを生成',
      icon: FileImage,
      color: 'text-red-500'
    }
  ]

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)
    setExportComplete(false)

    try {
      switch (selectedFormat) {
        case 'json':
          ChartExportService.exportAsJSON(data)
          break
        case 'csv':
          ChartExportService.exportAsCSV(data)
          break
        case 'pdf':
          await ChartExportService.exportAsPDF(data, chartElement)
          break
        default:
          throw new Error('サポートされていない形式です')
      }

      setExportComplete(true)
      setTimeout(() => {
        setExportComplete(false)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('エクスポートエラー:', error)
      alert('エクスポートに失敗しました。もう一度お試しください。')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="neo-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 neo-gradient rounded-xl">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  データエクスポート
                </h3>
                <p className="text-sm text-gray-500">
                  形式を選択してダウンロード
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="neo-button p-2 rounded-lg hover:scale-105 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Export Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              エクスポート対象
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>チャートタイプ: <span className="font-medium">{data.chartType}</span></div>
              <div>プラットフォーム: <span className="font-medium">{data.platform || '全て'}</span></div>
              <div>カテゴリ: <span className="font-medium">{data.category || '全て'}</span></div>
              <div>データ件数: <span className="font-medium">{data.data?.length || 0}件</span></div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              エクスポート形式
            </h4>
            <div className="space-y-2">
              {exportFormats.map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id

                return (
                  <motion.button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all
                      ${isSelected
                        ? 'neo-gradient text-white shadow-lg'
                        : 'neo-card hover:shadow-md'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${isSelected
                        ? 'bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-white' : format.color
                      }`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {format.label}
                      </div>
                      <div className={`text-sm ${
                        isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {format.description}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 neo-button py-3 px-4 rounded-xl font-medium hover:scale-105 transition-transform"
              disabled={isExporting}
            >
              キャンセル
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 neo-gradient py-3 px-4 rounded-xl font-medium text-white hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  エクスポート中...
                </>
              ) : exportComplete ? (
                <>
                  <Check className="w-4 h-4" />
                  完了！
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  エクスポート
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 PDFエクスポートには数秒かかる場合があります。チャートの画像も含まれます。
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}