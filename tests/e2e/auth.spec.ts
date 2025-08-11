import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveTitle(/Todo Vibe/)
    await expect(page.getByText('Sign in to Todo Vibe')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should show registration page', async ({ page }) => {
    await page.goto('/register')

    await expect(page).toHaveTitle(/Todo Vibe/)
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')

    await page.getByText('Sign up').click()
    await expect(page).toHaveURL('/register')
    await expect(page.getByText('Create your account')).toBeVisible()

    await page.getByText('Sign in').click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Sign in to Todo Vibe')).toBeVisible()
  })

  test('should validate login form', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should show validation errors
    await expect(page.getByText('Invalid email address')).toBeVisible()
  })

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register')

    // Try to submit empty form
    await page.getByRole('button', { name: 'Create account' }).click()

    // Should show validation errors
    await expect(page.getByText('Invalid email address')).toBeVisible()
  })
})
