import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryProvider } from './QueryProvider'
import { useQuery, useQueryClient } from '@tanstack/react-query'

function QueryConsumer() {
  const { data } = useQuery({
    queryKey: ['provider-test'],
    queryFn: async () => 'ready',
  })
  return <div>{data}</div>
}

function DefaultsConsumer() {
  const queryClient = useQueryClient()
  const defaults = queryClient.getDefaultOptions().queries

  return (
    <div data-testid="defaults">
      {JSON.stringify({
        staleTime: defaults?.staleTime,
        refetchOnWindowFocus: defaults?.refetchOnWindowFocus,
        retry: defaults?.retry,
      })}
    </div>
  )
}

describe('QueryProvider', () => {
  it('provides a query client to children and resolves queries', async () => {
    render(
      <QueryProvider>
        <QueryConsumer />
      </QueryProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument()
    })
  })

  it('applies default query options (staleTime, refetch, retry)', async () => {
    render(
      <QueryProvider>
        <DefaultsConsumer />
      </QueryProvider>
    )

    const defaultsEl = await screen.findByTestId('defaults')
    const defaults = JSON.parse(defaultsEl.textContent || '{}')

    expect(defaults.staleTime).toBe(60 * 1000)
    expect(defaults.refetchOnWindowFocus).toBe(false)
    expect(defaults.retry).toBe(1)
  })
})
