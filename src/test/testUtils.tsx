import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AllTheProviders } from './AllTheProviders'
import { createTestQueryClient } from './queryClient'

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }
