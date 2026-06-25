import { expect, test } from '@playwright/test'

async function seedWalletData(page: import('@playwright/test').Page) {
	await page.goto('/')
	await page.waitForFunction(async () => {
		const registration = await navigator.serviceWorker.getRegistration()
		return registration?.active != null
	})
	await page.reload({ waitUntil: 'domcontentloaded' })
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
	await page.evaluate(async () => {
		await new Promise<void>((resolve, reject) => {
			const request = indexedDB.open('my-money')

			request.onerror = () => reject(request.error)
			request.onsuccess = () => {
				const db = request.result
				const tx = db.transaction(['funds', 'transactions', 'settings'], 'readwrite')

				tx.objectStore('funds').add({ date: '2026-06-25', amount: 5000 })
				tx.objectStore('transactions').add({
					date: '2026-06-25',
					detail: '午餐',
					amount: 200,
					method: 'cash'
				})
				tx.objectStore('settings').put({ key: 'targetDate', value: '2099-12-31' })

				tx.oncomplete = () => {
					db.close()
					resolve()
				}
				tx.onerror = () => reject(tx.error)
				tx.onabort = () => reject(tx.error)
			}
		})
	})
	await page.reload()
}

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

test('clear wallet requires confirmation and resets all data', async ({ page }) => {
	await seedWalletData(page)
	await page.goto('/setup')

	await expect(page.getByText('目前餘額：').locator('..')).toContainText('$4,800')
	await expect(page.getByText('目前：2099-12-31')).toBeVisible()

	await page.goto('/history')
	await expect(page.getByText('午餐')).toBeVisible()

	await page.goto('/setup')
	await page.getByRole('button', { name: '清空錢包' }).click()
	await expect(page.getByText('再次確認要重置錢包？')).toBeVisible()
	await page.getByRole('button', { name: '取消' }).click()
	await expect(page.getByText('再次確認要重置錢包？')).not.toBeVisible()

	await page.goto('/history')
	await expect(page.getByText('午餐')).toBeVisible()

	await page.goto('/setup')
	await page.getByRole('button', { name: '清空錢包' }).click()
	await page.getByRole('button', { name: '確認清空' }).click()
	await expect(page.getByText('設定目標日期後，即可計算每日預算')).toBeVisible()
	await expect(page.getByText('目前餘額：').locator('..')).toContainText('$0')

	await page.goto('/')
	await expect(page.getByText('設定目標日期', { exact: true })).toBeVisible()
	await expect(page.getByText('$0', { exact: true })).toBeVisible()

	await page.goto('/history')
	await expect(page.getByText('還沒有紀錄，去記第一筆吧')).toBeVisible()
})
