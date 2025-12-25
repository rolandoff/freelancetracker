import { format, parseISO } from 'date-fns'
import { CURRENCY, DATE_FORMATS } from '@/lib/constants'

/**
 * Format currency to French locale
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0,00 €'
  }

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
  }).format(amount)
}

/**
 * Format number with French locale (spaces for thousands)
 */
export function formatNumber(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined) {
    return '0'
  }

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format date to French format (dd/MM/yyyy)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, DATE_FORMATS.DISPLAY)
  } catch {
    return '-'
  }
}

/**
 * Format datetime to French format
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, DATE_FORMATS.DATETIME)
  } catch {
    return '-'
  }
}

/**
 * Format time duration in minutes to hours and minutes
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '0h 00m'

  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

/**
 * Format duration to decimal hours (e.g., 1.5h)
 */
export function formatHours(minutes: number | null | undefined, decimals = 2): string {
  if (!minutes) return '0h'

  const hours = minutes / 60
  return `${formatNumber(hours, decimals)}h`
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${formatNumber(size, i === 0 ? 0 : 1)} ${sizes[i]}`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%'

  return `${formatNumber(value, 1)}%`
}

/**
 * Format SIRET with spaces for readability
 * Example: 12345678901234 -> 123 456 789 01234
 */
export function formatSIRET(siret: string | null | undefined): string {
  if (!siret) return '-'

  const cleaned = siret.replace(/\s/g, '')
  if (cleaned.length !== 14) return siret

  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
}

/**
 * Format phone number (French format)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-'

  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    // Format: 01 23 45 67 89
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  return phone
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format initials from name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
