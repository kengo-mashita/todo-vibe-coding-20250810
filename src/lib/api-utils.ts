import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { AppError, formatError } from '@/lib/errors'

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context?: { params: Record<string, string> },
) => Promise<T>

export function withErrorHandling<T>(handler: ApiHandler<T>) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      const result = await handler(req, context)
      return result instanceof NextResponse ? result : NextResponse.json(result)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof AppError) {
        return NextResponse.json(formatError(error), { status: error.statusCode })
      }

      const errorResponse = formatError(error)
      return NextResponse.json(errorResponse, { status: 500 })
    }
  }
}

export async function validateJson<T>(req: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new AppError(firstError.message, 'VALIDATION_ERROR', 422)
    }
    throw new AppError('Invalid JSON', 'INVALID_JSON', 400)
  }
}

export function validateQuery<T>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  const query = Object.fromEntries(searchParams.entries())
  try {
    return schema.parse(query)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new AppError(firstError.message, 'VALIDATION_ERROR', 422)
    }
    throw new AppError('Invalid query parameters', 'INVALID_QUERY', 400)
  }
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(error: unknown, status?: number) {
  const errorResponse = formatError(error)
  const statusCode = status || (error instanceof AppError ? error.statusCode : 500)
  return NextResponse.json(errorResponse, { status: statusCode })
}
