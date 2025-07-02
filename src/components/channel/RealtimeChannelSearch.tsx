'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { PlatformSelector, Platform } from './PlatformSelector'
import { RealtimeSearchResult } from '@/lib/api/realtime-search'
import { ChannelSearchResult } from '@/types/channel'

interface RealtimeChannelSearchProps {
  onChannelSelect: (channel: ChannelSearchResult) => void
  selectedChannel?: ChannelSearchResult | null
  onError?: (error: string) => void
}

// リアルタイム検索結果をChannelSearchResultに変換
function convertToChannelSearchResult(result: RealtimeSearchResult): ChannelSearchResult {
  return {
    id: result.id,
    platform: result.platform as 'youtube' | 'tiktok',
    name: result.displayName,
    subscriberCount: result.followerCount,
    category: result.category || 'その他',
    verified: result.verified,
    description: result.description
  }
}

export function RealtimeChannelSearch({ 
  onChannelSelect, 
  selectedChannel,
  onError
}: RealtimeChannelSearchProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RealtimeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // 検索実行
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (query.trim().length >= 2 && selectedPlatform) {
        setIsSearching(true)
        setError(null)
        
        try {
          const response = await fetch(
            `/api/search/realtime?platform=${selectedPlatform}&q=${encodeURIComponent(query)}&maxResults=20&safe=true`
          )
          
          const data = await response.json()
          
          if (data.success) {
            setSearchResults(data.results)
            setShowResults(true)
            setSelectedIndex(-1)
            
            // 検索履歴に追加
            if (!searchHistory.includes(query)) {
              setSearchHistory(prev => [query, ...prev].slice(0, 5))
            }
          } else {
            setError(data.error || '検索中にエラーが発生しました')
            setSearchResults([])
            onError?.(data.error)
          }
        } catch (error) {
          console.error('Search error:', error)
          const errorMessage = error instanceof Error ? error.message : '検索中にエラーが発生しました'
          setError(errorMessage)
          setSearchResults([])
          onError?.(errorMessage)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
        setError(null)
      }
    }, 500) // デバウンス時間を増加（API負荷軽減）

    return () => clearTimeout(delayedSearch)
  }, [query, selectedPlatform, onError, searchHistory])

  // アカウント選択処理
  const handleAccountSelect = (account: RealtimeSearchResult) => {
    const channelData = convertToChannelSearchResult(account)
    onChannelSelect(channelData)
    setQuery(account.displayName)
    setShowResults(false)
    setSelectedIndex(-1)
  }

  // キーボードナビゲーション
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleAccountSelect(searchResults[selectedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        setShowResults(false)
        setSelectedIndex(-1)
        searchInputRef.current?.focus()
        break
    }
  }

  // プラットフォーム選択時のリセット
  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform)
    setQuery('')
    setSearchResults([])
    setShowResults(false)
    setError(null)
    
    // 検索欄にフォーカス
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // フォロワー数のフォーマット
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(3)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(3)}K`
    }
    return count.toString()
  }

  // プラットフォームアイコン
  const getPlatformIcon = (platform: Platform) => {
    const icons = {
      youtube: '🎥',
      tiktok: '🎵', 
      x: '🐦',
      instagram: '📷'
    }
    return icons[platform] || '🌐'
  }

  // プラットフォームカラー
  const getPlatformColor = (platform: Platform) => {
    const colors = {
      youtube: 'text-red-500',
      tiktok: 'text-gray-800 dark:text-gray-200',
      x: 'text-blue-500',
      instagram: 'text-pink-500'
    }
    return colors[platform] || 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* プラットフォーム選択 */}
      {!selectedPlatform && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card p-6 rounded-xl"
        >
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformSelect={handlePlatformSelect}
          />
        </motion.div>
      )}

      {/* 選択されたプラットフォームと検索フォーム */}
      {selectedPlatform && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* プラットフォーム表示 */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getPlatformIcon(selectedPlatform)}</div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedPlatform === 'youtube' && 'YouTube'}
                  {selectedPlatform === 'tiktok' && 'TikTok'}
                  {selectedPlatform === 'x' && 'X (Twitter)'}
                  {selectedPlatform === 'instagram' && 'Instagram'}
                  での検索
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  アカウント名またはキーワードを入力してください
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              プラットフォームを変更
            </button>
          </div>

          {/* 検索フォーム */}
          <div className="relative">
            <motion.div
              className="neo-card p-4 rounded-xl"
              whileFocusWithin={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`${selectedPlatform === 'youtube' ? 'チャンネル名' : 'アカウント名'}を検索...`}
                    className="w-full bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    aria-label="アカウント検索"
                    aria-expanded={showResults}
                    aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
                    role="combobox"
                  />
                </div>

                {isSearching && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}

                {error && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* 検索履歴 */}
              {searchHistory.length > 0 && !query && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">最近の検索</p>
                  <div className="flex gap-2 flex-wrap">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(term)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* 検索結果 */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  ref={resultsRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-xl z-30 max-h-96 overflow-y-auto"
                >
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>{searchResults.length}件の検索結果</span>
                    </div>
                    
                    {searchResults.map((account, index) => {
                      const isSelected = index === selectedIndex
                      return (
                        <motion.button
                          key={account.id}
                          id={`search-result-${index}`}
                          onClick={() => handleAccountSelect(account)}
                          className={`w-full p-4 rounded-lg text-left transition-all ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-4">
                            {/* プロフィール画像/アイコン */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {account.profileImageUrl ? (
                                <img 
                                  src={account.profileImageUrl} 
                                  alt={account.displayName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                account.displayName.charAt(0).toUpperCase()
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* アカウント名と認証マーク */}
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {account.displayName}
                                </h4>
                                {account.verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              
                              {/* ユーザーネーム */}
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                @{account.username}
                              </p>
                              
                              {/* フォロワー数 */}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{formatFollowerCount(account.followerCount)}</span>
                                </div>
                                <div className={`flex items-center gap-1 ${getPlatformColor(account.platform)}`}>
                                  <span className="text-xs">{getPlatformIcon(account.platform)}</span>
                                  <span className="text-xs capitalize">{account.platform}</span>
                                </div>
                              </div>
                              
                              {/* 説明文 */}
                              {account.description && (
                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                  {account.description}
                                </p>
                              )}
                            </div>

                            {/* 選択アイコン */}
                            <div className="flex-shrink-0">
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* エラーメッセージ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-30 p-4 border-l-4 border-red-500"
              >
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* 検索結果なし */}
            {showResults && searchResults.length === 0 && !isSearching && !error && query.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-30 p-6 text-center"
              >
                <div className="text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">「{query}」の検索結果が見つかりませんでした</p>
                  <p className="text-xs mt-1">別のキーワードで検索してみてください</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* 選択されたアカウント表示 */}
      {selectedChannel && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {selectedChannel.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedChannel.name}
                </h4>
                {selectedChannel.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="w-3 h-3" />
                {formatFollowerCount(selectedChannel.subscriberCount)} フォロワー
                <span className="mx-1">•</span>
                {selectedChannel.category}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setQuery('')}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}