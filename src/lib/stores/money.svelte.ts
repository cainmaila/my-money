import { liveQuery } from 'dexie'
import { db } from '$lib/db/db'
import { buildSummary } from '$lib/domain/calc'
import type { Fund, Transaction, Summary } from '$lib/domain/types'

let funds = $state<Fund[]>([])
let transactions = $state<Transaction[]>([])
let targetDate = $state<string | null>(null)

function today(): string {
	return new Date().toISOString().slice(0, 10)
}

const summary = $derived<Summary>(buildSummary(funds, transactions, targetDate, today()))

liveQuery(() => db.funds.toArray()).subscribe((v) => (funds = v))
liveQuery(() => db.transactions.orderBy('date').reverse().toArray()).subscribe(
	(v) => (transactions = v)
)
liveQuery(() => db.settings.get('targetDate')).subscribe((v) => (targetDate = v?.value ?? null))

export function getState() {
	return {
		get funds() {
			return funds
		},
		get transactions() {
			return transactions
		},
		get targetDate() {
			return targetDate
		},
		get summary() {
			return summary
		},
		get today() {
			return today()
		}
	}
}
