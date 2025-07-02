import { formatNumber, formatDate, cn } from '@/lib/utils'

describe('Utils Library', () => {
  describe('formatNumber', () => {
    test('formats numbers correctly', () => {
      expect(formatNumber(123)).toBe('123')
      expect(formatNumber(1234)).toBe('1.2K')
      expect(formatNumber(12345)).toBe('12.3K')
      expect(formatNumber(1234567)).toBe('1.2M')
      expect(formatNumber(1234567890)).toBe('1.2B')
    })

    test('handles string inputs', () => {
      expect(formatNumber('1234')).toBe('1.2K')
      expect(formatNumber('invalid')).toBe('NaN')
    })

    test('handles bigint inputs', () => {
      expect(formatNumber(BigInt(1234567))).toBe('1.2M')
    })

    test('handles edge cases', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(1000)).toBe('1.0K')
    })
  })

  describe('formatDate', () => {
    test('formats Date objects correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/2024/)
      expect(formatted).toMatch(/1月/)
      expect(formatted).toMatch(/15/)
    })

    test('formats string dates correctly', () => {
      const dateString = '2024-01-15'
      const formatted = formatDate(dateString)
      expect(formatted).toMatch(/2024/)
    })

    test('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('日付不明')
      expect(formatDate('')).toBe('日付不明')
    })

    test('handles number inputs', () => {
      const timestamp = Date.now()
      const formatted = formatDate(timestamp)
      expect(formatted).not.toBe('日付不明')
    })

    test('handles edge cases', () => {
      expect(formatDate(NaN)).toBe('日付不明')
      expect(formatDate(undefined as any)).toBe('日付不明')
      expect(formatDate(null as any)).toBe('日付不明')
    })
  })

  describe('cn (className utility)', () => {
    test('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    test('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    test('handles Tailwind conflicts', () => {
      // twMerge should handle conflicting Tailwind classes
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2') // Later class should override
    })

    test('handles empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined)).toBe('')
    })

    test('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
      expect(cn({ class1: true, class2: false })).toBe('class1')
    })
  })
})