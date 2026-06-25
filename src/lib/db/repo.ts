import { db } from './db'
import type { Transaction } from '$lib/domain/types'

export async function addFund(amount: number): Promise<number> {
	return (await db.funds.add({ date: new Date().toISOString().slice(0, 10), amount })) as number
}

export async function addTransaction(txn: Omit<Transaction, 'id'>): Promise<number> {
	return (await db.transactions.add(txn)) as number
}

export async function updateTransaction(
	id: number,
	changes: Partial<Omit<Transaction, 'id'>>
): Promise<number> {
	return db.transactions.update(id, changes)
}

export async function setTargetDate(date: string): Promise<void> {
	await db.settings.put({ key: 'targetDate', value: date })
}

export async function clearWallet(): Promise<void> {
	await db.transaction('rw', db.funds, db.transactions, db.settings, async () => {
		await db.funds.clear()
		await db.transactions.clear()
		await db.settings.delete('targetDate')
	})
}
