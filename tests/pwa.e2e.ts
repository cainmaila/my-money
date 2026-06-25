import { expect, test } from '@playwright/test'

test('app shell stays usable offline after first load', async ({ page, context }) => {
	await context.setOffline(false)

	await page.goto('/')

	await expect(page.getByText('我的錢包').first()).toBeVisible()
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		'href',
		/manifest\.webmanifest$/
	)

	await page.waitForFunction(async () => {
		const registration = await navigator.serviceWorker.getRegistration()
		return registration?.active != null
	})

	await page.reload({ waitUntil: 'domcontentloaded' })
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

	await context.setOffline(true)
	await page.reload({ waitUntil: 'domcontentloaded' })

	await expect(page.getByText('我的錢包').first()).toBeVisible()
	await expect(page.getByRole('link', { name: '記帳' })).toBeVisible()

	await context.setOffline(false)
})
