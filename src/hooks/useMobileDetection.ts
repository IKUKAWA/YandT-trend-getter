'use client'

import { useState, useEffect } from 'react'

export interface MobileDetectionResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  touchSupported: boolean
  browserType: 'ios' | 'android' | 'desktop'
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape',
    touchSupported: false,
    browserType: 'desktop'
  })

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Detect browser type
      const userAgent = navigator.userAgent.toLowerCase()
      let browserType: 'ios' | 'android' | 'desktop' = 'desktop'
      
      if (/iphone|ipad|ipod/.test(userAgent)) {
        browserType = 'ios'
      } else if (/android/.test(userAgent)) {
        browserType = 'android'
      }

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        browserType
      })
    }

    // Initial detection
    updateDetection()

    // Listen for resize events
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)

    return () => {
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return detection
}

// Utility hook for responsive breakpoints
export function useResponsiveBreakpoints() {
  const { screenWidth } = useMobileDetection()

  return {
    xs: screenWidth < 480,     // Extra small devices
    sm: screenWidth >= 480 && screenWidth < 768,   // Small devices
    md: screenWidth >= 768 && screenWidth < 1024,  // Medium devices
    lg: screenWidth >= 1024 && screenWidth < 1280, // Large devices
    xl: screenWidth >= 1280 && screenWidth < 1536, // Extra large devices
    xxl: screenWidth >= 1536,  // 2X Large devices
    mobile: screenWidth < 768,
    tablet: screenWidth >= 768 && screenWidth < 1024,
    desktop: screenWidth >= 1024,
    current: screenWidth < 480 ? 'xs' : 
             screenWidth < 768 ? 'sm' :
             screenWidth < 1024 ? 'md' :
             screenWidth < 1280 ? 'lg' :
             screenWidth < 1536 ? 'xl' : 'xxl'
  }
}

// Hook for responsive grid columns
export function useResponsiveGrid(baseColumns: number = 4) {
  const { xs, sm, md, lg } = useResponsiveBreakpoints()

  if (xs) return 1
  if (sm) return Math.min(2, baseColumns)
  if (md) return Math.min(3, baseColumns)
  if (lg) return Math.min(4, baseColumns)
  return baseColumns
}

// Hook for responsive spacing
export function useResponsiveSpacing() {
  const { xs, sm, md } = useResponsiveBreakpoints()

  return {
    container: xs ? 'px-3' : sm ? 'px-4' : md ? 'px-6' : 'px-8',
    gap: xs ? 'gap-3' : sm ? 'gap-4' : 'gap-6',
    padding: xs ? 'p-3' : sm ? 'p-4' : 'p-6',
    margin: xs ? 'm-3' : sm ? 'm-4' : 'm-6',
    cardPadding: xs ? 'p-3' : sm ? 'p-4' : 'p-6',
    sectionSpacing: xs ? 'space-y-4' : sm ? 'space-y-6' : 'space-y-8'
  }
}