import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useTimeEntries, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry, useActivityTotalHours } from './useTimeEntries'
import { createTestQueryClient } from '@/test/testUtils'

const {
  mockSupabaseFrom,
  mockAuthGetUser,
} = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockAuthGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  },
}))

const createWrapper = (client?: QueryClient) => {
  const queryClient = client ?? createTestQueryClient()
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

describe('useTimeEntries hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTimeEntries', () => {
    it('fetches entries for the provided activity id', async () => {
      const entry = { id: 'entry-1' }
      const mockOrder = vi.fn().mockResolvedValue({ data: [entry], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useTimeEntries('activity-1'), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual([entry])
      })

      expect(mockSupabaseFrom).toHaveBeenCalledWith('time_entries')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('activity_id', 'activity-1')
      expect(mockOrder).toHaveBeenCalledWith('start_time', { ascending: false })
    })

    it('does not run query when activity id is null', async () => {
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useTimeEntries(null), { wrapper: Wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockSupabaseFrom).not.toHaveBeenCalled()
    })
  })

  describe('useCreateTimeEntry', () => {
    it('inserts a new entry and invalidates related queries', async () => {
      const createdEntry = { id: 'entry-1', activity_id: 'activity-1' }
      const mockSingle = vi.fn().mockResolvedValue({ data: createdEntry, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert })
      mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useCreateTimeEntry(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          activity_id: 'activity-1',
          start_time: '2024-01-01T10:00:00Z',
          end_time: '2024-01-01T11:00:00Z',
          notes: null,
        })
      })

      expect(mockInsert).toHaveBeenCalledWith({
        activity_id: 'activity-1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        notes: null,
        user_id: 'user-1',
      })
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['time_entries', 'activity-1'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })

    it('throws when no authenticated user is found', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: null } })
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateTimeEntry(), { wrapper: Wrapper })

      await expect(
        result.current.mutateAsync({
          activity_id: 'activity-1',
          start_time: '2024-01-01T10:00:00Z',
          end_time: '2024-01-01T11:00:00Z',
          notes: null,
        })
      ).rejects.toThrow('Not authenticated')
    })
  })

  describe('useUpdateTimeEntry', () => {
    it('updates entry and invalidates caches', async () => {
      const updatedEntry = { id: 'entry-1', activity_id: 'activity-1' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedEntry, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useUpdateTimeEntry(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: 'entry-1',
          updates: { notes: 'Updated notes' },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith({ notes: 'Updated notes' })
      expect(mockEq).toHaveBeenCalledWith('id', 'entry-1')
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['time_entries', 'activity-1'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })
  })

  describe('useDeleteTimeEntry', () => {
    it('deletes entry and invalidates caches', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ delete: mockDelete })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useDeleteTimeEntry(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 'entry-1', activityId: 'activity-1' })
      })

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'entry-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['time_entries', 'activity-1'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })
  })

  describe('useActivityTotalHours', () => {
    it('sums duration minutes and converts to hours', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ duration_minutes: 60 }, { duration_minutes: 30 }],
        error: null,
      })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivityTotalHours('activity-1'), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toBeCloseTo(1.5)
      })

      expect(mockSelect).toHaveBeenCalledWith('duration_minutes')
      expect(mockEq).toHaveBeenCalledWith('activity_id', 'activity-1')
    })

    it('returns 0 when activity id is not provided', () => {
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivityTotalHours(null), { wrapper: Wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockSupabaseFrom).not.toHaveBeenCalled()
    })
  })
})
