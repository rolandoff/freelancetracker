import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getActivityStatusInfo,
  getInvoiceStatusInfo,
  getServiceTypeInfo,
  calculateInvoiceTotal,
  calculateURSSAF,
  calculateThresholdProgress,
  generateStoragePath,
  deepClone,
  debounce,
  throttle,
  generateId,
  groupBy,
  sortBy,
  isEmpty,
  clamp,
  getContrastColor,
  sleep,
} from './helpers'
import { ACTIVITY_STATUSES, INVOICE_STATUSES, SERVICE_TYPES } from '@/lib/constants'
import type { ActivityStatus, InvoiceStatus, ServiceType } from '@/types/database.types'

describe('helpers utils', () => {
  describe('status/service helpers', () => {
    it('returns matching activity status info or fallback', () => {
      expect(getActivityStatusInfo('en_curso')).toEqual(
        ACTIVITY_STATUSES.find((s) => s.value === 'en_curso')
      )
      expect(getActivityStatusInfo('unknown' as ActivityStatus)).toEqual(ACTIVITY_STATUSES[0])
    })

    it('returns matching invoice status info or fallback', () => {
      expect(getInvoiceStatusInfo('pagada')).toEqual(
        INVOICE_STATUSES.find((s) => s.value === 'pagada')
      )
      expect(getInvoiceStatusInfo('foo' as InvoiceStatus)).toEqual(INVOICE_STATUSES[0])
    })

    it('returns service type info or fallback', () => {
      expect(getServiceTypeInfo('programacion')).toEqual(
        SERVICE_TYPES.find((s) => s.value === 'programacion')
      )
      expect(getServiceTypeInfo('bar' as ServiceType)).toEqual(SERVICE_TYPES[0])
    })
  })

  describe('financial calculations', () => {
    it('calculates invoice total with discounts and prevents negative values', () => {
      expect(calculateInvoiceTotal(100)).toBe(100)
      expect(calculateInvoiceTotal(100, 10)).toBe(90)
      expect(calculateInvoiceTotal(100, 10, 50)).toBe(40)
      expect(calculateInvoiceTotal(100, 10, 1000)).toBe(0)
    })

    it('calculates URSSAF contributions from revenue', () => {
      expect(calculateURSSAF(1000)).toBeCloseTo(246)
      expect(calculateURSSAF(1000, 10)).toBe(100)
    })

    it('calculates threshold progress', () => {
      expect(calculateThresholdProgress(500, 1000)).toEqual({
        percentage: 50,
        remaining: 500,
        exceeded: false,
      })
      expect(calculateThresholdProgress(1500, 1000)).toEqual({
        percentage: 100,
        remaining: 0,
        exceeded: true,
      })
    })
  })

  describe('storage path & cloning', () => {
    it('generates sanitized storage paths using timestamp', () => {
      vi.spyOn(Date, 'now').mockReturnValue(123456)
      expect(generateStoragePath('bucket', 'user', 'resource', 'file name.png')).toBe(
        'bucket/user/resource/123456_file_name.png'
      )
      vi.restoreAllMocks()
    })

    it('deep clones objects', () => {
      const original = { a: 1, nested: { b: 2 } }
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      cloned.nested.b = 3
      expect(original.nested.b).toBe(2)
    })
  })

  describe('debounce and throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debounces calls', () => {
      const spy = vi.fn()
      const debounced = debounce(spy, 200)

      debounced('first')
      debounced('second')
      vi.advanceTimersByTime(199)
      expect(spy).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('second')
    })

    it('throttles calls', () => {
      const spy = vi.fn()
      const throttled = throttle(spy, 200)

      throttled('first')
      throttled('second')
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('first')

      vi.advanceTimersByTime(200)
      throttled('third')
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith('third')
    })
  })

  describe('generateId', () => {
    it('returns predictable id when Date.now and Math.random mocked', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000)
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      expect(generateId()).toBe('1000_i')

      vi.restoreAllMocks()
    })
  })

  describe('array utilities', () => {
    const items = [
      { id: '1', group: 'a', value: 2 },
      { id: '2', group: 'b', value: 1 },
      { id: '3', group: 'a', value: 3 },
    ]

    it('groups by key', () => {
      expect(groupBy(items, 'group')).toEqual({
        a: [
          { id: '1', group: 'a', value: 2 },
          { id: '3', group: 'a', value: 3 },
        ],
        b: [{ id: '2', group: 'b', value: 1 }],
      })
    })

    it('sorts by multiple keys', () => {
      const sorted = sortBy(items, 'value', 'id')
      expect(sorted.map((i) => i.id)).toEqual(['2', '1', '3'])
    })
  })

  describe('value helpers', () => {
    it('detects empty values', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty('value')).toBe(false)
      expect(isEmpty([1])).toBe(false)
    })

    it('clamps values', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('color helpers', () => {
    it('returns contrast color based on luminance', () => {
      expect(getContrastColor('#FFFFFF')).toBe('black')
      expect(getContrastColor('#000000')).toBe('white')
    })
  })

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('resolves after given delay', async () => {
      const promise = sleep(500)
      vi.advanceTimersByTime(499)
      let resolved = false
      promise.then(() => (resolved = true))
      vi.advanceTimersByTime(1)
      await promise
      expect(resolved).toBe(true)
    })
  })
})
