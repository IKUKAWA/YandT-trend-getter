import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string | bigint): string {
  const n = typeof num === 'bigint' ? Number(num) : typeof num === 'string' ? parseInt(num) : num
  
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(3) + 'B'
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(3) + 'M'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(3) + 'K'
  }
  return n.toString()
}

export function formatDate(date: Date | string | number): string {
  try {
    if (date === null || date === undefined) {
      return '日付不明'
    }
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return '日付不明'
    }
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.warn('Date formatting error:', error)
    return '日付不明'
  }
}