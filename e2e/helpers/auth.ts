import { Page } from '@playwright/test'

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/mot de passe/i).fill(password)
  await page.getByRole('button', { name: /se connecter/i }).click()
  
  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|clients|projects|kanban|invoices)/)
}

export async function logout(page: Page) {
  // Click user menu or logout button
  await page.getByRole('button', { name: /déconnexion|logout/i }).click()
  
  // Wait for redirect to login
  await page.waitForURL('/login')
}

export async function register(
  page: Page,
  fullName: string,
  email: string,
  password: string
) {
  await page.goto('/register')
  await page.getByLabel(/nom complet/i).fill(fullName)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/^mot de passe$/i).fill(password)
  await page.getByLabel(/confirmer le mot de passe/i).fill(password)
  await page.getByRole('button', { name: /s'inscrire/i }).click()
  
  // Wait for successful registration (usually redirects to login or dashboard)
  await page.waitForURL(/\/(login|dashboard)/)
}
