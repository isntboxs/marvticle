import { ApiClientError } from './api-error'

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) return error.message
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}
