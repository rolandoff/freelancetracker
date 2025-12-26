import { test, expect } from '@playwright/test'

// Note: These tests require authentication setup
// For now, they test the UI structure and navigation
// Full CRUD tests should be run with authenticated sessions

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Unauthenticated users should be redirected
    await expect(page).toHaveURL('/login')
  })

  test.describe('when authenticated', () => {
    // TODO: Add authentication helper
    // test.beforeEach(async ({ page }) => {
    //   await login(page, TEST_USER.email, TEST_USER.password)
    //   await page.goto('/clients')
    // })

    test.skip('should display clients page with header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
      await expect(
        page.getByText(/gérez vos clients/i)
      ).toBeVisible()
    })

    test.skip('should show new client button', async ({ page }) => {
      const newClientBtn = page.getByRole('button', { name: /nouveau client/i })
      await expect(newClientBtn).toBeVisible()
    })

    test.skip('should open client creation modal on button click', async ({ page }) => {
      await page.getByRole('button', { name: /nouveau client/i }).click()
      
      // Check modal is visible with form fields
      await expect(page.getByLabel(/nom/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/siret/i)).toBeVisible()
    })

    test.skip('should validate required fields when creating client', async ({ page }) => {
      await page.getByRole('button', { name: /nouveau client/i }).click()
      
      // Try to submit without filling required fields
      await page.getByRole('button', { name: /créer/i }).click()
      
      // Should show validation error
      await expect(page.getByText(/nom est requis/i)).toBeVisible()
    })

    test.skip('should create new client with valid data', async ({ page }) => {
      await page.getByRole('button', { name: /nouveau client/i }).click()
      
      // Fill form
      const timestamp = Date.now()
      await page.getByLabel(/nom/i).fill(`Test Client ${timestamp}`)
      await page.getByLabel(/email/i).fill(`client${timestamp}@test.com`)
      await page.getByLabel(/siret/i).fill('12345678901234')
      
      // Submit
      await page.getByRole('button', { name: /créer/i }).click()
      
      // Should show success message and client in list
      await expect(page.getByText(/client créé/i)).toBeVisible()
      await expect(page.getByText(`Test Client ${timestamp}`)).toBeVisible()
    })

    test.skip('should filter inactive clients', async ({ page }) => {
      const checkbox = page.getByRole('checkbox', {
        name: /afficher les clients inactifs/i,
      })
      
      // Toggle checkbox
      await checkbox.click()
      await expect(checkbox).toBeChecked()
      
      await checkbox.click()
      await expect(checkbox).not.toBeChecked()
    })

    test.skip('should edit existing client', async ({ page }) => {
      // Find first client in list
      const firstClient = page.locator('tbody tr').first()
      await firstClient.getByRole('button', { name: /modifier/i }).click()
      
      // Update name
      const nameInput = page.getByLabel(/nom/i)
      await nameInput.clear()
      await nameInput.fill('Updated Client Name')
      
      // Submit
      await page.getByRole('button', { name: /enregistrer/i }).click()
      
      // Should show success
      await expect(page.getByText(/client mis à jour/i)).toBeVisible()
    })

    test.skip('should toggle client active status', async ({ page }) => {
      // Find first active client
      const firstClient = page.locator('tbody tr').first()
      
      // Click deactivate button
      await firstClient.getByRole('button', { name: /désactiver/i }).click()
      
      // Should show inactive badge
      await expect(firstClient.getByText(/inactif/i)).toBeVisible()
    })

    test.skip('should validate SIRET format', async ({ page }) => {
      await page.getByRole('button', { name: /nouveau client/i }).click()
      
      // Fill form with invalid SIRET
      await page.getByLabel(/nom/i).fill('Test Client')
      await page.getByLabel(/siret/i).fill('123') // Invalid length
      
      // Should show validation error
      await expect(page.getByText(/siret.*14.*chiffres/i)).toBeVisible()
    })
  })
})
