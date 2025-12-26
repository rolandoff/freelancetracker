import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatDuration,
  formatHours,
  formatFileSize,
  formatPercentage,
  formatSIRET,
  formatPhone,
  truncate,
  getInitials,
} from './format'

describe('format utils', () => {
  describe('formatCurrency', () => {
    const normalize = (value: string) => value.replace(/\u202f|\xa0/g, ' ')

    it('handles nullish values and formats to EUR locale', () => {
      expect(normalize(formatCurrency(undefined))).toBe('0,00 €')
      expect(normalize(formatCurrency(1234.5))).toBe('1 234,50 €')
    })
  })

  describe('formatNumber', () => {
    it('formats number with configurable decimals', () => {
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(1234.567, 1)).toBe('1 234,6')
    })
  })

  describe('formatDate / formatDateTime', () => {
    const iso = '2024-05-10T12:34:56'

    it('returns dash for invalid date', () => {
      expect(formatDate(undefined)).toBe('-')
      expect(formatDateTime('invalid')).toBe('-')
    })

    it('formats ISO strings in French locale', () => {
      expect(formatDate(iso)).toBe('10/05/2024')
      expect(formatDateTime(iso)).toBe('10/05/2024 12:34')
    })
  })

  describe('formatDuration / formatHours', () => {
    it('formats duration minutes', () => {
      expect(formatDuration(null)).toBe('0h 00m')
      expect(formatDuration(95)).toBe('1h 35m')
    })

    it('formats hours with decimals', () => {
      expect(formatHours(null)).toBe('0h')
      expect(formatHours(90)).toBe('1,50h')
    })
  })

  describe('formatFileSize', () => {
    it('converts bytes into readable size', () => {
      expect(formatFileSize(null)).toBe('0 B')
      expect(formatFileSize(2048)).toBe('2,0 KB')
    })
  })

  describe('formatPercentage', () => {
    it('formats value with percent sign', () => {
      expect(formatPercentage(null)).toBe('0%')
      expect(formatPercentage(12.345)).toBe('12,3%')
    })
  })

  describe('formatSIRET', () => {
    it('returns dash for missing and groups digits when length matches', () => {
      expect(formatSIRET(null)).toBe('-')
      expect(formatSIRET('12345678901234')).toBe('123 456 789 01234')
      expect(formatSIRET('123')).toBe('123')
    })
  })

  describe('formatPhone', () => {
    it('formats 10-digit numbers into French pattern', () => {
      expect(formatPhone(null)).toBe('-')
      expect(formatPhone('0123456789')).toBe('01 23 45 67 89')
      expect(formatPhone('123')).toBe('123')
    })
  })

  describe('truncate', () => {
    it('truncates text with ellipsis', () => {
      expect(truncate(null, 5)).toBe('')
      expect(truncate('short', 10)).toBe('short')
      expect(truncate('longtext', 5)).toBe('lo...')
    })
  })

  describe('getInitials', () => {
    it('returns initials or question mark', () => {
      expect(getInitials(null)).toBe('?')
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Nombre Triple')).toBe('NT')
    })
  })
})
