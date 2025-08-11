import { and, count, desc, eq, ilike, isNull, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import {
  createSuccessResponse,
  validateJson,
  validateQuery,
  withErrorHandling,
} from '@/lib/api-utils'
import { LimitExceededError } from '@/lib/errors'
import { requireVerifiedUser } from '@/lib/session'
import { createTaskSchema, taskFilterSchema } from '@/lib/validations'

const MAX_TASKS_PER_USER = 100

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireVerifiedUser()
  const { searchParams } = new URL(req.url)
  const filters = validateQuery(searchParams, taskFilterSchema)

  let query = db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, session.user.id))
    .orderBy(desc(tasks.createdAt))

  if (filters.status === 'active') {
    query = query.where(
      and(eq(tasks.userId, session.user.id), eq(tasks.isCompleted, false), isNull(tasks.deletedAt)),
    )
  } else if (filters.status === 'completed') {
    query = query.where(
      and(eq(tasks.userId, session.user.id), eq(tasks.isCompleted, true), isNull(tasks.deletedAt)),
    )
  } else if (filters.status === 'deleted') {
    query = query.where(and(eq(tasks.userId, session.user.id), sql`${tasks.deletedAt} IS NOT NULL`))
  } else {
    query = query.where(and(eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
  }

  if (filters.q) {
    query = query.where(ilike(tasks.title, `%${filters.q}%`))
  }

  if (filters.cursor) {
    query = query.where(sql`${tasks.createdAt} < ${new Date(filters.cursor)}`)
  }

  const results = await query.limit(filters.limit + 1).execute()

  const hasMore = results.length > filters.limit
  const items = hasMore ? results.slice(0, -1) : results
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

  return createSuccessResponse({
    tasks: items,
    nextCursor,
    hasMore,
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireVerifiedUser()
  const data = await validateJson(req, createTaskSchema)

  const taskCount = await db
    .select({ count: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
    .then((rows) => rows[0].count)

  if (taskCount >= MAX_TASKS_PER_USER) {
    throw new LimitExceededError(`Maximum ${MAX_TASKS_PER_USER} tasks per user allowed`)
  }

  const newTask = await db
    .insert(tasks)
    .values({
      userId: session.user.id,
      title: data.title,
    })
    .returning()
    .then((rows) => rows[0])

  return createSuccessResponse(newTask, 201)
})
