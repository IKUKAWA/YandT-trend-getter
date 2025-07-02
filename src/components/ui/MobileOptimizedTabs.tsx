'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useMobileDetection } from '@/hooks/useMobileDetection'

interface Tab {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  disabled?: boolean
}

interface MobileOptimizedTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

export function MobileOptimizedTabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'default'
}: MobileOptimizedTabsProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)

  // Check if tabs overflow on mobile
  useEffect(() => {
    const checkOverflow = () => {
      const container = scrollContainerRef.current
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }

    checkOverflow()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkOverflow)
      return () => container.removeEventListener('scroll', checkOverflow)
    }
  }, [tabs])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' })
    }
  }

  const getTabVariantClasses = (isActive: boolean) => {
    const baseClasses = 'flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 relative'
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-full ${
          isActive
            ? 'neo-gradient text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`
      
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-neo-purple text-neo-purple'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        }`
      
      default:
        return `${baseClasses} rounded-xl ${
          isActive
            ? 'neo-gradient text-white shadow-lg'
            : 'neo-card hover:shadow-md text-gray-700 dark:text-gray-300'
        }`
    }
  }

  // Mobile: Show dropdown menu for overflow tabs
  if (isMobile && tabs.length > 4) {
    const visibleTabs = tabs.slice(0, 3)
    const overflowTabs = tabs.slice(3)
    const activeTabInOverflow = overflowTabs.find(tab => tab.key === activeTab)

    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2">
          {/* Visible tabs */}
          {visibleTabs.map(({ key, label, icon: Icon, badge, disabled }) => (
            <motion.button
              key={key}
              onClick={() => !disabled && onTabChange(key)}
              className={`${getTabVariantClasses(activeTab === key)} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } flex-1 min-w-0`}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              disabled={disabled}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">{label}</span>
              {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </motion.button>
          ))}

          {/* Overflow menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className={`${getTabVariantClasses(!!activeTabInOverflow)} min-w-max`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTabInOverflow ? (
                <>
                  <activeTabInOverflow.icon className="w-4 h-4" />
                  <span className="text-sm">{activeTabInOverflow.label}</span>
                </>
              ) : (
                <>
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="text-sm">その他</span>
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {showOverflowMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-48"
                >
                  {overflowTabs.map(({ key, label, icon: Icon, badge, disabled }) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (!disabled) {
                          onTabChange(key)
                          setShowOverflowMenu(false)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl ${
                        activeTab === key ? 'bg-purple-50 dark:bg-purple-900/20 text-neo-purple' : 'text-gray-700 dark:text-gray-300'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={disabled}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{label}</span>
                      {badge && badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Click outside to close */}
        {showOverflowMenu && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowOverflowMenu(false)}
          />
        )}
      </div>
    )
  }

  // Tablet/Desktop: Horizontal scrollable tabs
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        {/* Left scroll arrow */}
        {(isMobile || isTablet) && showLeftArrow && (
          <motion.button
            onClick={scrollLeft}
            className="p-2 neo-button rounded-lg mr-2 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        )}

        {/* Scrollable tabs container */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-2 overflow-x-auto scrollbar-hide ${
            isMobile || isTablet ? 'flex-1' : 'flex-wrap'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {tabs.map(({ key, label, icon: Icon, badge, disabled }) => (
            <motion.button
              key={key}
              onClick={() => !disabled && onTabChange(key)}
              className={`${getTabVariantClasses(activeTab === key)} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${isMobile || isTablet ? 'flex-shrink-0 min-w-max' : ''}`}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              disabled={disabled}
            >
              <Icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span className={isMobile ? 'text-sm' : ''}>{label}</span>
              {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Right scroll arrow */}
        {(isMobile || isTablet) && showRightArrow && (
          <motion.button
            onClick={scrollRight}
            className="p-2 neo-button rounded-lg ml-2 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  )
}