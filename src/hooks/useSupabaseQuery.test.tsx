import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'
import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery'
import { createTestQueryClient } from '@/test/queryClient'

const createWrapper = (client = createTestQueryClient()) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { Wrapper, client }
}

const createPostgrestError = (overrides: Partial<PostgrestError> = {}): PostgrestError => ({
  message: 'error',
  details: 'details',
  hint: '',
  code: '400',
  name: 'PostgrestError',
  ...overrides,
})

describe('useSupabaseQuery', () => {
  it('resolves data when queryFn succeeds', async () => {
    const queryFn = vi.fn<[], Promise<{ data: string | null; error: PostgrestError | null }>>(
      () => Promise.resolve({ data: 'result', error: null })
    )
    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useSupabaseQuery({ queryKey: ['test'], queryFn }),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      expect(result.current.data).toBe('result')
    })
  })

  it('exposes error when queryFn returns error', async () => {
    const error = createPostgrestError({ message: 'Query failed' })
    const queryFn = vi.fn<[], Promise<{ data: string | null; error: PostgrestError | null }>>(
      () => Promise.resolve({ data: null, error })
    )
    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useSupabaseQuery({ queryKey: ['test'], queryFn }),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      expect(result.current.error).toBe(error)
    })
  })
})

describe('useSupabaseMutation', () => {
  type MutationReturn = { data: { id: string } | null; error: PostgrestError | null }
  type MutationArgs = { value: number } | undefined
  let mutationFn: ReturnType<typeof vi.fn<[MutationArgs], Promise<MutationReturn>>>
  const mockError = createPostgrestError({ message: 'Mutation failed' })

  beforeEach(() => {
    mutationFn = vi.fn<[MutationArgs], Promise<MutationReturn>>()
  })

  it('calls mutationFn, onSuccess and invalidates queries on success', async () => {
    mutationFn.mockResolvedValue({ data: { id: '1' }, error: null })
    const onSuccess = vi.fn()
    const invalidateKey = ['list']
    const { client, Wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(
      () =>
        useSupabaseMutation({
          mutationFn,
          onSuccess,
          invalidateQueries: [invalidateKey],
        }),
      { wrapper: Wrapper }
    )

    await result.current.mutateAsync({ value: 1 })

    expect(mutationFn).toHaveBeenCalledWith({ value: 1 })
    expect(onSuccess).toHaveBeenCalledWith({ id: '1' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: invalidateKey })
  })

  it('calls onError when mutationFn returns error', async () => {
    mutationFn.mockResolvedValue({ data: null, error: mockError })
    const onError = vi.fn()
    const { Wrapper } = createWrapper()

    const { result } = renderHook(
      () =>
        useSupabaseMutation({
          mutationFn,
          onError,
        }),
      { wrapper: Wrapper }
    )

    await expect(result.current.mutateAsync(undefined)).rejects.toThrow('Mutation failed')
    expect(onError).toHaveBeenCalledWith(mockError)
  })
})
