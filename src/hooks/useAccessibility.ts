'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Types for accessibility features
export interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface FocusManagement {
  trapFocus: boolean
  restoreFocus: boolean
  skipLinks: boolean
}

export interface AnnouncementOptions {
  priority: 'polite' | 'assertive' | 'off'
  atomic: boolean
  live: 'polite' | 'assertive' | 'off'
}

/**
 * Hook for managing accessibility preferences and features
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true
  })

  // Check for user preferences from system/localStorage
  useEffect(() => {
    const checkPreferences = () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches
      const largeText = window.matchMedia('(prefers-font-size: large)').matches
      
      // Check localStorage for custom preferences
      const savedPrefs = localStorage.getItem('accessibility-preferences')
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs)
          setPreferences(prev => ({ ...prev, ...parsed }))
        } catch (error) {
          console.warn('Failed to parse saved accessibility preferences:', error)
        }
      }

      setPreferences(prev => ({
        ...prev,
        reduceMotion: reduceMotion || prev.reduceMotion,
        highContrast: highContrast || prev.highContrast,
        largeText: largeText || prev.largeText
      }))
    }

    checkPreferences()

    // Listen for media query changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    motionQuery.addEventListener('change', checkPreferences)
    contrastQuery.addEventListener('change', checkPreferences)

    return () => {
      motionQuery.removeEventListener('change', checkPreferences)
      contrastQuery.removeEventListener('change', checkPreferences)
    }
  }, [])

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPrefs: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs }
      localStorage.setItem('accessibility-preferences', JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    preferences,
    updatePreferences
  }
}

/**
 * Hook for managing focus within components
 */
export function useFocusManagement(options: Partial<FocusManagement> = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  const { trapFocus = false, restoreFocus = false } = options

  // Store previous focus when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [restoreFocus])

  // Restore focus when component unmounts
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [restoreFocus])

  // Trap focus within container
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    if (event.key === 'Escape') {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [trapFocus, restoreFocus])

  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [trapFocus, handleKeyDown])

  return {
    containerRef,
    focusFirst: () => {
      const firstFocusable = containerRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    }
  }
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement>(null)

  // Create announcement element if it doesn't exist
  useEffect(() => {
    if (!announcementRef.current) {
      const element = document.createElement('div')
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('aria-atomic', 'true')
      element.setAttribute('class', 'sr-only')
      element.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `
      document.body.appendChild(element)
      announcementRef.current = element
    }

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current)
      }
    }
  }, [])

  const announce = useCallback((message: string, options: Partial<AnnouncementOptions> = {}) => {
    if (!announcementRef.current) return

    const { priority = 'polite', atomic = true } = options

    announcementRef.current.setAttribute('aria-live', priority)
    announcementRef.current.setAttribute('aria-atomic', atomic.toString())
    announcementRef.current.textContent = message

    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  return { announce }
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(onEscape?: () => void, onEnter?: () => void) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case 'Enter':
        if (event.target instanceof HTMLElement && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
          event.preventDefault()
          onEnter?.()
        }
        break
      case ' ':
        if (event.target instanceof HTMLElement && 
            event.target.getAttribute('role') === 'button') {
          event.preventDefault()
          onEnter?.()
        }
        break
    }
  }, [onEscape, onEnter])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { handleKeyDown }
}

/**
 * Hook for high contrast mode
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const checkHighContrast = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                          window.matchMedia('(-ms-high-contrast: active)').matches ||
                          document.body.classList.contains('high-contrast')
      setIsHighContrast(highContrast)
    }

    checkHighContrast()

    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    contrastQuery.addEventListener('change', checkHighContrast)

    // Watch for manual high contrast class changes
    const observer = new MutationObserver(checkHighContrast)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      contrastQuery.removeEventListener('change', checkHighContrast)
      observer.disconnect()
    }
  }, [])

  const toggleHighContrast = useCallback(() => {
    const newState = !isHighContrast
    setIsHighContrast(newState)
    
    if (newState) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [isHighContrast])

  return {
    isHighContrast,
    toggleHighContrast
  }
}

/**
 * Hook for reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}