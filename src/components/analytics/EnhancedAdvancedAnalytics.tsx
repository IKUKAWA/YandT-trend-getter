'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Circle,
  Grid3X3,
  TrendingUp,
  Filter,
  Settings,
  Maximize2,
  Download,
  RefreshCw
} from 'lucide-react'

import { AdvancedBarChart } from '@/components/charts/AdvancedBarChart'
import { AdvancedRadialChart } from '@/components/charts/AdvancedRadialChart'
import { ScatterMatrixChart } from '@/components/charts/ScatterMatrixChart'
import { PlatformCategorySwitcher } from '@/components/ui/PlatformCategorySwitcher'
import { ExportModal } from '@/components/ui/ExportModal'

interface EnhancedAdvancedAnalyticsProps {
  data?: any[]
}

export function EnhancedAdvancedAnalytics({ data }: EnhancedAdvancedAnalyticsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedChartType, setSelectedChartType] = useState('bar')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showExportModal, setShowExportModal] = useState(false)
  const [chartRef, setChartRef] = useState<HTMLElement | null>(null)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const renderChart = () => {
    const commonProps = {
      selectedCategory,
      selectedPlatform
    }

    switch (selectedChartType) {
      case 'bar':
        return (
          <AdvancedBarChart
            key={refreshKey}
            {...commonProps}
            type="grouped"
            metric="platform"
            showLegend={true}
            showGrid={true}
            animated={true}
          />
        )
      case 'radial':
        return (
          <AdvancedRadialChart
            key={refreshKey}
            {...commonProps}
            type="sunburst"
            showLabels={true}
            showValues={true}
            animated={true}
            interactive={true}
          />
        )
      case 'scatter':
        return (
          <ScatterMatrixChart
            key={refreshKey}
            {...commonProps}
            variables={['views', 'engagement', 'growth', 'viral_score']}
            onCategoryChange={setSelectedCategory}
            interactive={true}
            showCorrelations={true}
          />
        )
      default:
        return <AdvancedBarChart key={refreshKey} {...commonProps} />
    }
  }

  const getChartTitle = () => {
    const titles = {
      bar: 'バーチャート分析',
      radial: 'ラジアルチャート分析',
      scatter: '散布図マトリックス分析'
    }
    return titles[selectedChartType as keyof typeof titles] || '高度分析'
  }

  const getChartDescription = () => {
    const descriptions = {
      bar: 'カテゴリ別データの比較分析',
      radial: '放射状データの可視化',
      scatter: '多変量相関関係の分析'
    }
    return descriptions[selectedChartType as keyof typeof descriptions] || '分析結果'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent">
            高度分析ダッシュボード
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            プラットフォーム横断的なトレンド分析
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleRefresh}
            className="neo-button p-3 rounded-xl hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={handleExport}
            className="neo-button p-3 rounded-xl hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="neo-button p-3 rounded-xl hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Control Panel */}
        {!isFullscreen && (
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="neo-card p-6 h-fit sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 neo-gradient rounded-xl">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    分析コントロール
                  </h3>
                  <p className="text-sm text-gray-500">
                    表示設定を調整
                  </p>
                </div>
              </div>

              <PlatformCategorySwitcher
                selectedChartType={selectedChartType}
                onChartTypeChange={setSelectedChartType}
              />
            </div>
          </motion.div>
        )}

        {/* Chart Area */}
        <motion.div
          className={isFullscreen ? 'col-span-1' : 'lg:col-span-3'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {getChartTitle()}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getChartDescription()}
                </p>
              </div>
              
              {/* Chart Type Indicators */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'bar', icon: BarChart3, label: 'バー' },
                  { id: 'radial', icon: Circle, label: 'ラジアル' },
                  { id: 'scatter', icon: Grid3X3, label: 'マトリックス' }
                ].map(({ id, icon: Icon, label }) => (
                  <motion.button
                    key={id}
                    onClick={() => setSelectedChartType(id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${selectedChartType === id
                        ? 'neo-gradient text-white shadow-lg'
                        : 'neo-button hover:scale-105'
                      }
                    `}
                    whileHover={{ scale: selectedChartType === id ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    {!isFullscreen && <span>{label}</span>}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chart Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChartType}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={isFullscreen ? 'h-[calc(100vh-12rem)]' : 'min-h-[600px]'}
                ref={(el) => setChartRef(el)}
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>

            {/* Analysis Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="neo-card p-4 text-center">
                <div className="text-2xl font-bold text-neo-purple mb-1">
                  {selectedPlatform === 'all' ? '4' : '1'}
                </div>
                <div className="text-sm text-gray-500">
                  アクティブプラットフォーム
                </div>
              </div>
              
              <div className="neo-card p-4 text-center">
                <div className="text-2xl font-bold text-neo-pink mb-1">
                  {selectedCategory ? '1' : '16'}
                </div>
                <div className="text-sm text-gray-500">
                  分析カテゴリ数
                </div>
              </div>
              
              <div className="neo-card p-4 text-center">
                <div className="text-2xl font-bold text-neo-blue mb-1">
                  {selectedChartType === 'scatter' ? '16' : '8'}
                </div>
                <div className="text-sm text-gray-500">
                  データポイント数
                </div>
              </div>
            </motion.div>

            {/* Insights Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="neo-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 neo-gradient rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  分析インサイト
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    主要トレンド
                  </h5>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• エンタメカテゴリが最高のエンゲージメント率を記録</li>
                    <li>• ファッション分野での成長率が顕著に上昇</li>
                    <li>• プラットフォーム間でのコンテンツ拡散パターンに変化</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    推奨アクション
                  </h5>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• TikTokでのショート動画戦略を強化</li>
                    <li>• Instagram Reelsでのファッションコンテンツ投稿</li>
                    <li>• プラットフォーム横断的なコンテンツ展開</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{
          chartType: selectedChartType,
          platform: selectedPlatform,
          category: selectedCategory,
          timestamp: new Date().toISOString(),
          data: data || []
        }}
        chartElement={chartRef}
      />
    </div>
  )
}