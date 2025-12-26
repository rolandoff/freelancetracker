import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInvoiceableActivities } from './useInvoices'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// Import React for createElement
import React from 'react'

describe('useInvoiceableActivities', () => {
  const mockUser = { id: 'user-123' }
  const mockClientId = 'client-456'
  const mockProjectId = 'project-789'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when clientId is null', async () => {
    const { result } = renderHook(() => useInvoiceableActivities(null), {
      wrapper: createWrapper(),
    })

    // Query is disabled when clientId is null, so data will be undefined
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should fetch projects for client and then activities', async () => {
    const mockProjects = [{ id: mockProjectId }]
    const mockActivities = [
      {
        id: 'activity-1',
        description: 'Test Activity',
        status: 'por_facturar',
        estimated_hours: 5,
        hourly_rate: 100,
        project_id: mockProjectId,
        project: { name: 'Test Project' },
      },
    ]

    // Mock auth
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    })

    // Mock projects query
    const mockProjectsSelect = vi.fn().mockReturnThis()
    const mockProjectsEq1 = vi.fn().mockReturnThis()
    const mockProjectsEq2 = vi.fn().mockResolvedValue({
      data: mockProjects,
      error: null,
    })

    // Mock activities query
    const mockActivitiesSelect = vi.fn().mockReturnThis()
    const mockActivitiesEq = vi.fn().mockReturnThis()
    const mockActivitiesIn1 = vi.fn().mockReturnThis()
    const mockActivitiesIn2 = vi.fn().mockReturnThis()
    const mockActivitiesOrder = vi.fn().mockResolvedValue({
      data: mockActivities,
      error: null,
    })

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: mockProjectsSelect,
          eq: mockProjectsEq1,
        } as any
      }
      if (table === 'activities') {
        return {
          select: mockActivitiesSelect,
          eq: mockActivitiesEq,
          in: mockActivitiesIn1,
          order: mockActivitiesOrder,
        } as any
      }
      return {} as any
    })

    mockProjectsSelect.mockReturnValue({
      eq: mockProjectsEq1,
    })
    mockProjectsEq1.mockReturnValue({
      eq: mockProjectsEq2,
    })

    mockActivitiesSelect.mockReturnValue({
      eq: mockActivitiesEq,
    })
    mockActivitiesEq.mockReturnValue({
      in: mockActivitiesIn1,
    })
    mockActivitiesIn1.mockReturnValue({
      in: mockActivitiesIn2,
    })
    mockActivitiesIn2.mockReturnValue({
      order: mockActivitiesOrder,
    })

    const { result } = renderHook(() => useInvoiceableActivities(mockClientId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Verify projects query was called correctly
    expect(supabase.from).toHaveBeenCalledWith('projects')
    expect(mockProjectsSelect).toHaveBeenCalledWith('id')
    expect(mockProjectsEq1).toHaveBeenCalledWith('client_id', mockClientId)
    expect(mockProjectsEq2).toHaveBeenCalledWith('user_id', mockUser.id)

    // Verify activities query was called correctly
    expect(supabase.from).toHaveBeenCalledWith('activities')
    expect(mockActivitiesSelect).toHaveBeenCalledWith('*, project:projects(name)')
    expect(mockActivitiesEq).toHaveBeenCalledWith('user_id', mockUser.id)
    expect(mockActivitiesIn1).toHaveBeenCalledWith('status', ['completada', 'por_facturar'])
    expect(mockActivitiesIn2).toHaveBeenCalledWith('project_id', [mockProjectId])

    expect(result.current.data).toEqual(mockActivities)
  })

  it('should return empty array when client has no projects', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    })

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq1 = vi.fn().mockReturnThis()
    const mockEq2 = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq1,
    } as any)

    mockSelect.mockReturnValue({
      eq: mockEq1,
    })
    mockEq1.mockReturnValue({
      eq: mockEq2,
    })

    const { result } = renderHook(() => useInvoiceableActivities(mockClientId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should include both completada and por_facturar status activities', async () => {
    const mockProjects = [{ id: mockProjectId }]
    const mockActivities = [
      {
        id: 'activity-1',
        status: 'completada',
        estimated_hours: 5,
        hourly_rate: 100,
      },
      {
        id: 'activity-2',
        status: 'por_facturar',
        estimated_hours: 3,
        hourly_rate: 150,
      },
    ]

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    })

    const mockProjectsSelect = vi.fn().mockReturnThis()
    const mockProjectsEq1 = vi.fn().mockReturnThis()
    const mockProjectsEq2 = vi.fn().mockResolvedValue({
      data: mockProjects,
      error: null,
    })

    const mockActivitiesSelect = vi.fn().mockReturnThis()
    const mockActivitiesEq = vi.fn().mockReturnThis()
    const mockActivitiesIn1 = vi.fn().mockReturnThis()
    const mockActivitiesIn2 = vi.fn().mockReturnThis()
    const mockActivitiesOrder = vi.fn().mockResolvedValue({
      data: mockActivities,
      error: null,
    })

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: mockProjectsSelect,
          eq: mockProjectsEq1,
        } as any
      }
      return {
        select: mockActivitiesSelect,
        eq: mockActivitiesEq,
        in: mockActivitiesIn1,
        order: mockActivitiesOrder,
      } as any
    })

    mockProjectsSelect.mockReturnValue({ eq: mockProjectsEq1 })
    mockProjectsEq1.mockReturnValue({ eq: mockProjectsEq2 })
    mockActivitiesSelect.mockReturnValue({ eq: mockActivitiesEq })
    mockActivitiesEq.mockReturnValue({ in: mockActivitiesIn1 })
    mockActivitiesIn1.mockReturnValue({ in: mockActivitiesIn2 })
    mockActivitiesIn2.mockReturnValue({ order: mockActivitiesOrder })

    const { result } = renderHook(() => useInvoiceableActivities(mockClientId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Verify status filter includes both statuses
    expect(mockActivitiesIn1).toHaveBeenCalledWith('status', ['completada', 'por_facturar'])
    expect(result.current.data).toHaveLength(2)
  })

  it('should handle projects query error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    })

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq1 = vi.fn().mockReturnThis()
    const mockEq2 = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq1,
    } as any)

    mockSelect.mockReturnValue({ eq: mockEq1 })
    mockEq1.mockReturnValue({ eq: mockEq2 })

    const { result } = renderHook(() => useInvoiceableActivities(mockClientId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })
})
