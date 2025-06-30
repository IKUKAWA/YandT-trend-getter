import { useState, useMemo, useCallback } from 'react'
import { Platform } from '@prisma/client'

interface FilterState {
  platforms: Platform[]
  categories: string[]
  dateRange: {
    start: string
    end: string
  }
  viewRange: {
    min: number
    max: number
  }
  engagementRange: {
    min: number
    max: number
  }
  sortBy: 'views' | 'likes' | 'comments' | 'createdAt' | 'engagement'
  sortOrder: 'asc' | 'desc'
  searchQuery: string
  tags: string[]
  contentType: 'all' | 'viral' | 'trending' | 'emerging'
}

interface TrendItem {
  id: string
  title?: string
  platform: Platform
  category?: string
  views?: string | number
  likes?: number
  comments?: number
  shares?: number
  hashtags?: string[]
  createdAt: Date | string
  updatedAt?: Date | string
}

interface UseFiltersProps {
  data: TrendItem[]
  initialFilters?: Partial<FilterState>
}

const defaultFilters: FilterState = {
  platforms: [],
  categories: [],
  dateRange: {
    start: '',
    end: '',
  },
  viewRange: {
    min: 0,
    max: 10000000,
  },
  engagementRange: {
    min: 0,
    max: 100,
  },
  sortBy: 'views',
  sortOrder: 'desc',
  searchQuery: '',
  tags: [],
  contentType: 'all',
}

export function useFilters({ data, initialFilters = {} }: UseFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  })

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // Calculate engagement rate for an item
  const calculateEngagementRate = useCallback((item: TrendItem): number => {
    const views = Number(item.views) || 0
    const likes = item.likes || 0
    const comments = item.comments || 0
    const shares = item.shares || 0

    if (views === 0) return 0
    return ((likes + comments + shares) / views) * 100
  }, [])

  // Determine if content is viral
  const isViralContent = useCallback((item: TrendItem): boolean => {
    const engagementRate = calculateEngagementRate(item)
    const views = Number(item.views) || 0
    
    // Viral criteria: high engagement rate OR high view count with good engagement
    return engagementRate > 5 || (views > 100000 && engagementRate > 2)
  }, [calculateEngagementRate])

  // Determine if content is trending
  const isTrendingContent = useCallback((item: TrendItem): boolean => {
    const now = new Date()
    const createdAt = new Date(item.createdAt)
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    // Trending: recent content with good performance
    return daysSinceCreated <= 7 && Number(item.views) > 10000
  }, [])

  // Determine if content is emerging
  const isEmergingContent = useCallback((item: TrendItem): boolean => {
    const now = new Date()
    const createdAt = new Date(item.createdAt)
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    // Emerging: very recent content with potential
    return daysSinceCreated <= 3 && Number(item.views) > 1000
  }, [])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(item => filters.platforms.includes(item.platform))
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => 
        item.category && filters.categories.includes(item.category)
      )
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null
        
        if (startDate && itemDate < startDate) return false
        if (endDate && itemDate > endDate) return false
        return true
      })
    }

    // View range filter
    filtered = filtered.filter(item => {
      const views = Number(item.views) || 0
      return views >= filters.viewRange.min && views <= filters.viewRange.max
    })

    // Engagement range filter
    filtered = filtered.filter(item => {
      const engagementRate = calculateEngagementRate(item)
      return engagementRate >= filters.engagementRange.min && 
             engagementRate <= filters.engagementRange.max
    })

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase()
        const category = (item.category || '').toLowerCase()
        const hashtags = (item.hashtags || []).join(' ').toLowerCase()
        
        return title.includes(query) || 
               category.includes(query) || 
               hashtags.includes(query)
      })
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item => {
        const itemTags = item.hashtags || []
        return filters.tags.some(tag => itemTags.includes(tag))
      })
    }

    // Content type filter
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(item => {
        switch (filters.contentType) {
          case 'viral':
            return isViralContent(item)
          case 'trending':
            return isTrendingContent(item)
          case 'emerging':
            return isEmergingContent(item)
          default:
            return true
        }
      })
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'views':
          aValue = Number(a.views) || 0
          bValue = Number(b.views) || 0
          break
        case 'likes':
          aValue = a.likes || 0
          bValue = b.likes || 0
          break
        case 'comments':
          aValue = a.comments || 0
          bValue = b.comments || 0
          break
        case 'engagement':
          aValue = calculateEngagementRate(a)
          bValue = calculateEngagementRate(b)
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = Number(a.views) || 0
          bValue = Number(b.views) || 0
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return filtered
  }, [data, filters, calculateEngagementRate, isViralContent, isTrendingContent, isEmergingContent])

  // Extract available categories from data
  const availableCategories = useMemo(() => {
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))]
    return categories.sort()
  }, [data])

  // Extract available tags from data
  const availableTags = useMemo(() => {
    const allTags = data.flatMap(item => item.hashtags || [])
    const uniqueTags = [...new Set(allTags)]
    return uniqueTags.sort()
  }, [data])

  // Get filter statistics
  const filterStats = useMemo(() => {
    const totalItems = data.length
    const filteredItems = filteredData.length
    const filterEfficiency = totalItems > 0 ? (filteredItems / totalItems) * 100 : 0

    const contentTypeStats = {
      viral: data.filter(isViralContent).length,
      trending: data.filter(isTrendingContent).length,
      emerging: data.filter(isEmergingContent).length,
    }

    const platformStats = data.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1
      return acc
    }, {} as Record<Platform, number>)

    return {
      totalItems,
      filteredItems,
      filterEfficiency: Math.round(filterEfficiency),
      contentTypeStats,
      platformStats,
    }
  }, [data, filteredData, isViralContent, isTrendingContent, isEmergingContent])

  // Quick filter presets
  const applyQuickFilter = useCallback((preset: string) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (preset) {
      case 'trending':
        setFilters(prev => ({
          ...prev,
          contentType: 'trending',
          dateRange: {
            start: weekAgo.toISOString().split('T')[0],
            end: now.toISOString().split('T')[0],
          },
          sortBy: 'views',
          sortOrder: 'desc',
        }))
        break
      case 'viral':
        setFilters(prev => ({
          ...prev,
          contentType: 'viral',
          engagementRange: { min: 5, max: 100 },
          sortBy: 'engagement',
          sortOrder: 'desc',
        }))
        break
      case 'recent':
        setFilters(prev => ({
          ...prev,
          dateRange: {
            start: weekAgo.toISOString().split('T')[0],
            end: now.toISOString().split('T')[0],
          },
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }))
        break
      case 'popular':
        setFilters(prev => ({
          ...prev,
          viewRange: { min: 100000, max: 10000000 },
          sortBy: 'views',
          sortOrder: 'desc',
        }))
        break
      case 'youtube':
        setFilters(prev => ({
          ...prev,
          platforms: ['YOUTUBE'],
        }))
        break
      case 'tiktok':
        setFilters(prev => ({
          ...prev,
          platforms: ['TIKTOK'],
        }))
        break
      default:
        setFilters(defaultFilters)
    }
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Toggle filter panel
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev)
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.platforms.length > 0 ||
      filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.viewRange.min > 0 ||
      filters.viewRange.max < 10000000 ||
      filters.engagementRange.min > 0 ||
      filters.engagementRange.max < 100 ||
      filters.searchQuery ||
      filters.contentType !== 'all'
    )
  }, [filters])

  return {
    // Data
    filteredData,
    availableCategories,
    availableTags,
    filterStats,
    
    // Filter state
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    
    // Filter panel
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    toggleFilterPanel,
    
    // Quick actions
    applyQuickFilter,
    
    // Utility functions
    calculateEngagementRate,
    isViralContent,
    isTrendingContent,
    isEmergingContent,
  }
}