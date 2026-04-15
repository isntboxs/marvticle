export const UNKNOWN_API_ERROR = 'UNKNOWN_API_ERROR'
export const INVALID_RESPONSE_SCHEMA = 'INVALID_RESPONSE_SCHEMA'

export type ApiClientErrorOptions = {
  status: number
  code: string
  message: string
  fieldErrors?: Record<string, string>
  raw?: unknown
}

export class ApiClientError extends Error {
  status: number
  code: string
  fieldErrors?: Record<string, string>
  raw?: unknown

  constructor(options: ApiClientErrorOptions) {
    super(options.message)
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors
    this.raw = options.raw
  }
}
