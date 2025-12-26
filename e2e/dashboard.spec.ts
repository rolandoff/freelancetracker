import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you'd authenticate here
    // For now, we'll just navigate and expect redirect
    await page.goto('/dashboard')
  })

  test('should display dashboard structure when authenticated', async ({ page }) => {
    // If not authenticated, will redirect to login
    const url = page.url()
    
    if (url.includes('/login')) {
      // Not authenticated - skip this test or implement auth helper
      test.skip()
    } else {
      // Authenticated - verify dashboard elements
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    }
  })

  test('should show quick actions', async ({ page }) => {
    const url = page.url()
    
    if (url.includes('/login')) {
      test.skip()
    } else {
      await expect(page.getByRole('heading', { name: /actions rapides/i })).toBeVisible()
      
      // Verify quick action buttons exist
      await expect(page.getByRole('button', { name: /nouvelle activité/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /nouvelle facture/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /nouveau client/i })).toBeVisible()
    }
  })

  test('should navigate to kanban from quick action', async ({ page }) => {
    const url = page.url()
    
    if (url.includes('/login')) {
      test.skip()
    } else {
      await page.getByRole('button', { name: /nouvelle activité/i }).click()
      await expect(page).toHaveURL('/kanban')
    }
  })

  test('should navigate to invoice creation from quick action', async ({ page }) => {
    const url = page.url()
    
    if (url.includes('/login')) {
      test.skip()
    } else {
      await page.getByRole('button', { name: /nouvelle facture/i }).click()
      await expect(page).toHaveURL('/invoices/new')
    }
  })

  test('should navigate to clients from quick action', async ({ page }) => {
    const url = page.url()
    
    if (url.includes('/login')) {
      test.skip()
    } else {
      await page.getByRole('button', { name: /nouveau client/i }).click()
      await expect(page).toHaveURL('/clients')
    }
  })
})
