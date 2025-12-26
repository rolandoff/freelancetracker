import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/test/testUtils'
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useUpdateActivityStatus,
} from './useActivities'
import type { QueryClient } from '@tanstack/react-query'
import type { Activity, ActivityStatus } from '@/types/database.types'

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

const sampleActivities: Activity[] = [
  {
    id: 'activity-1',
    user_id: 'user-1',
    client_id: 'client-1',
    project_id: 'project-1',
    title: 'Actividad 1',
    description: null,
    service_type: 'programacion',
    status: 'en_curso',
    estimated_hours: null,
    hourly_rate: null,
    observations: null,
    sort_order: 0,
    completed_at: null,
    invoiced_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const createActivityInput: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
  client_id: 'client-1',
  project_id: 'project-1',
  title: 'Actividad 1',
  description: null,
  service_type: 'programacion',
  status: 'en_curso' as ActivityStatus,
  estimated_hours: null,
  hourly_rate: null,
  observations: null,
  sort_order: 0,
  completed_at: null,
  invoiced_at: null,
}

describe('useActivities hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  describe('useActivities', () => {
    it('fetches activities with relations', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: sampleActivities, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivities(), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(sampleActivities)
      })

      expect(mockSupabaseFrom).toHaveBeenCalledWith('activities')
      expect(mockSelect).toHaveBeenCalled()
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true })
    })

    it('throws errors from supabase', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: new Error('Failed') })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivities(), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error)
      })
    })
  })

  describe('useCreateActivity', () => {
    it('creates activity and invalidates cache', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: sampleActivities[0], error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useCreateActivity(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync(createActivityInput)
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Actividad 1',
          user_id: 'user-1',
        })
      )
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })

    it('fails when user is not authenticated', async () => {
      mockSupabaseAuthGetUser.mockResolvedValueOnce({ data: { user: null } })
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateActivity(), { wrapper: Wrapper })

      await expect(result.current.mutateAsync(createActivityInput)).rejects.toThrow('Not authenticated')
    })
  })

  describe('useUpdateActivity', () => {
    it('updates activity and invalidates cache', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: sampleActivities[0], error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useUpdateActivity(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: 'activity-1',
          updates: { title: 'Updated' },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated' })
      expect(mockEq).toHaveBeenCalledWith('id', 'activity-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })
  })

  describe('useUpdateActivityStatus', () => {
    it('sets completed_at when status changes to completada', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: sampleActivities[0], error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useUpdateActivityStatus(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 'activity-1', status: 'completada' })
      })

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completada',
          completed_at: expect.any(String),
        })
      )
      expect(mockEq).toHaveBeenCalledWith('id', 'activity-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })
  })

  describe('useDeleteActivity', () => {
    it('deletes activity and invalidates cache', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ delete: mockDelete })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useDeleteActivity(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync('activity-1')
      })

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'activity-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['activities'] })
    })
  })
})
