import { describe, expect, it } from 'vitest'
import { appStatusQueryOptions } from './app-status'

describe('appStatusQueryOptions', () => {
  it('returns the expected query metadata', () => {
    const options = appStatusQueryOptions()

    expect(options.queryKey).toEqual(['app-status'])
    expect(options.staleTime).toBe(30_000)
    expect(options.queryFn).toBeTypeOf('function')
  })
})
