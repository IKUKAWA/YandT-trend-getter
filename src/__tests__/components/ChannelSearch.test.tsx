import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChannelSearch } from '@/components/channel/ChannelSearch'
import { ChannelSearchResult } from '@/types/channel'

// Mock the accessibility hooks
jest.mock('@/hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    preferences: {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    }
  }),
  useFocusManagement: () => ({
    containerRef: { current: null },
    focusFirst: jest.fn()
  }),
  useScreenReader: () => ({
    announce: jest.fn()
  }),
  useReducedMotion: () => false
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button'
  },
  AnimatePresence: ({ children }: any) => children
}))

describe('ChannelSearch Component', () => {
  const mockChannelSelect = jest.fn()
  const mockOnError = jest.fn()

  const defaultProps = {
    onChannelSelect: mockChannelSelect,
    onError: mockOnError
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders search input', () => {
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox', { name: /チャンネル検索/i })
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'チャンネル名またはキーワードで検索...')
  })

  test('shows advanced filters when enabled', () => {
    render(<ChannelSearch {...defaultProps} showAdvancedFilters={true} />)
    
    const filterButton = screen.getByRole('button', { name: /filter/i })
    expect(filterButton).toBeInTheDocument()
  })

  test('hides advanced filters when disabled', () => {
    render(<ChannelSearch {...defaultProps} showAdvancedFilters={false} />)
    
    const filterButton = screen.queryByRole('button', { name: /filter/i })
    expect(filterButton).not.toBeInTheDocument()
  })

  test('performs search when typing', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    // Wait for debounced search
    await waitFor(() => {
      expect(searchInput).toHaveValue('テスト')
    }, { timeout: 1000 })
  })

  test('shows loading state during search', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テストチャンネル')
    
    // Should show loading spinner
    await waitFor(() => {
      const loader = screen.getByTestId('loading-spinner') || screen.querySelector('.animate-spin')
      expect(loader).toBeInTheDocument()
    }, { timeout: 500 })
  })

  test('displays search results', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    await waitFor(() => {
      const results = screen.getByRole('listbox', { name: /検索結果/i })
      expect(results).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('handles channel selection', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    await waitFor(async () => {
      const channelOption = await screen.findByRole('option')
      await user.click(channelOption)
      
      expect(mockChannelSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('テスト')
        })
      )
    }, { timeout: 2000 })
  })

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    await waitFor(() => {
      screen.getByRole('listbox')
    })
    
    // Test arrow key navigation
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')
    
    // Should have selected the channel
    expect(mockChannelSelect).toHaveBeenCalled()
  })

  test('closes search results on Escape', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    await waitFor(() => {
      screen.getByRole('listbox')
    })
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  test('shows selected channel information', () => {
    const selectedChannel: ChannelSearchResult = {
      id: 'ch_001',
      platform: 'youtube',
      name: '選択されたチャンネル',
      subscriberCount: 100000,
      category: 'テクノロジー',
      verified: true,
      description: 'テスト用チャンネル'
    }

    render(
      <ChannelSearch 
        {...defaultProps} 
        selectedChannel={selectedChannel} 
      />
    )
    
    expect(screen.getByText('選択されたチャンネル')).toBeInTheDocument()
    expect(screen.getByText(/100K 登録者/)).toBeInTheDocument()
    expect(screen.getByText('テクノロジー')).toBeInTheDocument()
  })

  test('shows verification badge for verified channels', () => {
    const verifiedChannel: ChannelSearchResult = {
      id: 'ch_001',
      platform: 'youtube',
      name: 'Verified Channel',
      subscriberCount: 100000,
      category: 'テクノロジー',
      verified: true,
      description: 'Verified test channel'
    }

    render(
      <ChannelSearch 
        {...defaultProps} 
        selectedChannel={verifiedChannel} 
      />
    )
    
    // Look for verification icon (CheckCircle)
    const verificationIcon = screen.getByTestId('verification-icon') || 
                            document.querySelector('[data-testid="verification-icon"]')
    expect(verificationIcon).toBeInTheDocument()
  })

  test('handles search errors', async () => {
    const user = userEvent.setup()
    
    // Mock fetch to return error
    global.fetch = jest.fn().mockRejectedValue(new Error('Search failed'))
    
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'error-test')
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('検索中にエラーが発生しました')
      )
    }, { timeout: 2000 })
  })

  test('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()
    
    // Mock fetch to return empty results
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        results: [],
        total: 0
      })
    })
    
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText(/検索結果が見つかりませんでした/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('formats subscriber count correctly', () => {
    const channel: ChannelSearchResult = {
      id: 'ch_001',
      platform: 'youtube',
      name: 'Test Channel',
      subscriberCount: 1234567,
      category: 'テクノロジー',
      verified: false,
      description: 'Test channel'
    }

    render(
      <ChannelSearch 
        {...defaultProps} 
        selectedChannel={channel} 
      />
    )
    
    expect(screen.getByText(/1.2M 登録者/)).toBeInTheDocument()
  })

  test('applies accessibility attributes correctly', () => {
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    expect(searchInput).toHaveAttribute('aria-label', 'チャンネル検索')
    expect(searchInput).toHaveAttribute('aria-autocomplete', 'list')
    expect(searchInput).toHaveAttribute('aria-expanded', 'false')
  })

  test('updates aria-expanded when results are shown', async () => {
    const user = userEvent.setup()
    render(<ChannelSearch {...defaultProps} />)
    
    const searchInput = screen.getByRole('combobox')
    
    await user.type(searchInput, 'テスト')
    
    await waitFor(() => {
      expect(searchInput).toHaveAttribute('aria-expanded', 'true')
    }, { timeout: 2000 })
  })
})