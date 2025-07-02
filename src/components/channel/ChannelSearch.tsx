'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Youtube,
  Music2,
  Users,
  CheckCircle,
  Loader2,
  ExternalLink,
  Filter,
  AlertCircle,
  Settings
} from 'lucide-react'
import { ChannelSearchResult } from '@/types/channel'
import { searchChannels, advancedChannelSearch } from '@/lib/data/channelData'
import { 
  useFocusManagement, 
  useScreenReader, 
  useKeyboardNavigation,
  useAccessibility,
  useReducedMotion 
} from '@/hooks/useAccessibility'

interface ChannelSearchProps {
  onChannelSelect: (channel: ChannelSearchResult) => void
  selectedChannel?: ChannelSearchResult | null
  showAdvancedFilters?: boolean
  onError?: (error: string) => void
}

export function ChannelSearch({ 
  onChannelSelect, 
  selectedChannel, 
  showAdvancedFilters = false,
  onError
}: ChannelSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChannelSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchOptions, setSearchOptions] = useState({
    platform: 'all' as 'all' | 'youtube' | 'tiktok',
    category: '',
    minSubscribers: '',
    maxSubscribers: '',
    verified: 'all' as 'all' | 'true' | 'false'
  })

  // Accessibility hooks
  const { preferences } = useAccessibility()
  const { announce } = useScreenReader()
  const prefersReducedMotion = useReducedMotion()
  const { containerRef, focusFirst } = useFocusManagement({ 
    trapFocus: showResults || showFilters,
    restoreFocus: true 
  })
  
  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (query.trim().length >= 2) {
        // Debug logging - remove in production
        if (process.env.NODE_ENV === 'development') {
          console.log('Starting search for:', query)
          console.log('Search options:', searchOptions)
          console.log('Show filters:', showFilters)
          console.log('Has advanced filters:', hasAdvancedFilters())
        }
        
        setIsSearching(true)
        setError(null)
        try {
          let searchResults: ChannelSearchResult[]
          
          if (showAdvancedFilters && showFilters && hasAdvancedFilters()) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Using advanced search')
            }
            // Use advanced search
            const response = await advancedChannelSearch({
              query,
              filters: {
                ...(searchOptions.platform !== 'all' && { 
                  platforms: [searchOptions.platform] 
                }),
                ...(searchOptions.category && { 
                  categories: [searchOptions.category] 
                }),
                ...(searchOptions.minSubscribers || searchOptions.maxSubscribers) && {
                  subscriberRange: {
                    ...(searchOptions.minSubscribers && { 
                      min: parseInt(searchOptions.minSubscribers) 
                    }),
                    ...(searchOptions.maxSubscribers && { 
                      max: parseInt(searchOptions.maxSubscribers) 
                    })
                  }
                },
                ...(searchOptions.verified !== 'all' && { 
                  verifiedOnly: searchOptions.verified === 'true' 
                })
              },
              sorting: { field: 'subscriberCount', order: 'desc' },
              pagination: { limit: 20, offset: 0 }
            })
            searchResults = response.results
            if (process.env.NODE_ENV === 'development') {
              console.log('Advanced search results:', searchResults)
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('Using basic search')
            }
            // Use basic search
            const options = {
              ...(searchOptions.platform !== 'all' && { platform: searchOptions.platform }),
              ...(searchOptions.category && { category: searchOptions.category }),
              ...(searchOptions.minSubscribers && { minSubscribers: parseInt(searchOptions.minSubscribers) }),
              ...(searchOptions.maxSubscribers && { maxSubscribers: parseInt(searchOptions.maxSubscribers) }),
              ...(searchOptions.verified !== 'all' && { verified: searchOptions.verified }),
              limit: 10,
              offset: 0
            }
            if (process.env.NODE_ENV === 'development') {
              console.log('Basic search options:', options)
            }
            searchResults = await searchChannels(query, options)
            if (process.env.NODE_ENV === 'development') {
              console.log('Basic search results:', searchResults)
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Final search results:', searchResults)
          }
          setResults(searchResults)
          setShowResults(true)
          setSelectedIndex(-1)
          
          // Announce search results to screen readers
          if (preferences.screenReader) {
            const resultCount = searchResults.length
            if (resultCount === 0) {
              announce('検索結果が見つかりませんでした', { priority: 'polite' })
            } else {
              announce(`${resultCount}件の検索結果が見つかりました`, { priority: 'polite' })
            }
          }
        } catch (error) {
          console.error('Search error:', error)
          const errorMessage = error instanceof Error ? error.message : '検索中にエラーが発生しました'
          setError(errorMessage)
          onError?.(errorMessage)
          setResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
        setShowResults(false)
        setError(null)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query, searchOptions, showFilters, showAdvancedFilters, onError])

  const hasAdvancedFilters = () => {
    return searchOptions.platform !== 'all' ||
           searchOptions.category !== '' ||
           searchOptions.minSubscribers !== '' ||
           searchOptions.maxSubscribers !== '' ||
           searchOptions.verified !== 'all'
  }

  const handleChannelSelect = (channel: ChannelSearchResult) => {
    onChannelSelect(channel)
    setQuery(channel.name)
    setShowResults(false)
    setSelectedIndex(-1)
    
    // Announce selection to screen readers
    if (preferences.screenReader) {
      announce(`${channel.name}が選択されました`, { priority: 'assertive' })
    }
  }

  // Keyboard navigation for search results
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleChannelSelect(results[selectedIndex])
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

  // Announce keyboard navigation to screen readers
  useEffect(() => {
    if (preferences.screenReader && selectedIndex >= 0 && results[selectedIndex]) {
      const channel = results[selectedIndex]
      announce(
        `${selectedIndex + 1}番目: ${channel.name}, ${channel.platform}, ${formatSubscriberCount(channel.subscriberCount)}登録者`,
        { priority: 'polite' }
      )
    }
  }, [selectedIndex, results, preferences.screenReader, announce])

  const renderPlatformIcon = (platform: 'youtube' | 'tiktok', className: string) => {
    const Icon = platform === 'youtube' ? Youtube : Music2
    return <Icon className={className} />
  }

  const getPlatformColor = (platform: 'youtube' | 'tiktok') => {
    return platform === 'youtube' ? 'text-red-500' : 'text-black dark:text-white'
  }

  const formatSubscriberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(3)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(3)}K`
    }
    return count.toString()
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className="neo-card p-4 rounded-xl"
          whileFocusWithin={prefersReducedMotion ? {} : { scale: 1.02 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 neo-gradient rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="チャンネル名またはキーワードで検索..."
                className="w-full bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
                aria-label="チャンネル検索"
                aria-describedby="search-instructions"
                aria-expanded={showResults}
                aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
                aria-autocomplete="list"
                role="combobox"
              />
              <div id="search-instructions" className="sr-only">
                矢印キーで結果を選択、Enterで決定、Escapeで閉じます
              </div>
            </div>

            {showAdvancedFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || hasAdvancedFilters()
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            )}

            {isSearching && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}

            {error && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 neo-card rounded-xl overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Settings className="w-4 h-4" />
                  <span>高度な検索オプション</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Platform Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      プラットフォーム
                    </label>
                    <select
                      value={searchOptions.platform}
                      onChange={(e) => setSearchOptions(prev => ({ 
                        ...prev, 
                        platform: e.target.value as 'all' | 'youtube' | 'tiktok' 
                      }))}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="all">すべて</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      カテゴリ
                    </label>
                    <select
                      value={searchOptions.category}
                      onChange={(e) => setSearchOptions(prev => ({ 
                        ...prev, 
                        category: e.target.value 
                      }))}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="">すべて</option>
                      <option value="テクノロジー">テクノロジー</option>
                      <option value="ゲーム">ゲーム</option>
                      <option value="ライフスタイル">ライフスタイル</option>
                      <option value="ファッション">ファッション</option>
                      <option value="教育">教育</option>
                      <option value="エンターテイメント">エンターテイメント</option>
                    </select>
                  </div>

                  {/* Verified Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      認証済み
                    </label>
                    <select
                      value={searchOptions.verified}
                      onChange={(e) => setSearchOptions(prev => ({ 
                        ...prev, 
                        verified: e.target.value as 'all' | 'true' | 'false' 
                      }))}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="all">すべて</option>
                      <option value="true">認証済みのみ</option>
                      <option value="false">未認証のみ</option>
                    </select>
                  </div>

                  {/* Min Subscribers */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      最小登録者数
                    </label>
                    <input
                      type="number"
                      value={searchOptions.minSubscribers}
                      onChange={(e) => setSearchOptions(prev => ({ 
                        ...prev, 
                        minSubscribers: e.target.value 
                      }))}
                      placeholder="例: 1000"
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                  </div>

                  {/* Max Subscribers */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      最大登録者数
                    </label>
                    <input
                      type="number"
                      value={searchOptions.maxSubscribers}
                      onChange={(e) => setSearchOptions(prev => ({ 
                        ...prev, 
                        maxSubscribers: e.target.value 
                      }))}
                      placeholder="例: 1000000"
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSearchOptions({
                      platform: 'all',
                      category: '',
                      minSubscribers: '',
                      maxSubscribers: '',
                      verified: 'all'
                    })}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    フィルターをクリア
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Channel Display */}
        {selectedChannel && !showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-lg border border-neo-light/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {renderPlatformIcon(selectedChannel.platform, `w-5 h-5 ${getPlatformColor(selectedChannel.platform)}`)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedChannel.name}
                  </span>
                  {selectedChannel.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {formatSubscriberCount(selectedChannel.subscriberCount)} 登録者
                  <span className="mx-1">•</span>
                  {selectedChannel.category}
                </div>
              </div>

              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="検索結果"
          >
            <div className="p-2">
              {results.map((channel, index) => {
                const isSelected = index === selectedIndex
                return (
                  <motion.button
                    key={channel.id}
                    id={`search-result-${index}`}
                    onClick={() => handleChannelSelect(channel)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                    }`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.05 }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`${channel.name}, ${channel.platform}, ${formatSubscriberCount(channel.subscriberCount)}登録者, ${channel.category}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {renderPlatformIcon(channel.platform, `w-5 h-5 ${getPlatformColor(channel.platform)}`)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {channel.name}
                          </span>
                          {channel.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          {formatSubscriberCount(channel.subscriberCount)} 登録者
                          <span className="mx-1">•</span>
                          {channel.category}
                        </div>
                        
                        {channel.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {channel.description}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 capitalize">
                        {channel.platform}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-20 p-4 border-l-4 border-red-500"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && !isSearching && !error && query.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 neo-card rounded-xl shadow-lg z-20 p-4 text-center text-gray-500"
        >
          検索結果が見つかりませんでした
          {hasAdvancedFilters() && (
            <div className="text-xs mt-1 text-gray-400">
              フィルター条件を緩めてみてください
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}