import { and, eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { withErrorHandling, validateJson, createSuccessResponse } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'
import { requireVerifiedUser } from '@/lib/session'
import { updateTaskSchema, uuidSchema } from '@/lib/validations'

async function getTaskByIdAndUser(id: string, userId: string) {
  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1)
    .then((rows) => rows[0])

  if (!task) {
    throw new NotFoundError('Task not found')
  }

  return task
}

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireVerifiedUser()
    const id = uuidSchema.parse(params.id)

    const task = await getTaskByIdAndUser(id, session.user.id)
    return createSuccessResponse(task)
  },
)

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireVerifiedUser()
    const id = uuidSchema.parse(params.id)
    const data = await validateJson(req, updateTaskSchema)

    await getTaskByIdAndUser(id, session.user.id)

    const updatedTask = await db
      .update(tasks)
      .set({
        title: data.title,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning()
      .then((rows) => rows[0])

    return createSuccessResponse(updatedTask)
  },
)

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireVerifiedUser()
    const id = uuidSchema.parse(params.id)

    await getTaskByIdAndUser(id, session.user.id)

    await db
      .update(tasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

    return new Response(null, { status: 204 })
  },
)
