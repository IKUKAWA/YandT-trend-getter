'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Brain,
  RefreshCw,
  Download,
  Settings,
  Loader2,
  Monitor,
  Zap,
  Filter,
  Menu,
  CheckCircle,
  Users
} from 'lucide-react'
import { useOptimizedAPI, useMemoryMonitor, useBatchUpdates } from '@/hooks/useOptimizedData'
import { useMobileDetection, useResponsiveSpacing, useResponsiveGrid } from '@/hooks/useMobileDetection'
import { MobileOptimizedTabs } from '../ui/MobileOptimizedTabs'
import { ResponsiveCard, ResponsiveCardGrid, MobileMetricCard } from '../ui/ResponsiveCard'
import { MobileActionSheet, MobileFilterSheet } from '../ui/MobileActionSheet'
import { AdvancedExportModal } from '../export/AdvancedExportModal'
import { RealtimeChannelSearch } from './RealtimeChannelSearch'
import { ChannelBasicInfoCard } from './ChannelBasicInfo'
import { ChannelGrowthChart } from './ChannelGrowthChart'
import { CompetitorComparisonComponent } from './CompetitorComparison'
import { MonetizationAnalysisComponent } from './MonetizationAnalysis'
import { AIChannelReportComponent } from './AIChannelReport'
import { ChannelComparison } from './ChannelComparison'
import { ChannelSearchResult, ChannelAnalysis } from '@/types/channel'
import { generateMockAnalysisData } from '@/lib/converters/realtime-to-analysis'

type AnalysisTab = 'overview' | 'growth' | 'competition' | 'monetization' | 'ai-report' | 'comparison'

export function ChannelAnalysisDashboard() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelSearchResult | null>(null)
  const [channelAnalysis, setChannelAnalysis] = useState<ChannelAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed')
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(true)
  
  // Mobile detection and responsive utilities
  const { isMobile, isTablet, screenWidth } = useMobileDetection()
  const { container, gap, sectionSpacing, cardPadding } = useResponsiveSpacing()
  const gridColumns = useResponsiveGrid(2)
  
  // Performance monitoring
  const { memory, cacheSize, clearAllCaches } = useMemoryMonitor()
  
  
  // Batch state updates for better performance
  const { addToBatch: addStateUpdate, flushBatch: flushStateUpdates } = useBatchUpdates(
    (updates: Array<() => void>) => {
      updates.forEach(update => update())
    },
    5, // batch size
    50  // delay ms
  )

  // Memoized tabs to prevent unnecessary re-renders with mobile optimization
  const tabs = useMemo(() => [
    { key: 'overview' as AnalysisTab, label: isMobile ? '概要' : '概要', icon: BarChart3 },
    { key: 'growth' as AnalysisTab, label: isMobile ? '成長' : '成長分析', icon: TrendingUp },
    { key: 'competition' as AnalysisTab, label: isMobile ? '競合' : '競合比較', icon: Target },
    { key: 'monetization' as AnalysisTab, label: isMobile ? '収益' : '収益予測', icon: DollarSign },
    { key: 'ai-report' as AnalysisTab, label: isMobile ? 'AI' : 'AIレポート', icon: Brain },
    { key: 'comparison' as AnalysisTab, label: isMobile ? '比較' : 'チャンネル比較', icon: Target }
  ], [isMobile])
  
  // Memoized channel data for export
  const exportChannelsData = useMemo(() => 
    selectedChannel && channelAnalysis ? [{
      channel: selectedChannel,
      analysis: channelAnalysis
    }] : [],
    [selectedChannel, channelAnalysis]
  )

  // Optimized channel selection with caching and batch updates
  const handleChannelSelect = useCallback(async (channel: ChannelSearchResult) => {
    // Batch state updates
    addStateUpdate(() => setSelectedChannel(channel))
    addStateUpdate(() => setIsLoading(true))
    addStateUpdate(() => setActiveTab('overview'))
    addStateUpdate(() => setError(null))
    flushStateUpdates()
    
    try {
      // Hide search form when channel is selected
      setShowSearchForm(false)
      
      // Generate mock analysis data for realtime search results
      console.log('Generating mock analysis for realtime result:', channel.name)
      
      // Create a RealtimeSearchResult-like object from ChannelSearchResult
      const realtimeResult = {
        id: channel.id,
        platform: channel.platform as 'youtube' | 'tiktok' | 'x' | 'instagram',
        username: channel.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: channel.name,
        verified: channel.verified || false,
        followerCount: channel.subscriberCount,
        description: channel.description,
        isPublic: true,
        category: channel.category,
        url: `https://${channel.platform}.com/@${channel.name.toLowerCase().replace(/\s+/g, '_')}`
      }
      
      // Generate comprehensive mock analysis
      const mockAnalysis = generateMockAnalysisData(realtimeResult)
      setChannelAnalysis(mockAnalysis)
      setIsLoading(false)
      return
      
    } catch (error) {
      console.error('Analysis loading error:', error)
      const errorMessage = error instanceof Error ? error.message : '分析データの読み込みに失敗しました'
      setError(errorMessage)
      
      // Fallback to basic analysis if full analysis fails
      try {
        // For realtime results, use mock data as fallback
        const realtimeResult = {
          id: channel.id,
          platform: channel.platform as 'youtube' | 'tiktok' | 'x' | 'instagram',
          username: channel.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: channel.name,
          verified: channel.verified || false,
          followerCount: channel.subscriberCount,
          description: channel.description,
          isPublic: true,
          category: channel.category,
          url: `https://${channel.platform}.com/@${channel.name.toLowerCase().replace(/\s+/g, '_')}`
        }
        const fallbackAnalysis = generateMockAnalysisData(realtimeResult)
        setChannelAnalysis(fallbackAnalysis)
      } catch (fallbackError) {
        console.error('Fallback analysis failed:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }, [analysisDepth, addStateUpdate, flushStateUpdates])

  const handleRefreshData = async () => {
    if (!selectedChannel) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      // For realtime search results, regenerate mock analysis data
      const realtimeResult = {
        id: selectedChannel.id,
        platform: selectedChannel.platform as 'youtube' | 'tiktok' | 'x' | 'instagram',
        username: selectedChannel.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: selectedChannel.name,
        verified: selectedChannel.verified || false,
        followerCount: selectedChannel.subscriberCount,
        description: selectedChannel.description,
        isPublic: true,
        category: selectedChannel.category,
        url: `https://${selectedChannel.platform}.com/@${selectedChannel.name.toLowerCase().replace(/\s+/g, '_')}`
      }
      
      // Generate fresh mock analysis with slight variations
      const refreshedAnalysis = generateMockAnalysisData(realtimeResult)
      setChannelAnalysis(refreshedAnalysis)
    } catch (error) {
      console.error('Refresh error:', error)
      const errorMessage = error instanceof Error ? error.message : 'データの更新に失敗しました'
      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportAnalysis = () => {
    if (!channelAnalysis) return
    
    const exportData = {
      channel: channelAnalysis.basicInfo,
      analysis: {
        growth: channelAnalysis.growthAnalysis,
        competition: channelAnalysis.competitorComparison,
        monetization: channelAnalysis.monetization,
        aiReport: channelAnalysis.aiReport
      },
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `channel-analysis-${channelAnalysis.basicInfo.channelName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-neo-light dark:bg-neo-dark transition-colors duration-500">
      <div className={`max-w-7xl mx-auto ${container} ${sectionSpacing}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent mb-4`}>
            個別チャンネル分析
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-2`}>
            YouTube、TikTok、X、Instagramアカウントの詳細分析、競合比較、収益化戦略をAIが包括的に提供
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>リアルタイム検索 - 実際のソーシャルメディアアカウントを検索</span>
          </div>
        </motion.div>

        {/* Search Section */}
        <AnimatePresence>
          {showSearchForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <RealtimeChannelSearch
                onChannelSelect={handleChannelSelect}
                selectedChannel={selectedChannel}
                onError={setError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Channel Header */}
        {!showSearchForm && selectedChannel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="neo-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {selectedChannel.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedChannel.name}
                      </h2>
                      {selectedChannel.verified && (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedChannel.subscriberCount.toLocaleString()} フォロワー</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 capitalize">
                          {selectedChannel.platform}
                        </span>
                      </div>
                      <span>{selectedChannel.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(null)
                    setChannelAnalysis(null)
                    setShowSearchForm(true)
                    setError(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  別のアカウントを検索
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Options */}
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 neo-card rounded-xl max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                分析の詳細度
              </span>
              <select
                value={analysisDepth}
                onChange={(e) => setAnalysisDepth(e.target.value as 'basic' | 'detailed' | 'comprehensive')}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="basic">基本</option>
                <option value="detailed">詳細</option>
                <option value="comprehensive">包括的</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Analysis Content */}
        <AnimatePresence>
          {selectedChannel && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">エラー</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </motion.div>
              )}
              
              {/* Action Bar */}
              <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
                <div className="flex items-center gap-3">
                  <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-gray-100`}>
                    {isMobile ? selectedChannel.name : `${selectedChannel.name} 分析レポート`}
                  </h2>
                  {channelAnalysis && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        更新日: {new Date(channelAnalysis.lastAnalyzed).toLocaleDateString('ja-JP')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        analysisDepth === 'comprehensive' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        analysisDepth === 'detailed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {analysisDepth === 'comprehensive' ? '包括的' : analysisDepth === 'detailed' ? '詳細' : '基本'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mobile: Compact action buttons */}
                {isMobile ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={handleRefreshData}
                        disabled={isRefreshing}
                        className={`p-2 rounded-lg transition-all ${
                          isRefreshing
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'neo-button'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isRefreshing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => setShowMobileFilters(true)}
                        className="p-2 neo-button rounded-lg"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Filter className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <motion.button
                      onClick={() => setShowMobileMenu(true)}
                      className="p-2 neo-button rounded-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Menu className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  /* Desktop: Full action buttons */
                  <div className="flex items-center gap-3">
                    {/* Performance Monitor Toggle */}
                    <motion.button
                      onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                      className={`p-2 rounded-lg transition-all ${
                        showPerformanceMonitor
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'neo-button hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="パフォーマンス監視"
                    >
                      <Monitor className="w-4 h-4" />
                    </motion.button>
                    
                    {/* Cache Clear Button */}
                    <motion.button
                      onClick={clearAllCaches}
                      className="p-2 neo-button rounded-lg hover:scale-105 transition-transform"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="キャッシュをクリア"
                    >
                      <Zap className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={handleRefreshData}
                      disabled={isRefreshing}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isRefreshing
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'neo-button hover:scale-105'
                      }`}
                      whileHover={{ scale: isRefreshing ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      更新
                    </motion.button>

                    <motion.button
                      onClick={() => setShowExportModal(true)}
                      disabled={!channelAnalysis}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium neo-gradient text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      whileHover={{ scale: channelAnalysis ? 1.05 : 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                      エクスポート
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <MobileOptimizedTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(tabKey) => setActiveTab(tabKey as AnalysisTab)}
                variant="default"
              />

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Mobile: Metrics Cards */}
                      {isMobile && channelAnalysis && (
                        <ResponsiveCardGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }} gap="small">
                          <MobileMetricCard
                            title="登録者数"
                            value={channelAnalysis.basicInfo.subscriberCount.toLocaleString()}
                            change={channelAnalysis.growthAnalysis.monthlyGrowthRate}
                            trend={channelAnalysis.growthAnalysis.monthlyGrowthRate > 0 ? 'up' : 'down'}
                            icon={BarChart3}
                            color="purple"
                            compact
                          />
                          <MobileMetricCard
                            title="平均再生回数"
                            value={channelAnalysis.growthAnalysis.current.avgViews.toLocaleString()}
                            icon={TrendingUp}
                            color="blue"
                            compact
                          />
                          <MobileMetricCard
                            title="エンゲージメント率"
                            value={`${(channelAnalysis.growthAnalysis.current.engagementRate * 100).toFixed(3)}%`}
                            icon={Target}
                            color="green"
                            compact
                          />
                          <MobileMetricCard
                            title="月間成長率"
                            value={`${channelAnalysis.growthAnalysis.monthlyGrowthRate}%`}
                            trend={channelAnalysis.growthAnalysis.monthlyGrowthRate > 0 ? 'up' : 'down'}
                            icon={DollarSign}
                            color="orange"
                            compact
                          />
                        </ResponsiveCardGrid>
                      )}

                      {/* Channel Info and Chart */}
                      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'xl:grid-cols-2 gap-8'}`}>
                        <ResponsiveCard padding={isMobile ? 'small' : 'medium'} compact={isMobile}>
                          <ChannelBasicInfoCard
                            channelInfo={channelAnalysis?.basicInfo || {
                              id: selectedChannel.id,
                              platform: selectedChannel.platform,
                              channelId: selectedChannel.id,
                              channelName: selectedChannel.name,
                              subscriberCount: selectedChannel.subscriberCount,
                              videoCount: 0,
                              createdDate: new Date(),
                              category: selectedChannel.category,
                              lastUpdated: new Date(),
                              description: selectedChannel.description
                            }}
                            growthAnalysis={channelAnalysis?.growthAnalysis}
                            isLoading={isLoading}
                          />
                        </ResponsiveCard>
                        
                        {channelAnalysis && (
                          <ResponsiveCard padding={isMobile ? 'small' : 'medium'} compact={isMobile}>
                            <ChannelGrowthChart
                              growthAnalysis={channelAnalysis.growthAnalysis}
                              channelId={selectedChannel.id}
                              isLoading={isLoading}
                              onRefresh={handleRefreshData}
                              enableProjections={true}
                            />
                          </ResponsiveCard>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'growth' && channelAnalysis && (
                    <ChannelGrowthChart
                      growthAnalysis={channelAnalysis.growthAnalysis}
                      channelId={selectedChannel.id}
                      isLoading={isLoading}
                      onRefresh={handleRefreshData}
                      enableProjections={true}
                    />
                  )}

                  {activeTab === 'competition' && channelAnalysis && (
                    <CompetitorComparisonComponent
                      competitorData={channelAnalysis.competitorComparison}
                      isLoading={isLoading}
                    />
                  )}

                  {activeTab === 'monetization' && channelAnalysis && (
                    <MonetizationAnalysisComponent
                      monetizationData={channelAnalysis.monetization}
                      isLoading={isLoading}
                    />
                  )}

                  {activeTab === 'ai-report' && channelAnalysis && (
                    <AIChannelReportComponent
                      aiReport={channelAnalysis.aiReport}
                      isLoading={isLoading}
                    />
                  )}

                  {activeTab === 'comparison' && (
                    <ChannelComparison />
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-neo-purple" />
                        <div className="text-left">
                          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {analysisDepth === 'comprehensive' ? '包括的分析' : analysisDepth === 'detailed' ? '詳細分析' : '基本分析'}を実行中...
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            成長データ、収益分析、AIレポートを生成しています
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* No Data State */}
                  {!isLoading && !channelAnalysis && selectedChannel && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 p-4 neo-card rounded-full">
                        <BarChart3 className="w-full h-full text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        分析データを取得できませんでした
                      </h3>
                      <p className="text-gray-500 mb-4">
                        チャンネルデータの読み込みに問題が発生しました。
                      </p>
                      <button
                        onClick={() => handleChannelSelect(selectedChannel)}
                        className="neo-button px-6 py-2 rounded-lg font-medium"
                      >
                        再試行
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Monitor */}
        <AnimatePresence>
          {showPerformanceMonitor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="neo-card p-4 overflow-hidden"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                パフォーマンス監視
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">メモリ使用量</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {memory.heapUsed ? `${(memory.heapUsed / 1024 / 1024).toFixed(3)}MB` : 'N/A'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">キャッシュサイズ</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {cacheSize}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">メモリ総量</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {memory.heapTotal ? `${(memory.heapTotal / 1024 / 1024).toFixed(3)}MB` : 'N/A'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">最終更新</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {new Date(memory.timestamp).toLocaleTimeString('ja-JP')}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-end">
                <button
                  onClick={clearAllCaches}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  全キャッシュをクリア
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Action Sheets */}
        <MobileActionSheet
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          title="オプション"
          height="auto"
        >
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowExportModal(true)
                setShowMobileMenu(false)
              }}
              disabled={!channelAnalysis}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-purple-500" />
              <span className="font-medium">エクスポート</span>
            </button>

            <button
              onClick={() => {
                setShowPerformanceMonitor(!showPerformanceMonitor)
                setShowMobileMenu(false)
              }}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg"
            >
              <Monitor className="w-5 h-5 text-blue-500" />
              <span className="font-medium">パフォーマンス監視</span>
            </button>

            <button
              onClick={() => {
                clearAllCaches()
                setShowMobileMenu(false)
              }}
              className="w-full flex items-center gap-3 p-4 neo-card rounded-lg"
            >
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-medium">キャッシュをクリア</span>
            </button>
          </div>
        </MobileActionSheet>

        <MobileFilterSheet
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分析の詳細度
              </label>
              <select
                value={analysisDepth}
                onChange={(e) => {
                  setAnalysisDepth(e.target.value as 'basic' | 'detailed' | 'comprehensive')
                  setShowMobileFilters(false)
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option value="basic">基本</option>
                <option value="detailed">詳細</option>
                <option value="comprehensive">包括的</option>
              </select>
            </div>
          </div>
        </MobileFilterSheet>

        {/* Export Modal */}
        <AdvancedExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          channels={exportChannelsData}
          filters={{
            analysisDepth,
            selectedTab: activeTab
          }}
        />

        {/* Empty State */}
        {!selectedChannel && showSearchForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 p-6 neo-card rounded-full">
              <Search className="w-full h-full text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              アカウント分析を開始
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              上記でプラットフォームを選択し、YouTube、TikTok、X、Instagramアカウントを検索して詳細な分析を開始してください。
            </p>
          </motion.div>
        )}
      </div>

    </div>
  )
}