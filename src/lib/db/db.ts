import Dexie, { type EntityTable } from 'dexie'
import type { Fund, Transaction, Settings } from '$lib/domain/types'

export const db = new Dexie('my-money') as Dexie & {
	funds: EntityTable<Fund, 'id'>
	transactions: EntityTable<Transaction, 'id'>
	settings: EntityTable<Settings, 'key'>
}

db.version(1).stores({
	funds: '++id, date',
	transactions: '++id, date, method',
	settings: 'key'
})
