'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Youtube, 
  Music2, 
  Twitter, 
  Instagram,
  CheckCircle2,
  Globe
} from 'lucide-react'

export type Platform = 'youtube' | 'tiktok' | 'x' | 'instagram'

interface PlatformSelectorProps {
  selectedPlatform: Platform | null
  onPlatformSelect: (platform: Platform) => void
  className?: string
}

const platformConfigs = {
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600 dark:text-red-400',
    description: 'ビデオコンテンツとライブストリーミング'
  },
  tiktok: {
    name: 'TikTok',
    icon: Music2,
    color: 'from-black to-gray-800',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    description: 'ショート動画とバイラルコンテンツ'
  },
  x: {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    description: 'リアルタイム情報とトレンド'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 via-purple-500 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950',
    borderColor: 'border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-600 dark:text-pink-400',
    description: '写真・動画・ストーリーズ'
  }
}

export function PlatformSelector({ 
  selectedPlatform, 
  onPlatformSelect,
  className = ''
}: PlatformSelectorProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<Platform | null>(null)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            プラットフォームを選択
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          分析したいソーシャルメディアプラットフォームを選択してください
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(platformConfigs) as Platform[]).map((platform) => {
          const config = platformConfigs[platform]
          const Icon = config.icon
          const isSelected = selectedPlatform === platform
          const isHovered = hoveredPlatform === platform

          return (
            <motion.button
              key={platform}
              onClick={() => onPlatformSelect(platform)}
              onMouseEnter={() => setHoveredPlatform(platform)}
              onMouseLeave={() => setHoveredPlatform(null)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `${config.bgColor} ${config.borderColor} shadow-lg`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Platform icon with gradient background */}
              <div className="flex flex-col items-center space-y-3">
                <div className={`
                  w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} 
                  flex items-center justify-center shadow-lg
                  ${isHovered ? 'transform rotate-6' : ''}
                  transition-transform duration-200
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="text-center">
                  <h4 className={`font-medium ${isSelected ? config.textColor : 'text-gray-900 dark:text-gray-100'}`}>
                    {config.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Hover effect overlay */}
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {selectedPlatform && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {platformConfigs[selectedPlatform].name} が選択されました
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            次にアカウント名を検索してください
          </p>
        </motion.div>
      )}
    </div>
  )
}