'use client'

import { TrendCard } from './TrendCard'
import { TrendChart } from './TrendChart'
import { CategoryTrendChart } from './charts/CategoryTrendChart'
import { PlatformPieChart } from './charts/PlatformPieChart'
import { SystemControlPanel } from './admin/SystemControlPanel'
import { ThemeToggle } from './ui/theme-toggle'
import { TranscriptionChat } from './transcription/TranscriptionChat'
import { EnhancedAdvancedAnalytics } from './analytics/EnhancedAdvancedAnalytics'
import { AnalysisControls } from './ui/AnalysisControls'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Calendar, 
  Zap, 
  Globe, 
  Sparkles,
  Activity,
  Target,
  Filter,
  Settings,
  Youtube,
  Music2,
  Monitor,
  Camera,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { enrichTrendsWithCategories } from '@/lib/utils/category-mapper'

interface DashboardProps {
  youtubeData: Array<{
    id: string
    title: string
    videoId: string
    views: bigint | null
    likes: number | null
    comments: number | null
    category?: string | null
    hashtags: string[]
    collectedAt: Date
  }>
  tiktokData: Array<{
    id: string
    title: string
    videoId: string
    views: bigint | null
    likes: number | null
    comments: number | null
    category?: string | null
    hashtags: string[]
    collectedAt: Date
  }>
  chartData: Array<{
    category: string
    youtube: number
    tiktok: number
  }>
  stats: {
    totalViews: bigint
    totalVideos: number
    topCategory: string
    weekNumber: number
  }
}

export function Dashboard({ youtubeData, tiktokData, chartData, stats }: DashboardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'youtube' | 'tiktok' | 'x' | 'instagram'>('all')
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'admin' | 'transcription'>('dashboard')
  const [enrichedData, setEnrichedData] = useState<any[]>([])
  const [analysisSelectedPlatform, setAnalysisSelectedPlatform] = useState('all')
  const [analysisSelectedCategory, setAnalysisSelectedCategory] = useState('')

  // データを日本語カテゴリで拡張
  useEffect(() => {
    const allData = [...youtubeData, ...tiktokData].map(item => ({
      ...item,
      platform: youtubeData.includes(item) ? 'YouTube' : 'TikTok'
    }))
    
    const enhanced = enrichTrendsWithCategories(allData)
    setEnrichedData(enhanced)
  }, [youtubeData.length, tiktokData.length]) // lengthのみを依存配列に

  const filteredYouTubeData = selectedPlatform === 'tiktok' || selectedPlatform === 'x' || selectedPlatform === 'instagram' ? [] : youtubeData
  const filteredTikTokData = selectedPlatform === 'youtube' || selectedPlatform === 'x' || selectedPlatform === 'instagram' ? [] : tiktokData

  return (
    <div className="min-h-screen bg-neo-light dark:bg-neo-dark transition-colors duration-500">
      {/* ヒーローセクション */}
      <motion.section 
        className="relative overflow-hidden py-20 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 dark:from-purple-600/30 dark:via-pink-600/30 dark:to-blue-600/30" />
        
        {/* 浮遊する装飾要素 */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/30 to-teal-500/30 rounded-full blur-xl"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-responsive-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
                トレンド分析
                <br />
                <span className="block">ダッシュボード</span>
              </h1>
              <p className="text-responsive-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                YouTubeとTikTokの最新トレンドデータをAIで分析し、
                <br />
                <span className="font-semibold text-purple-600 dark:text-purple-400">未来のトレンドを予測</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-4"
            >
              <ThemeToggle />
              <motion.div 
                className="neo-card p-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Live</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ナビゲーション */}
          <motion.div
            className="flex gap-2 mb-8 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { key: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
              { key: 'analytics', label: '高度分析', icon: Activity },
              { key: 'admin', label: 'システム制御', icon: Settings },
              { key: 'transcription', label: '文字起こし', icon: FileText }
            ].map((view) => {
              const Icon = view.icon
              return (
                <motion.button
                  key={view.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(view.key as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    currentView === view.key
                      ? 'neo-card-inset text-purple-600 dark:text-purple-400'
                      : 'neo-card hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {view.label}
                </motion.button>
              )
            })}
          </motion.div>

          {/* プラットフォームフィルター（ダッシュボード表示時のみ） */}
          {currentView === 'dashboard' && (
            <motion.div
              className="flex gap-4 mb-8 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { key: 'all', label: 'すべて', icon: Globe },
                { key: 'youtube', label: 'YouTube', icon: Youtube },
                { key: 'tiktok', label: 'TikTok', icon: Music2 },
                { key: 'x', label: 'X', icon: Monitor },
                { key: 'instagram', label: 'Instagram', icon: Camera }
              ].map((filter, index) => {
                const Icon = filter.icon
                return (
                  <motion.button
                    key={filter.key}
                    onClick={() => setSelectedPlatform(filter.key as any)}
                    className={`glass-button px-6 py-3 flex items-center gap-2 ${
                      selectedPlatform === filter.key 
                        ? 'bg-purple-500/30 border-purple-400' 
                        : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Icon size={16} />
                    {filter.label}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* 統計カード */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              title: "総再生数",
              value: `${(Number(stats.totalViews) / 1000000).toFixed(1)}M`,
              subtitle: "今週の累計",
              icon: Eye,
              color: "from-blue-500 to-blue-600",
              bgColor: "from-blue-50 to-blue-100"
            },
            {
              title: "動画数",
              value: stats.totalVideos.toLocaleString(),
              subtitle: "収集済み動画",
              icon: BarChart3,
              color: "from-green-500 to-green-600",
              bgColor: "from-green-50 to-green-100"
            },
            {
              title: "トップカテゴリ",
              value: stats.topCategory,
              subtitle: "最も人気",
              icon: TrendingUp,
              color: "from-purple-500 to-purple-600",
              bgColor: "from-purple-50 to-purple-100"
            },
            {
              title: "分析期間",
              value: `第${stats.weekNumber}週`,
              subtitle: "2025年",
              icon: Calendar,
              color: "from-orange-500 to-orange-600",
              bgColor: "from-orange-50 to-orange-100"
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                className="neo-card p-6 hover-lift group relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </h3>
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {stat.value}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.subtitle}
                  </p>
                </div>
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ originX: 0 }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* コンテンツセクション */}
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* チャートセクション */}
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <TrendChart data={chartData} type="bar" />
                <TrendChart data={chartData} type="pie" />
              </motion.div>
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Enhanced Advanced Analytics with Bar, Radial and Scatter Matrix Charts */}
              <EnhancedAdvancedAnalytics />
              
              {/* Legacy Charts Section with Analysis Controls */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                {/* PlatformPieChart - Radial Chart */}
                <PlatformPieChart 
                  chartType="donut"
                  showStats={true}
                  size="lg"
                />
                
                {/* Analysis Controls - Middle Column */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AnalysisControls
                    selectedPlatform={analysisSelectedPlatform}
                    selectedCategory={analysisSelectedCategory}
                    onPlatformChange={setAnalysisSelectedPlatform}
                    onCategoryChange={setAnalysisSelectedCategory}
                  />
                </motion.div>
                
                {/* CategoryTrendChart */}
                <CategoryTrendChart 
                  timeRange="weekly"
                  chartType="area"
                  showAnimation={true}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <SystemControlPanel />
            </motion.div>
          )}

          {currentView === 'transcription' && (
            <motion.div
              key="transcription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <TranscriptionChat />
            </motion.div>
          )}
        </AnimatePresence>

        {/* トレンドカードセクション（ダッシュボード表示時のみ） */}
        {currentView === 'dashboard' && (
          <motion.div 
            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
          <AnimatePresence>
            {(selectedPlatform === 'all' || selectedPlatform === 'youtube') && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                    <Target size={20} className="text-white" />
                  </div>
                  <h2 className="text-responsive-xl font-bold text-red-600 dark:text-red-400">
                    YouTube トレンド
                  </h2>
                </div>
                <div className="space-y-6">
                  {filteredYouTubeData.slice(0, 5).map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <TrendCard
                        title={video.title}
                        platform="YOUTUBE"
                        views={video.views || BigInt(0)}
                        likes={video.likes || 0}
                        comments={video.comments || 0}
                        category={video.category || undefined}
                        hashtags={video.hashtags}
                        collectedAt={video.collectedAt}
                        videoId={video.videoId}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-black to-gray-800 shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h2 className="text-responsive-xl font-bold text-gray-800 dark:text-gray-100">
                    TikTok トレンド
                  </h2>
                </div>
                <div className="space-y-6">
                  {filteredTikTokData.slice(0, 5).map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <TrendCard
                        title={video.title}
                        platform="TIKTOK"
                        views={video.views || BigInt(0)}
                        likes={video.likes || 0}
                        comments={video.comments || 0}
                        category={video.category || undefined}
                        hashtags={video.hashtags}
                        collectedAt={video.collectedAt}
                        videoId={video.videoId}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}