import { and, eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { withErrorHandling, createSuccessResponse } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'
import { requireVerifiedUser } from '@/lib/session'
import { uuidSchema } from '@/lib/validations'

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireVerifiedUser()
    const id = uuidSchema.parse(params.id)

    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .limit(1)
      .then((rows) => rows[0])

    if (!task) {
      throw new NotFoundError('Task not found')
    }

    if (!task.deletedAt) {
      return createSuccessResponse(task)
    }

    const restoredTask = await db
      .update(tasks)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning()
      .then((rows) => rows[0])

    return createSuccessResponse(restoredTask)
  },
)
