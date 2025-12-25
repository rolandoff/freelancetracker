import type { ActivityStatus, InvoiceStatus, ServiceType } from '@/types/database.types'
import { ACTIVITY_STATUSES, INVOICE_STATUSES, SERVICE_TYPES } from '@/lib/constants'

/**
 * Helper Utilities
 */

/**
 * Get status label and color
 */
export function getActivityStatusInfo(status: ActivityStatus) {
  return ACTIVITY_STATUSES.find((s) => s.value === status) || ACTIVITY_STATUSES[0]
}

export function getInvoiceStatusInfo(status: InvoiceStatus) {
  return INVOICE_STATUSES.find((s) => s.value === status) || INVOICE_STATUSES[0]
}

export function getServiceTypeInfo(serviceType: ServiceType) {
  return SERVICE_TYPES.find((s) => s.value === serviceType) || SERVICE_TYPES[0]
}

/**
 * Calculate total from invoice items
 */
export function calculateInvoiceTotal(
  subtotal: number,
  discountPercentage: number = 0,
  discountAmount: number = 0
): number {
  let total = subtotal

  // Apply percentage discount
  if (discountPercentage > 0) {
    total -= (subtotal * discountPercentage) / 100
  }

  // Apply fixed discount
  if (discountAmount > 0) {
    total -= discountAmount
  }

  return Math.max(0, total)
}

/**
 * Calculate URSSAF contributions
 */
export function calculateURSSAF(revenue: number, rate: number = 24.6): number {
  return (revenue * rate) / 100
}

/**
 * Calculate revenue progress toward threshold
 */
export function calculateThresholdProgress(
  currentRevenue: number,
  threshold: number
): {
  percentage: number
  remaining: number
  exceeded: boolean
} {
  const percentage = (currentRevenue / threshold) * 100
  const remaining = Math.max(0, threshold - currentRevenue)
  const exceeded = currentRevenue > threshold

  return {
    percentage: Math.min(percentage, 100),
    remaining,
    exceeded,
  }
}

/**
 * Generate file path for storage
 */
export function generateStoragePath(
  bucket: string,
  userId: string,
  resourceId: string,
  fileName: string
): string {
  // Sanitize filename
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${bucket}/${userId}/${resourceId}/${Date.now()}_${sanitized}`
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate unique ID (simple version)
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(array: T[], ...keys: (keyof T)[]): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
    }
    return 0
  })
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get contrast color (black or white) for background
 */
export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? 'black' : 'white'
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
