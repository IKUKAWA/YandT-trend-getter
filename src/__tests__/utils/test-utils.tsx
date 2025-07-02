import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChannelSearchResult, ChannelAnalysis } from '@/types/channel'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-provider">
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockChannel = (overrides: Partial<ChannelSearchResult> = {}): ChannelSearchResult => ({
  id: 'ch_test_001',
  platform: 'youtube',
  name: 'Test Channel',
  subscriberCount: 100000,
  category: 'テクノロジー',
  verified: true,
  description: 'Test channel description',
  ...overrides
})

export const createMockChannelAnalysis = (overrides: Partial<ChannelAnalysis> = {}): ChannelAnalysis => ({
  basicInfo: {
    id: 'ch_test_001',
    platform: 'youtube',
    channelId: 'UC_test_001',
    channelName: 'Test Channel',
    subscriberCount: 100000,
    videoCount: 200,
    createdDate: new Date('2020-01-01'),
    category: 'テクノロジー',
    lastUpdated: new Date(),
    description: 'Test channel description',
    verified: true
  },
  growthAnalysis: {
    current: {
      date: new Date(),
      subscriberCount: 100000,
      videoCount: 200,
      avgViews: 15000,
      engagementRate: 0.05
    },
    history: [
      {
        date: new Date('2024-01-01'),
        subscriberCount: 90000,
        videoCount: 180,
        avgViews: 12000,
        engagementRate: 0.045
      }
    ],
    monthlyGrowthRate: 2.5,
    weeklyGrowthRate: 0.6,
    trend: 'up',
    trendStrength: 8,
    rankingChange: 2,
    growthAcceleration: 1.1,
    milestones: {
      nextSubscriberMilestone: 150000,
      timeToMilestone: 120,
      confidenceScore: 85
    }
  },
  competitorComparison: {
    mainChannel: {
      id: 'ch_test_001',
      platform: 'youtube',
      channelId: 'UC_test_001',
      channelName: 'Test Channel',
      subscriberCount: 100000,
      videoCount: 200,
      createdDate: new Date('2020-01-01'),
      category: 'テクノロジー',
      lastUpdated: new Date(),
      description: 'Test channel description',
      verified: true
    },
    competitors: [],
    industryRanking: 3,
    totalChannelsInCategory: 500,
    competitiveAdvantages: ['高いエンゲージメント率'],
    weaknesses: ['登録者数が競合より少ない'],
    marketShare: 1.8
  },
  monetization: {
    eligibilityStatus: {
      youtube: {
        subscribers: true,
        watchHours: true,
        eligible: true
      },
      tiktok: {
        followers: true,
        views: true,
        eligible: true
      }
    },
    revenueEstimate: {
      monthly: {
        min: 30000,
        max: 80000,
        currency: 'JPY'
      },
      cpmRate: 120,
      sponsorshipValue: 60000
    },
    projections: {
      threeMonths: 70000,
      sixMonths: 120000,
      oneYear: 200000
    },
    recommendations: {
      nextSteps: ['ショート動画の増加'],
      timeline: '3ヶ月',
      priority: 'high'
    }
  },
  aiReport: {
    summary: 'Test AI report summary',
    growthFactors: ['高品質なコンテンツ'],
    differentiationPoints: ['技術的な深い解説'],
    monetizationStrategy: 'ショート動画の活用を推奨',
    actionItems: [
      {
        action: 'ショート動画の投稿頻度増加',
        priority: 'high',
        timeline: '1ヶ月',
        expectedImpact: '新規視聴者獲得'
      }
    ],
    competitiveInsights: '競合と比較してエンゲージメント率が高い',
    confidenceScore: 87,
    reportDate: new Date()
  },
  lastAnalyzed: new Date(),
  ...overrides
})

// Mock API responses
export const mockApiResponse = (data: any, success: boolean = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : 'Test error',
  ...(!success && { results: [], total: 0 })
})

// Wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 100))
}

// Utility to trigger resize observer
export const triggerResize = () => {
  global.dispatchEvent(new Event('resize'))
}

// Mock user interactions
export const mockKeyboardEvent = (key: string, options: any = {}) => {
  return new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    ...options
  })
}

// Mock media query
export const mockMediaQuery = (query: string, matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(q => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Mock local storage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  return localStorageMock
}

// Test data generators
export const generateChannels = (count: number): ChannelSearchResult[] => {
  return Array.from({ length: count }, (_, index) => createMockChannel({
    id: `ch_test_${String(index + 1).padStart(3, '0')}`,
    name: `Test Channel ${index + 1}`,
    subscriberCount: Math.floor(Math.random() * 1000000) + 1000,
    platform: index % 2 === 0 ? 'youtube' : 'tiktok',
    verified: Math.random() > 0.5
  }))
}

// Error boundary for testing error states
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>
    }

    return this.props.children
  }
}

// Custom matchers for better assertions
export const customMatchers = {
  toBeValidChannelData(received: any) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.subscriberCount === 'number' &&
      ['youtube', 'tiktok'].includes(received.platform)

    return {
      message: () => `expected ${received} to be valid channel data`,
      pass
    }
  },

  toHaveAccessibilityAttributes(received: Element) {
    const hasAriaLabel = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby')
    const hasRole = received.hasAttribute('role')
    
    return {
      message: () => `expected element to have accessibility attributes`,
      pass: hasAriaLabel || hasRole
    }
  }
}

// Setup function for tests
export const setupTest = () => {
  mockIntersectionObserver()
  mockLocalStorage()
  mockMediaQuery('(prefers-reduced-motion: reduce)', false)
  
  // Clear all mocks before each test
  jest.clearAllMocks()
}