'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMobileDetection, useResponsiveSpacing } from '@/hooks/useMobileDetection'

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
  hover?: boolean
  gradient?: boolean
  glassmorphism?: boolean
  onClick?: () => void
  loading?: boolean
  compact?: boolean // For mobile optimization
}

export function ResponsiveCard({
  children,
  className = '',
  padding = 'medium',
  hover = false,
  gradient = false,
  glassmorphism = false,
  onClick,
  loading = false,
  compact = false
}: ResponsiveCardProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const { cardPadding } = useResponsiveSpacing()

  const getPaddingClass = () => {
    if (padding === 'none') return ''
    
    // Mobile-specific padding adjustments
    if (isMobile) {
      switch (padding) {
        case 'small': return 'p-2'
        case 'medium': return compact ? 'p-3' : 'p-4'
        case 'large': return compact ? 'p-4' : 'p-5'
        default: return 'p-4'
      }
    }
    
    // Tablet adjustments
    if (isTablet) {
      switch (padding) {
        case 'small': return 'p-3'
        case 'medium': return 'p-5'
        case 'large': return 'p-6'
        default: return 'p-5'
      }
    }
    
    // Desktop padding
    switch (padding) {
      case 'small': return 'p-4'
      case 'medium': return 'p-6'
      case 'large': return 'p-8'
      default: return 'p-6'
    }
  }

  const getBaseClasses = () => {
    let baseClasses = 'rounded-xl transition-all duration-300'
    
    if (glassmorphism) {
      baseClasses += ' backdrop-blur-lg bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30'
    } else if (gradient) {
      baseClasses += ' neo-gradient text-white'
    } else {
      baseClasses += ' neo-card'
    }
    
    if (hover) {
      baseClasses += ' hover:shadow-lg hover:scale-[1.02] cursor-pointer'
    }
    
    if (onClick) {
      baseClasses += ' cursor-pointer'
    }
    
    // Mobile-specific adjustments
    if (isMobile) {
      baseClasses += ' shadow-sm' // Reduce shadow on mobile for performance
      if (compact) {
        baseClasses += ' rounded-lg' // Smaller border radius on mobile
      }
    }
    
    return baseClasses
  }

  const motionProps = {
    whileHover: hover && !isMobile ? { scale: 1.02 } : {},
    whileTap: onClick ? { scale: 0.98 } : {},
    layout: true
  }

  if (loading) {
    return (
      <div className={`${getBaseClasses()} ${getPaddingClass()} ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`${getBaseClasses()} ${getPaddingClass()} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

// Specialized card variants for common use cases
export function MobileMetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'purple',
  compact = false,
  className = ''
}: {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red'
  compact?: boolean
  className?: string
}) {
  const { isMobile } = useMobileDetection()
  
  const colorClasses = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500'
  }

  return (
    <ResponsiveCard
      padding={compact ? 'small' : 'medium'}
      hover
      compact={isMobile}
      className={className}
    >
      <div className={`${isMobile && compact ? 'space-y-2' : 'space-y-3'}`}>
        <div className="flex items-center justify-between">
          <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${colorClasses[color]}`} />
          {change !== undefined && (
            <span
              className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${
                trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500'
              }`}
            >
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        
        <div>
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-gray-100`}>
            {value}
          </div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 truncate`}>
            {title}
          </div>
        </div>
      </div>
    </ResponsiveCard>
  )
}

// Grid container for responsive cards
export function ResponsiveCardGrid({
  children,
  columns = 4,
  gap = 'medium',
  className = ''
}: {
  children: React.ReactNode
  columns?: number | { mobile: number; tablet: number; desktop: number }
  gap?: 'small' | 'medium' | 'large'
  className?: string
}) {
  const { isMobile, isTablet } = useMobileDetection()
  
  const getColumns = () => {
    if (typeof columns === 'object') {
      if (isMobile) return columns.mobile
      if (isTablet) return columns.tablet
      return columns.desktop
    }
    
    // Auto-responsive columns
    if (isMobile) return Math.min(columns, 2)
    if (isTablet) return Math.min(columns, 3)
    return columns
  }
  
  const getGapClass = () => {
    if (isMobile) {
      switch (gap) {
        case 'small': return 'gap-2'
        case 'medium': return 'gap-3'
        case 'large': return 'gap-4'
        default: return 'gap-3'
      }
    }
    
    switch (gap) {
      case 'small': return 'gap-4'
      case 'medium': return 'gap-6'
      case 'large': return 'gap-8'
      default: return 'gap-6'
    }
  }
  
  const cols = getColumns()
  const gridColsClass = `grid-cols-${cols}`
  
  return (
    <div className={`grid ${gridColsClass} ${getGapClass()} ${className}`}>
      {children}
    </div>
  )
}