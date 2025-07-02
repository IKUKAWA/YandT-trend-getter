import { useMemo, useCallback, useRef, useEffect } from 'react'
import { debounce, throttle } from 'lodash'

// キャッシュ管理のためのインターface
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 50 // 最大キャッシュサイズ
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  size(): number {
    return this.cache.size
  }
  
  // 期限切れエントリの清理
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// グローバルキャッシュインスタンス
const globalCache = new DataCache()

// データの最適化フック
export function useOptimizedData<T>(
  data: T[],
  options: {
    sortBy?: keyof T
    sortOrder?: 'asc' | 'desc'
    filterBy?: Partial<T>
    searchTerm?: string
    searchFields?: (keyof T)[]
    pageSize?: number
    enableCache?: boolean
    cacheKey?: string
    cacheTTL?: number
  } = {}
) {
  const {
    sortBy,
    sortOrder = 'asc',
    filterBy,
    searchTerm,
    searchFields = [],
    pageSize,
    enableCache = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000 // 5分
  } = options

  // キャッシュキーの生成
  const computedCacheKey = cacheKey || 
    `data_${JSON.stringify({ sortBy, sortOrder, filterBy, searchTerm, pageSize })}`

  // メモ化された処理済みデータ
  const processedData = useMemo(() => {
    // キャッシュチェック
    if (enableCache) {
      const cached = globalCache.get<T[]>(computedCacheKey)
      if (cached) return cached
    }

    let result = [...data]

    // フィルタリング
    if (filterBy) {
      result = result.filter(item => {
        return Object.entries(filterBy).every(([key, value]) => {
          const itemValue = item[key as keyof T]
          return itemValue === value
        })
      })
    }

    // 検索
    if (searchTerm && searchFields.length > 0) {
      const lowercaseSearch = searchTerm.toLowerCase()
      result = result.filter(item => {
        return searchFields.some(field => {
          const fieldValue = item[field]
          return String(fieldValue).toLowerCase().includes(lowercaseSearch)
        })
      })
    }

    // ソート
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    // キャッシュに保存
    if (enableCache) {
      globalCache.set(computedCacheKey, result, cacheTTL)
    }

    return result
  }, [data, sortBy, sortOrder, filterBy, searchTerm, searchFields, computedCacheKey, enableCache, cacheTTL])

  // ページネーション
  const paginatedData = useMemo(() => {
    if (!pageSize) return processedData
    
    const pages: T[][] = []
    for (let i = 0; i < processedData.length; i += pageSize) {
      pages.push(processedData.slice(i, i + pageSize))
    }
    return pages
  }, [processedData, pageSize])

  // 統計情報
  const stats = useMemo(() => ({
    total: data.length,
    filtered: processedData.length,
    pages: paginatedData.length,
    cacheSize: globalCache.size()
  }), [data.length, processedData.length, paginatedData.length])

  return {
    data: processedData,
    paginatedData,
    stats,
    clearCache: () => globalCache.clear(),
    invalidateCache: () => globalCache.delete(computedCacheKey)
  }
}

// 重い計算の最適化フック
export function useHeavyComputation<T, R>(
  input: T,
  computeFn: (input: T) => R,
  deps: React.DependencyList = [],
  options: {
    throttleMs?: number
    debounceMs?: number
    enableCache?: boolean
    cacheKey?: string
  } = {}
) {
  const {
    throttleMs,
    debounceMs,
    enableCache = true,
    cacheKey
  } = options

  const computedCacheKey = cacheKey || `computation_${JSON.stringify(input)}`
  const computationRef = useRef<R | null>(null)

  // デバウンス・スロットル処理
  const optimizedCompute = useMemo(() => {
    const baseCompute = (inputValue: T) => {
      // キャッシュチェック
      if (enableCache) {
        const cached = globalCache.get<R>(computedCacheKey)
        if (cached) {
          computationRef.current = cached
          return cached
        }
      }

      const result = computeFn(inputValue)
      
      // キャッシュに保存
      if (enableCache) {
        globalCache.set(computedCacheKey, result)
      }
      
      computationRef.current = result
      return result
    }

    if (throttleMs) {
      return throttle(baseCompute, throttleMs)
    }
    
    if (debounceMs) {
      return debounce(baseCompute, debounceMs)
    }
    
    return baseCompute
  }, [computeFn, throttleMs, debounceMs, enableCache, computedCacheKey])

  // 計算の実行
  const result = useMemo(() => {
    return optimizedCompute(input)
  }, [input, optimizedCompute, ...deps])

  return result || computationRef.current
}

// 仮想化のためのフック
export function useVirtualization<T>(
  items: T[],
  options: {
    containerHeight: number
    itemHeight: number
    overscan?: number
    scrollTop?: number
  }
) {
  const { containerHeight, itemHeight, overscan = 5, scrollTop = 0 } = options

  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)
    
    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }))

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      startIndex,
      endIndex
    }
  }, [items, containerHeight, itemHeight, overscan, scrollTop])
}

// APIレスポンスの最適化フック
export function useOptimizedAPI<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList = [],
  options: {
    enableCache?: boolean
    cacheKey?: string
    cacheTTL?: number
    retryCount?: number
    retryDelay?: number
    throttleMs?: number
  } = {}
) {
  const {
    enableCache = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000,
    retryCount = 3,
    retryDelay = 1000,
    throttleMs = 1000
  } = options

  const computedCacheKey = cacheKey || `api_${JSON.stringify(deps)}`
  const lastCallRef = useRef<number>(0)
  const resultRef = useRef<T | null>(null)

  // スロットル制御されたAPI呼び出し
  const throttledApiCall = useCallback(
    throttle(async (): Promise<T> => {
      // キャッシュチェック
      if (enableCache) {
        const cached = globalCache.get<T>(computedCacheKey)
        if (cached) {
          resultRef.current = cached
          return cached
        }
      }

      // リトライロジック
      let lastError: Error | null = null
      for (let i = 0; i < retryCount; i++) {
        try {
          const result = await apiCall()
          
          // キャッシュに保存
          if (enableCache) {
            globalCache.set(computedCacheKey, result, cacheTTL)
          }
          
          resultRef.current = result
          return result
        } catch (error) {
          lastError = error as Error
          if (i < retryCount - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
          }
        }
      }
      
      throw lastError
    }, throttleMs),
    [apiCall, computedCacheKey, enableCache, cacheTTL, retryCount, retryDelay]
  )

  return {
    call: throttledApiCall,
    getCached: () => enableCache ? globalCache.get<T>(computedCacheKey) : null,
    invalidateCache: () => globalCache.delete(computedCacheKey)
  }
}

// メモリ使用量監視フック
export function useMemoryMonitor() {
  const performanceRef = useRef<{
    heapUsed?: number
    heapTotal?: number
    timestamp: number
  }>({ timestamp: Date.now() })

  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      performanceRef.current = {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        timestamp: Date.now()
      }
    }
    
    // キャッシュクリーンアップ
    globalCache.cleanup()
  }, [])

  useEffect(() => {
    const interval = setInterval(checkMemory, 30000) // 30秒ごと
    return () => clearInterval(interval)
  }, [checkMemory])

  return {
    memory: performanceRef.current,
    checkMemory,
    clearAllCaches: () => globalCache.clear(),
    cacheSize: globalCache.size()
  }
}

// 批处理更新フック
export function useBatchUpdates<T>(
  updateFn: (updates: T[]) => void,
  batchSize: number = 10,
  delayMs: number = 100
) {
  const batchRef = useRef<T[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addToBatch = useCallback((update: T) => {
    batchRef.current.push(update)
    
    if (batchRef.current.length >= batchSize) {
      // バッチサイズに達したら即座に実行
      updateFn([...batchRef.current])
      batchRef.current = []
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      // タイマーで遅延実行
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        if (batchRef.current.length > 0) {
          updateFn([...batchRef.current])
          batchRef.current = []
        }
        timeoutRef.current = null
      }, delayMs)
    }
  }, [updateFn, batchSize, delayMs])

  const flushBatch = useCallback(() => {
    if (batchRef.current.length > 0) {
      updateFn([...batchRef.current])
      batchRef.current = []
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [updateFn])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { addToBatch, flushBatch }
}