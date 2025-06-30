import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string | bigint): string {
  const n = typeof num === 'bigint' ? Number(num) : typeof num === 'string' ? parseInt(num) : num
  
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1) + 'B'
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K'
  }
  return n.toString()
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}