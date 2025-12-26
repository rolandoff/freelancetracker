import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/test/testUtils'
import {
  useRates,
  useBaseRates,
  useClientRates,
  useCreateRate,
  useUpdateRate,
  useDeleteRate,
  useApplicableRate,
} from './useRates'
import type { QueryClient } from '@tanstack/react-query'
import type { Rate, ServiceType } from '@/types/database.types'

const {
  mockSupabaseFrom,
  mockSupabaseAuthGetUser,
} = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockSupabaseAuthGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: {
      getUser: mockSupabaseAuthGetUser,
    },
  },
}))

const createWrapper = (client?: QueryClient) => {
  const queryClient = client ?? createTestQueryClient()
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

const sampleRate: Rate = {
  id: 'rate-1',
  user_id: 'user-1',
  client_id: 'client-1',
  service_type: 'programacion',
  hourly_rate: 120,
  is_active: true,
  description: 'Client specific rate',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const baseRate: Rate = {
  ...sampleRate,
  id: 'rate-2',
  client_id: null,
}

const rateInput: Omit<Rate, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
  client_id: 'client-1',
  service_type: 'programacion',
  hourly_rate: 150,
  is_active: true,
  description: 'New rate',
}

describe('useRates hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  describe('useRates / useBaseRates / useClientRates', () => {
    it('fetches rates ordered by service_type', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [sampleRate], error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useRates(), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual([sampleRate])
      })

      expect(mockSupabaseFrom).toHaveBeenCalledWith('rates')
      expect(mockOrder).toHaveBeenCalledWith('service_type', { ascending: true })
    })

    it('fetches base rates filtering null client_id', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [baseRate], error: null })
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useBaseRates(), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual([baseRate])
      })

      expect(mockIs).toHaveBeenCalledWith('client_id', null)
    })

    it('fetches client-specific rates only when clientId provided', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [sampleRate], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      // First with null -> should skip
      const nullResult = renderHook(() => useClientRates(null), { wrapper: Wrapper }).result
      await waitFor(() => {
        expect(nullResult.current.data).toBeUndefined()
      })

      const { result } = renderHook(() => useClientRates('client-1'), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual([sampleRate])
      })

      expect(mockEq).toHaveBeenCalledWith('client_id', 'client-1')
    })
  })

  describe('useCreateRate', () => {
    it('creates rate and invalidates cache', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: sampleRate, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useCreateRate(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync(rateInput)
      })

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'client-1' }))
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['rates'] })
    })

    it('throws when user not authenticated', async () => {
      mockSupabaseAuthGetUser.mockResolvedValueOnce({ data: { user: null } })
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateRate(), { wrapper: Wrapper })

      await expect(result.current.mutateAsync(rateInput)).rejects.toThrow('Not authenticated')
    })
  })

  describe('useUpdateRate', () => {
    it('updates rate and invalidates cache', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: sampleRate, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useUpdateRate(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 'rate-1', updates: { hourly_rate: 200 } })
      })

      expect(mockUpdate).toHaveBeenCalledWith({ hourly_rate: 200 })
      expect(mockEq).toHaveBeenCalledWith('id', 'rate-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['rates'] })
    })
  })

  describe('useDeleteRate', () => {
    it('deletes rate and invalidates cache', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ delete: mockDelete })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useDeleteRate(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync('rate-1')
      })

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'rate-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['rates'] })
    })
  })

  describe('useApplicableRate', () => {
    it('returns client-specific rate when available', async () => {
      const mockMaybeSingle = vi.fn()
      mockMaybeSingle
        .mockResolvedValueOnce({ data: sampleRate, error: null }) // client-specific

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle,
        }),
      })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(
        () => useApplicableRate('programacion' as ServiceType, 'client-1'),
        { wrapper: Wrapper }
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(sampleRate)
      })
    })

    it('falls back to base rate when client rate missing', async () => {
      const mockMaybeSingle = vi.fn()
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      // First call: client-specific rate -> null
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
      // Second call: base rate -> value
      mockMaybeSingle.mockResolvedValueOnce({ data: baseRate, error: null })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(
        () => useApplicableRate('programacion' as ServiceType, 'client-1'),
        { wrapper: Wrapper }
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(baseRate)
      })

      // Ensure we requested client-specific rate then base rate
      expect(mockSelect).toHaveBeenCalledTimes(2)
    })
  })
})
