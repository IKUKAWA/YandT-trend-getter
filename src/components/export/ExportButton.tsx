'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react'
import { ExportModal } from './ExportModal'
import { ExportService } from '@/lib/export/exportService'

interface ExportButtonProps {
  data: any[]
  dataType?: 'trends' | 'analytics' | 'custom'
  title?: string
  filters?: Record<string, any>
  variant?: 'button' | 'dropdown' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onExportStart?: () => void
  onExportComplete?: () => void
}

export function ExportButton({
  data,
  dataType = 'trends',
  title = 'データエクスポート',
  filters = {},
  variant = 'button',
  size = 'md',
  className = '',
  onExportStart,
  onExportComplete
}: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const quickExportOptions = [
    {
      format: 'excel' as const,
      label: 'Excel形式',
      icon: FileSpreadsheet,
      description: '分析に最適',
      color: 'text-green-600'
    },
    {
      format: 'csv' as const,
      label: 'CSV形式',
      icon: FileText,
      description: 'データ交換に最適',
      color: 'text-blue-600'
    },
    {
      format: 'pdf' as const,
      label: 'PDF形式',
      icon: File,
      description: 'レポートに最適',
      color: 'text-red-600'
    }
  ]

  const handleQuickExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (data.length === 0) return

    setIsExporting(true)
    if (onExportStart) onExportStart()

    try {
      if (dataType === 'trends') {
        await ExportService.exportTrendsData(data, format, {
          includeMetrics: true,
          includeCharts: format === 'pdf',
          filters,
          author: 'User'
        })
      } else {
        // Custom export with basic options
        const headers = ['タイトル', 'プラットフォーム', 'カテゴリ', '再生数', 'エンゲージメント率']
        const rows = data.map(item => {
          const views = Number(item.views) || 0
          const engagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0)
          const engagementRate = views > 0 ? (engagement / views * 100).toFixed(2) : '0.00'
          
          return [
            item.title || '',
            item.platform || '',
            item.category || '',
            views.toLocaleString(),
            `${engagementRate}%`
          ]
        })

        const exportData = {
          title,
          headers,
          rows,
          metadata: {
            author: 'User',
            createdAt: new Date(),
            filters
          }
        }

        switch (format) {
          case 'csv':
            await ExportService.exportToCSV(exportData)
            break
          case 'excel':
            await ExportService.exportToExcel(exportData)
            break
          case 'pdf':
            await ExportService.exportToPDF(exportData)
            break
        }
      }

      if (onExportComplete) onExportComplete()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setShowDropdown(false)
    }
  }

  const handleOpenModal = () => {
    setShowModal(true)
    setShowDropdown(false)
  }

  if (variant === 'minimal') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenModal}
          disabled={data.length === 0 || isExporting}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <Download className={iconSizes[size]} />
        </motion.button>

        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={data}
          dataType={dataType}
          title={title}
          filters={filters}
        />
      </>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={data.length === 0 || isExporting}
          className={`flex items-center gap-2 ${sizeClasses[size]} bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <Download className={iconSizes[size]} />
          <span>エクスポート</span>
          <ChevronDown className={`${iconSizes[size]} transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg z-50"
          >
            <div className="p-2">
              {quickExportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <motion.button
                    key={option.format}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => handleQuickExport(option.format)}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors text-left disabled:opacity-50"
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
              
              <div className="border-t border-white/10 mt-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={handleOpenModal}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/20 transition-colors text-left"
                >
                  <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      詳細設定
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      カスタムエクスポート
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={data}
          dataType={dataType}
          title={title}
          filters={filters}
        />

        {/* Backdrop for dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    )
  }

  // Default button variant
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenModal}
        disabled={data.length === 0 || isExporting}
        className={`flex items-center gap-2 ${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Download className={iconSizes[size]} />
        <span>{isExporting ? 'エクスポート中...' : 'エクスポート'}</span>
      </motion.button>

      <ExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={data}
        dataType={dataType}
        title={title}
        filters={filters}
      />
    </>
  )
}