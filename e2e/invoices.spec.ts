import { test, expect } from '@playwright/test'

test.describe('Invoice Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/invoices')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/login')
  })

  test.describe('when authenticated', () => {
    // TODO: Add authentication helper
    // test.beforeEach(async ({ page }) => {
    //   await login(page, TEST_USER.email, TEST_USER.password)
    //   await page.goto('/invoices')
    // })

    test.skip('should display invoices page with header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /factures/i })).toBeVisible()
      await expect(
        page.getByText(/gérez vos factures clients/i)
      ).toBeVisible()
    })

    test.skip('should show new invoice button', async ({ page }) => {
      const newInvoiceBtn = page.getByRole('button', { name: /nouvelle facture/i })
      await expect(newInvoiceBtn).toBeVisible()
    })

    test.skip('should navigate to invoice creation page', async ({ page }) => {
      await page.getByRole('button', { name: /nouvelle facture/i }).click()
      
      await expect(page).toHaveURL('/invoices/new')
      await expect(page.getByText(/sélectionner un client/i)).toBeVisible()
    })

    test.skip('should filter invoices by status', async ({ page }) => {
      // Click "Brouillons" filter
      await page.getByRole('button', { name: /brouillons/i }).click()
      
      // Should show only draft invoices
      await expect(page.getByText(/brouillon/i).first()).toBeVisible()
    })

    test.skip('should create invoice with client and activities', async ({ page }) => {
      await page.goto('/invoices/new')
      
      // Select client
      await page.getByRole('combobox', { name: /choisir un client/i }).click()
      await page.getByRole('option').first().click()
      
      // Wait for activities to load
      await page.waitForTimeout(500)
      
      // Select first activity
      const firstActivity = page.locator('[type="checkbox"]').first()
      await firstActivity.check()
      
      // Add notes
      await page.getByPlaceholder(/notes additionnelles/i).fill('Test invoice notes')
      
      // Submit
      await page.getByRole('button', { name: /créer la facture/i }).click()
      
      // Should redirect to invoices list with success message
      await expect(page).toHaveURL('/invoices')
      await expect(page.getByText(/facture créée/i)).toBeVisible()
    })

    test.skip('should apply discount to invoice', async ({ page }) => {
      await page.goto('/invoices/new')
      
      // Select client and activity
      await page.getByRole('combobox', { name: /choisir un client/i }).click()
      await page.getByRole('option').first().click()
      await page.waitForTimeout(500)
      await page.locator('[type="checkbox"]').first().check()
      
      // Get original total
      const totalBefore = await page
        .getByText(/total/i)
        .locator('..') 
        .getByText(/€/)
        .textContent()
      
      // Apply discount
      await page.getByLabel(/remise/i).fill('10')
      
      // Total should be different
      const totalAfter = await page
        .getByText(/total/i)
        .locator('..')
        .getByText(/€/)
        .textContent()
      
      expect(totalBefore).not.toBe(totalAfter)
    })

    test.skip('should view invoice details', async ({ page }) => {
      // Click on first invoice
      await page.locator('tbody tr').first().click()
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/)
      
      // Should show invoice details
      await expect(page.getByText(/informations client/i)).toBeVisible()
      await expect(page.getByText(/détails de la facture/i)).toBeVisible()
    })

    test.skip('should download invoice PDF', async ({ page }) => {
      // Navigate to invoice detail
      await page.locator('tbody tr').first().click()
      
      // Setup download listener
      const downloadPromise = page.waitForEvent('download')
      
      // Click download button
      await page.getByRole('button', { name: /télécharger pdf/i }).click()
      
      // Wait for download
      const download = await downloadPromise
      
      // Verify filename
      expect(download.suggestedFilename()).toMatch(/Facture_.*\.pdf/)
    })

    test.skip('should mark invoice as paid', async ({ page }) => {
      // Navigate to invoice with "en attente" status
      await page.locator('tbody tr', { hasText: /en attente/i }).first().click()
      
      // Click mark as paid
      await page.getByRole('button', { name: /marquer comme payée/i }).click()
      
      // Should show success and update status
      await expect(page.getByText(/facture marquée comme payée/i)).toBeVisible()
      await expect(page.getByText(/payée/i)).toBeVisible()
    })

    test.skip('should delete draft invoice', async ({ page }) => {
      // Navigate to draft invoice
      await page.locator('tbody tr', { hasText: /brouillon/i }).first().click()
      
      // Click delete
      await page.getByRole('button', { name: /supprimer/i }).click()
      
      // Confirm deletion
      await page.getByRole('button', { name: /supprimer/i }).last().click()
      
      // Should redirect back to list
      await expect(page).toHaveURL('/invoices')
      await expect(page.getByText(/facture supprimée/i)).toBeVisible()
    })

    test.skip('should not allow deleting paid invoice', async ({ page }) => {
      // Navigate to paid invoice
      await page.locator('tbody tr', { hasText: /payée/i }).first().click()
      
      // Delete button should not be visible
      await expect(
        page.getByRole('button', { name: /supprimer/i })
      ).not.toBeVisible()
    })
  })
})
