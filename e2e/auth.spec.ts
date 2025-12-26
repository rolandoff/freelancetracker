import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await expect(page).toHaveURL('/login')
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should still be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /créer un compte/i }).click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: /inscription/i })).toBeVisible()
  })

  test('should display register form with all fields', async ({ page }) => {
    await page.goto('/register')
    
    await expect(page.getByLabel(/nom complet/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^mot de passe$/i)).toBeVisible()
    await expect(page.getByLabel(/confirmer le mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /s'inscrire/i })).toBeVisible()
  })

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByRole('link', { name: /se connecter/i }).click()
    
    await expect(page).toHaveURL('/login')
  })

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/login')
    
    const forgotPasswordLink = page.getByRole('link', { name: /mot de passe oublié/i })
    await expect(forgotPasswordLink).toBeVisible()
    
    await forgotPasswordLink.click()
    await expect(page).toHaveURL('/forgot-password')
  })
})
