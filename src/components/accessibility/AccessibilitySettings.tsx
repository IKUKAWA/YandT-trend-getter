'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Eye,
  Type,
  Navigation,
  Volume2,
  Contrast,
  MousePointer,
  Keyboard,
  Monitor,
  X,
  Check
} from 'lucide-react'
import { useAccessibility, useHighContrast, useReducedMotion } from '@/hooks/useAccessibility'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const { preferences, updatePreferences } = useAccessibility()
  const { isHighContrast, toggleHighContrast } = useHighContrast()
  const prefersReducedMotion = useReducedMotion()
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: keyof typeof preferences) => {
    const newValue = !preferences[key]
    updatePreferences({ [key]: newValue })
    setHasChanges(true)

    // Apply immediate effects
    if (key === 'highContrast') {
      toggleHighContrast()
    }
    if (key === 'largeText') {
      if (newValue) {
        document.body.classList.add('large-text')
      } else {
        document.body.classList.remove('large-text')
      }
    }
    if (key === 'reduceMotion') {
      if (newValue) {
        document.body.classList.add('reduce-motion')
      } else {
        document.body.classList.remove('reduce-motion')
      }
    }
  }

  const resetToDefaults = () => {
    const defaults = {
      reduceMotion: prefersReducedMotion,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    }
    updatePreferences(defaults)
    setHasChanges(true)

    // Remove all accessibility classes
    document.body.classList.remove('high-contrast', 'large-text', 'reduce-motion')
  }

  const settingItems = [
    {
      key: 'reduceMotion' as const,
      title: 'モーション軽減',
      description: 'アニメーションや動きのあるエフェクトを減らします',
      icon: MousePointer,
      color: 'text-blue-500'
    },
    {
      key: 'highContrast' as const,
      title: 'ハイコントラスト',
      description: '色のコントラストを高めて視認性を向上させます',
      icon: Contrast,
      color: 'text-purple-500'
    },
    {
      key: 'largeText' as const,
      title: '大きな文字',
      description: 'テキストサイズを大きくして読みやすくします',
      icon: Type,
      color: 'text-green-500'
    },
    {
      key: 'screenReader' as const,
      title: 'スクリーンリーダー最適化',
      description: 'スクリーンリーダー用の詳細な説明を有効にします',
      icon: Volume2,
      color: 'text-orange-500'
    },
    {
      key: 'keyboardNavigation' as const,
      title: 'キーボードナビゲーション',
      description: 'キーボードのみでの操作を強化します',
      icon: Keyboard,
      color: 'text-red-500'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-labelledby="accessibility-settings-title"
            aria-describedby="accessibility-settings-description"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 
                        id="accessibility-settings-title"
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                      >
                        アクセシビリティ設定
                      </h2>
                      <p 
                        id="accessibility-settings-description"
                        className="text-sm text-gray-500 dark:text-gray-400"
                      >
                        あなたに最適な設定をカスタマイズしてください
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="設定を閉じる"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Settings List */}
              <div className="p-6 space-y-4">
                {settingItems.map((item) => {
                  const Icon = item.icon
                  const isEnabled = preferences[item.key]

                  return (
                    <motion.div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggle(item.key)}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isEnabled 
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                        aria-labelledby={`setting-${item.key}-label`}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {/* Current Status */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  システム検出設定
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">モーション軽減の設定</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prefersReducedMotion 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {prefersReducedMotion ? '有効' : '無効'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ハイコントラスト</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isHighContrast 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {isHighContrast ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    デフォルトに戻す
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {hasChanges && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span>設定が保存されました</span>
                      </div>
                    )}
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      完了
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}