import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

const originalFetch = globalThis.fetch

Object.assign(import.meta.env, {
  VITE_SERVER_URL: 'https://example.com',
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  globalThis.fetch = originalFetch
})
