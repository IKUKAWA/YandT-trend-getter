import { renderHook, act } from '@testing-library/react'
import { 
  useAccessibility, 
  useFocusManagement, 
  useScreenReader, 
  useHighContrast,
  useReducedMotion 
} from '@/hooks/useAccessibility'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('Accessibility Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  })

  describe('useAccessibility', () => {
    test('initializes with default preferences', () => {
      const { result } = renderHook(() => useAccessibility())
      
      expect(result.current.preferences).toEqual({
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        screenReader: false,
        keyboardNavigation: true
      })
    })

    test('loads preferences from localStorage', () => {
      const savedPrefs = {
        reduceMotion: true,
        highContrast: true,
        largeText: false,
        screenReader: true,
        keyboardNavigation: true
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPrefs))

      const { result } = renderHook(() => useAccessibility())
      
      expect(result.current.preferences).toEqual(savedPrefs)
    })

    test('updates preferences and saves to localStorage', () => {
      const { result } = renderHook(() => useAccessibility())
      
      act(() => {
        result.current.updatePreferences({ reduceMotion: true })
      })

      expect(result.current.preferences.reduceMotion).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'accessibility-preferences',
        expect.stringContaining('reduceMotion":true')
      )
    })

    test('detects system preferences for reduced motion', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }))

      const { result } = renderHook(() => useAccessibility())
      
      expect(result.current.preferences.reduceMotion).toBe(true)
    })

    test('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const { result } = renderHook(() => useAccessibility())
      
      // Should use default preferences when localStorage data is invalid
      expect(result.current.preferences.keyboardNavigation).toBe(true)
    })
  })

  describe('useFocusManagement', () => {
    test('provides containerRef and focusFirst function', () => {
      const { result } = renderHook(() => useFocusManagement())
      
      expect(result.current.containerRef).toBeDefined()
      expect(typeof result.current.focusFirst).toBe('function')
    })

    test('handles focus trapping options', () => {
      const { result } = renderHook(() => 
        useFocusManagement({ trapFocus: true, restoreFocus: true })
      )
      
      expect(result.current.containerRef).toBeDefined()
      expect(typeof result.current.focusFirst).toBe('function')
    })
  })

  describe('useScreenReader', () => {
    test('provides announce function', () => {
      const { result } = renderHook(() => useScreenReader())
      
      expect(typeof result.current.announce).toBe('function')
    })

    test('announce function can be called without errors', () => {
      const { result } = renderHook(() => useScreenReader())
      
      expect(() => {
        result.current.announce('Test message')
      }).not.toThrow()
    })

    test('announce function with options', () => {
      const { result } = renderHook(() => useScreenReader())
      
      expect(() => {
        result.current.announce('Test message', { 
          priority: 'assertive', 
          atomic: false 
        })
      }).not.toThrow()
    })
  })

  describe('useHighContrast', () => {
    test('initializes with system preference', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-contrast: high)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }))

      const { result } = renderHook(() => useHighContrast())
      
      expect(result.current.isHighContrast).toBe(true)
    })

    test('toggles high contrast mode', () => {
      const { result } = renderHook(() => useHighContrast())
      
      act(() => {
        result.current.toggleHighContrast()
      })

      // Should toggle the state
      expect(result.current.isHighContrast).toBe(true)
    })

    test('detects manual high contrast class', () => {
      // Mock document.body.classList
      const mockClassList = {
        contains: jest.fn().mockReturnValue(true),
        add: jest.fn(),
        remove: jest.fn(),
      }
      Object.defineProperty(document.body, 'classList', {
        value: mockClassList,
        writable: true,
      })

      const { result } = renderHook(() => useHighContrast())
      
      expect(result.current.isHighContrast).toBe(true)
    })
  })

  describe('useReducedMotion', () => {
    test('detects system preference for reduced motion', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }))

      const { result } = renderHook(() => useReducedMotion())
      
      expect(result.current).toBe(true)
    })

    test('updates when system preference changes', () => {
      let mediaQueryCallback: ((e: any) => void) | undefined

      mockMatchMedia.mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback
          }
        }),
        removeEventListener: jest.fn(),
      }))

      const { result } = renderHook(() => useReducedMotion())
      
      expect(result.current).toBe(false)

      // Simulate media query change
      if (mediaQueryCallback) {
        act(() => {
          mediaQueryCallback({ matches: true })
        })
        
        expect(result.current).toBe(true)
      }
    })

    test('returns false when no preference set', () => {
      mockMatchMedia.mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }))

      const { result } = renderHook(() => useReducedMotion())
      
      expect(result.current).toBe(false)
    })
  })
})