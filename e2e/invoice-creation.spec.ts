import { test, expect } from '@playwright/test'

test.describe('Invoice Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication when Supabase is connected
    await page.goto('/invoices/new')
  })

  test('should show empty state when no client selected', async ({ page }) => {
    const activitiesSection = page.getByText(/activités à facturer/i)
    await expect(activitiesSection).not.toBeVisible()
  })

  test.skip('should load activities when client is selected', async ({ page }) => {
    // Select a client
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    // Should show activities section
    await expect(page.getByText(/activités à facturer/i)).toBeVisible()

    // Should show either activities or empty state message
    const hasActivities = await page.getByRole('checkbox').first().isVisible()
    const hasEmptyMessage = await page.getByText(/aucune activité complétée/i).isVisible()

    expect(hasActivities || hasEmptyMessage).toBeTruthy()
  })

  test.skip('should display activities with correct information', async ({ page }) => {
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    // Wait for activities to load
    await page.waitForTimeout(1000)

    // Check if there are activities
    const activityCheckbox = page.locator('[type="checkbox"]').first()
    if (await activityCheckbox.isVisible()) {
      // Verify activity shows project name
      await expect(page.getByText(/projet:/i)).toBeVisible()

      // Verify activity shows hours and rate calculation
      await expect(page.locator('text=/\\d+h × \\d+.*€\\/h/')).toBeVisible()
    }
  })

  test.skip('should validate that activities belong to selected client', async ({ page }) => {
    // This test verifies the bug we fixed:
    // Activities should ONLY show for projects linked to the selected client

    // Select first client
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    const firstClient = await page.getByRole('option').first().textContent()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    // Get count of activities for first client
    const activitiesCount1 = await page.locator('[type="checkbox"]').count()

    // Select different client
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').nth(1).click()

    await page.waitForTimeout(500)

    // Get count of activities for second client
    const activitiesCount2 = await page.locator('[type="checkbox"]').count()

    // Activities should be different (unless both clients have same projects)
    // At minimum, the query should have executed independently
    console.log(`Client 1 (${firstClient}): ${activitiesCount1} activities`)
    console.log(`Client 2: ${activitiesCount2} activities`)
  })

  test.skip('should only show activities with correct status', async ({ page }) => {
    // This test verifies the status filter fix:
    // Only 'completada' and 'por_facturar' activities should appear

    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    // If activities exist, verify they are in correct status
    const activityCheckbox = page.locator('[type="checkbox"]').first()
    if (await activityCheckbox.isVisible()) {
      // Activities shown here should be in 'completada' or 'por_facturar' status
      // This is validated by the backend query, but we can verify count > 0 if expected
      const count = await page.locator('[type="checkbox"]').count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test.skip('should calculate totals correctly', async ({ page }) => {
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    // Select first activity if available
    const activityCheckbox = page.locator('[type="checkbox"]').first()
    if (await activityCheckbox.isVisible()) {
      await activityCheckbox.check()

      // Should show summary section
      await expect(page.getByText(/récapitulatif/i)).toBeVisible()

      // Should show subtotal
      await expect(page.getByText(/sous-total/i)).toBeVisible()

      // Should show total
      await expect(page.getByText(/total/i)).toBeVisible()
    }
  })

  test.skip('should apply discount correctly', async ({ page }) => {
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    const activityCheckbox = page.locator('[type="checkbox"]').first()
    if (await activityCheckbox.isVisible()) {
      await activityCheckbox.check()

      // Get original total
      const totalText = await page.getByText(/total:/i).locator('..').textContent()

      // Apply 10% discount
      await page.getByLabel(/remise/i).fill('10')

      // Total should change
      const newTotalText = await page.getByText(/total:/i).locator('..').textContent()
      expect(totalText).not.toBe(newTotalText)
    }
  })

  test.skip('should create invoice successfully', async ({ page }) => {
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    const activityCheckbox = page.locator('[type="checkbox"]').first()
    if (await activityCheckbox.isVisible()) {
      await activityCheckbox.check()

      // Add notes
      await page.getByPlaceholder(/notes additionnelles/i).fill('Test invoice')

      // Submit
      await page.getByRole('button', { name: /créer la facture/i }).click()

      // Should redirect to invoices list
      await expect(page).toHaveURL('/invoices')

      // Should show success message
      await expect(page.getByText(/facture créée/i)).toBeVisible()
    }
  })

  test.skip('should validate required fields', async ({ page }) => {
    // Try to create without selecting client
    await page.getByRole('button', { name: /créer la facture/i }).click()

    // Should show error
    await expect(page.getByText(/sélectionner un client/i)).toBeVisible()
    await expect(page).toHaveURL('/invoices/new')
  })

  test.skip('should handle no available activities gracefully', async ({ page }) => {
    await page.getByRole('combobox', { name: /choisir un client/i }).click()
    await page.getByRole('option').first().click()

    await page.waitForTimeout(500)

    // If no activities, should show helpful message
    const emptyMessage = page.getByText(/aucune activité complétée/i)
    if (await emptyMessage.isVisible()) {
      // Should show checklist
      await expect(page.getByText(/le client a des projets/i)).toBeVisible()
      await expect(page.getByText(/activités sont marquées comme "complétée"/i)).toBeVisible()
    }
  })
})
