import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const createClientMock = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}))

describe('supabase client factory', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    createClientMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws when required env variables are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(import('./supabase')).rejects.toThrow(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('creates a configured client when env variables exist', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key')
    const fakeClient = { from: vi.fn() }
    createClientMock.mockReturnValue(fakeClient)

    const module = await import('./supabase')

    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    )
    expect(module.supabase).toBe(fakeClient)
  })
})
