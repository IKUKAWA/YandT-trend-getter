'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, Minimize2, Download, RefreshCw } from 'lucide-react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { MobileActionSheet } from './MobileActionSheet'

interface ResponsiveChartProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  onRefresh?: () => void
  onExport?: () => void
  isLoading?: boolean
  className?: string
  fullscreenCapable?: boolean
}

export function ResponsiveChart({
  children,
  title,
  subtitle,
  onRefresh,
  onExport,
  isLoading = false,
  className = '',
  fullscreenCapable = true
}: ResponsiveChartProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMobileOptions, setShowMobileOptions] = useState(false)

  // Auto-adjust chart height based on screen size
  const getChartHeight = () => {
    if (isFullscreen) {
      return isMobile ? 'h-[60vh]' : 'h-[80vh]'
    }
    
    if (isMobile) return 'h-64'
    if (isTablet) return 'h-80'
    return 'h-96'
  }

  const handleFullscreenToggle = () => {
    if (isMobile) {
      setShowMobileOptions(true)
    } else {
      setIsFullscreen(!isFullscreen)
    }
  }

  return (
    <>
      <div className={`neo-card overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <motion.button
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isLoading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                whileTap={{ scale: 0.95 }}
                title="更新"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>
            )}

            {onExport && (
              <motion.button
                onClick={onExport}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
                title="エクスポート"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            )}

            {fullscreenCapable && (
              <motion.button
                onClick={handleFullscreenToggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
                title={isFullscreen ? '元のサイズ' : '拡大表示'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Chart Content */}
        <div className={`relative ${getChartHeight()}`}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  チャートを更新中...
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 h-full">
              {children}
            </div>
          )}
        </div>

        {/* Mobile Bottom Actions */}
        {isMobile && (
          <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setShowMobileOptions(true)}
              className="text-sm text-purple-600 dark:text-purple-400 font-medium"
            >
              オプション
            </button>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="text-sm text-gray-600 dark:text-gray-400 disabled:opacity-50"
              >
                更新
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Options Sheet */}
      <MobileActionSheet
        isOpen={showMobileOptions}
        onClose={() => setShowMobileOptions(false)}
        title={`${title} オプション`}
        height="auto"
      >
        <div className="space-y-4">
          {fullscreenCapable && (
            <button
              onClick={() => {
                setIsFullscreen(!isFullscreen)
                setShowMobileOptions(false)
              }}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-blue-500" />
              ) : (
                <Maximize2 className="w-5 h-5 text-blue-500" />
              )}
              <span className="font-medium">
                {isFullscreen ? '元のサイズに戻す' : '拡大表示'}
              </span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={() => {
                onRefresh()
                setShowMobileOptions(false)
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-green-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">データを更新</span>
            </button>
          )}

          {onExport && (
            <button
              onClick={() => {
                onExport()
                setShowMobileOptions(false)
              }}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg"
            >
              <Download className="w-5 h-5 text-purple-500" />
              <span className="font-medium">チャートをエクスポート</span>
            </button>
          )}
        </div>
      </MobileActionSheet>

      {/* Fullscreen Overlay for Desktop */}
      {isFullscreen && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-gray-500 mt-1">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {onRefresh && (
                  <motion.button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    更新
                  </motion.button>
                )}

                {onExport && (
                  <motion.button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg neo-gradient text-white"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    エクスポート
                  </motion.button>
                )}

                <motion.button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileTap={{ scale: 0.95 }}
                >
                  <Minimize2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Fullscreen Content */}
            <div className="flex-1 p-6 h-full overflow-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

// Simplified chart wrapper for quick implementation
export function MobileOptimizedChart({
  children,
  title,
  height = 'auto',
  className = ''
}: {
  children: React.ReactNode
  title: string
  height?: 'auto' | 'small' | 'medium' | 'large'
  className?: string
}) {
  const { isMobile } = useMobileDetection()
  
  const getHeight = () => {
    if (isMobile) {
      switch (height) {
        case 'small': return 'h-48'
        case 'medium': return 'h-64'
        case 'large': return 'h-80'
        default: return 'h-64'
      }
    }
    
    switch (height) {
      case 'small': return 'h-64'
      case 'medium': return 'h-80'
      case 'large': return 'h-96'
      default: return 'h-80'
    }
  }
  
  return (
    <div className={`neo-card ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
          {title}
        </h3>
      </div>
      <div className={`${getHeight()} p-4`}>
        {children}
      </div>
    </div>
  )
}