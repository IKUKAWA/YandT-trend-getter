'use client'

import { formatNumber, formatDate } from '@/lib/utils'
import { ExternalLink, Eye, Heart, MessageCircle, TrendingUp, Play, Music } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface TrendCardProps {
  title: string
  platform: 'YOUTUBE' | 'TIKTOK'
  views: bigint | number
  likes: number
  comments: number
  category?: string
  hashtags: string[]
  collectedAt: Date | string
  videoId: string
}

export function TrendCard({
  title,
  platform,
  views,
  likes,
  comments,
  category,
  hashtags,
  collectedAt,
  videoId,
}: TrendCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const platformConfig = {
    YOUTUBE: {
      color: 'from-red-500 to-red-600',
      icon: Play,
      bgGradient: 'from-red-50 via-red-100 to-red-200',
      link: `https://youtube.com/watch?v=${videoId}`,
      name: 'YouTube',
      accentColor: 'text-red-500'
    },
    TIKTOK: {
      color: 'from-black to-gray-800',
      icon: Music,
      bgGradient: 'from-gray-50 via-gray-100 to-gray-200',
      link: `https://tiktok.com/@user/video/${videoId}`,
      name: 'TikTok',
      accentColor: 'text-black'
    },
  }

  const config = platformConfig[platform]
  const PlatformIcon = config.icon

  const engagementRate = likes > 0 ? ((likes + comments) / Number(views)) * 100 : 0

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* メインカード */}
      <motion.div
        className="neo-card p-6 relative overflow-hidden cursor-pointer"
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* 背景グラデーション */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
        
        {/* プラットフォームヘッダー */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`p-2 rounded-2xl bg-gradient-to-r ${config.color} shadow-lg`}>
              <PlatformIcon size={16} className="text-white" />
            </div>
            <div>
              <div className={`font-bold ${config.accentColor} text-sm`}>
                {config.name}
              </div>
              {category && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {category}
                </div>
              )}
            </div>
          </motion.div>

          <motion.a
            href={config.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink size={16} className="text-gray-600 dark:text-gray-300" />
          </motion.a>
        </div>

        {/* タイトル */}
        <motion.h3 
          className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 line-clamp-2 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>

        {/* 統計情報 */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="neo-card-inset p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">再生</span>
            </div>
            <div className="font-bold text-sm text-gray-800 dark:text-gray-100">
              {formatNumber(views)}
            </div>
          </div>

          <div className="neo-card-inset p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart size={14} className="text-pink-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">いいね</span>
            </div>
            <div className="font-bold text-sm text-gray-800 dark:text-gray-100">
              {formatNumber(likes)}
            </div>
          </div>

          <div className="neo-card-inset p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle size={14} className="text-green-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">コメント</span>
            </div>
            <div className="font-bold text-sm text-gray-800 dark:text-gray-100">
              {formatNumber(comments)}
            </div>
          </div>
        </motion.div>

        {/* エンゲージメント率 */}
        <motion.div 
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <TrendingUp size={16} className="text-purple-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            エンゲージメント率:
          </span>
          <span className="font-bold text-purple-600 dark:text-purple-400">
            {engagementRate.toFixed(2)}%
          </span>
        </motion.div>

        {/* ハッシュタグ */}
        <AnimatePresence>
          {hashtags.length > 0 && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex flex-wrap gap-2">
                {hashtags.slice(0, isHovered ? hashtags.length : 3).map((tag, index) => (
                  <motion.span
                    key={index}
                    className="glass-button text-xs px-3 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    #{tag}
                  </motion.span>
                ))}
                {hashtags.length > 3 && !isHovered && (
                  <motion.span 
                    className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    +{hashtags.length - 3} more
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* フッター */}
        <motion.div 
          className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span>収集日時: {formatDate(collectedAt)}</span>
          <motion.div
            className="flex items-center gap-1"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live</span>
          </motion.div>
        </motion.div>

        {/* ホバー時のオーバーレイ効果 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 浮遊する装飾要素 */}
      <motion.div
        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-70"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full opacity-0 group-hover:opacity-50"
        animate={{ 
          y: [0, 10, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  )
}