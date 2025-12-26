import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { useUIStore } from '@/stores/uiStore'

vi.mock('@/stores/uiStore', () => ({
  useUIStore: vi.fn(),
}))

const mockedUseUIStore = useUIStore as unknown as ReturnType<typeof vi.fn>

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('applies theme class to document root', () => {
    mockedUseUIStore.mockReturnValue('dark')

    render(
      <ThemeProvider>
        <div data-testid="child">content</div>
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
})
