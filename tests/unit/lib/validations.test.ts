import { describe, it, expect } from 'vitest'

import {
  passwordSchema,
  usernameSchema,
  emailSchema,
  taskTitleSchema,
  registerSchema,
  loginSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      expect(passwordSchema.safeParse('password123').success).toBe(true)
      expect(passwordSchema.safeParse('12345678').success).toBe(true)
    })

    it('should reject short passwords', () => {
      expect(passwordSchema.safeParse('1234567').success).toBe(false)
      expect(passwordSchema.safeParse('').success).toBe(false)
    })
  })

  describe('usernameSchema', () => {
    it('should accept valid usernames', () => {
      expect(usernameSchema.safeParse('user123').success).toBe(true)
      expect(usernameSchema.safeParse('test_user').success).toBe(true)
      expect(usernameSchema.safeParse('a').success).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(usernameSchema.safeParse('toolongusername').success).toBe(false)
      expect(usernameSchema.safeParse('user-name').success).toBe(false)
      expect(usernameSchema.safeParse('user@name').success).toBe(false)
      expect(usernameSchema.safeParse('').success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true)
      expect(emailSchema.safeParse('test.user+tag@example.co.uk').success).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('invalid-email').success).toBe(false)
      expect(emailSchema.safeParse('@example.com').success).toBe(false)
      expect(emailSchema.safeParse('user@').success).toBe(false)
    })
  })

  describe('taskTitleSchema', () => {
    it('should accept valid task titles', () => {
      expect(taskTitleSchema.safeParse('Buy groceries').success).toBe(true)
      expect(taskTitleSchema.safeParse('  Task with spaces  ').success).toBe(true)
    })

    it('should reject invalid task titles', () => {
      expect(taskTitleSchema.safeParse('').success).toBe(false)
      expect(taskTitleSchema.safeParse('   ').success).toBe(false)
      expect(taskTitleSchema.safeParse('a'.repeat(101)).success).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = taskTitleSchema.safeParse('  Test Task  ')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('Test Task')
      }
    })
  })

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        username: 'testuser',
        name: 'Test User',
      }
      expect(registerSchema.safeParse(validData).success).toBe(true)
    })

    it('should accept registration data without name', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        username: 'testuser',
      }
      expect(registerSchema.safeParse(validData).success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      }
      expect(loginSchema.safeParse(validData).success).toBe(true)
    })

    it('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
      }
      expect(loginSchema.safeParse(invalidData).success).toBe(false)
    })
  })
})
