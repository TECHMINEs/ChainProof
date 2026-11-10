import { NextResponse } from 'next/server'

/**
 * Logs the real failure server-side and returns a generic, user-safe 500 response.
 * Stack traces and internal messages never reach the client.
 */
export function serverError(route: string, error: unknown, message = 'Internal Server Error') {
  console.error(`[${route}]`, error instanceof Error ? error.stack ?? error.message : error)
  return NextResponse.json({ error: message }, { status: 500 })
}
