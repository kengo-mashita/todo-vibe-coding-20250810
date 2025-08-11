import { z } from 'zod'

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long')

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(8, 'Username must be 8 characters or less')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

export const emailSchema = z.string().email('Invalid email address')

export const taskTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(100, 'Title must be 100 characters or less')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  name: z.string().optional(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const createTaskSchema = z.object({
  title: taskTitleSchema,
})

export const updateTaskSchema = z.object({
  title: taskTitleSchema,
})

export const taskFilterSchema = z.object({
  status: z.enum(['active', 'completed', 'deleted']).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

export const uuidSchema = z.string().uuid('Invalid ID format')

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
export type TaskFilter = z.infer<typeof taskFilterSchema>
