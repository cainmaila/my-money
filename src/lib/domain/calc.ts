import {
	PAYMENT_LABELS,
	type Bank,
	type CumulativePoint,
	type DetailSummary,
	type Fund,
	type Summary,
	type Transaction
} from './types'

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function toDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function walletBalance(funds: Fund[], txns: Transaction[]): number {
	const totalFunds = funds.reduce((s, f) => s + f.amount, 0)
	const totalSpent = txns.reduce((s, t) => s + t.amount, 0)
	return totalFunds - totalSpent
}

export function cardTotals(txns: Transaction[]): Partial<Record<Bank, number>> {
	const result: Partial<Record<Bank, number>> = {}
	for (const t of txns) {
		if (t.method === 'cash') continue
		result[t.method] = (result[t.method] ?? 0) + t.amount
	}
	return result
}

export function remainingDays(today: string, target: string): number {
	const t = new Date(today + 'T00:00:00')
	const d = new Date(target + 'T00:00:00')
	const diff = Math.floor((d.getTime() - t.getTime()) / 86_400_000) + 1
	return Math.max(diff, 0)
}

export function dailyAllowance(balance: number, days: number): number {
	if (days <= 0) return 0
	return balance / days
}

export function spentToday(txns: Transaction[], today: string): number {
	return txns.reduce((s, t) => (t.date === today ? s + t.amount : s), 0)
}

export function topTransactionDetails(txns: Transaction[], limit = 5): DetailSummary[] {
	return Object.values(
		txns.reduce<Record<string, DetailSummary>>((groups, { detail, amount }) => {
			const entry = groups[detail]
			if (entry) {
				entry.count += 1
				entry.totalAmount += amount
			} else {
				groups[detail] = { detail, count: 1, totalAmount: amount }
			}
			return groups
		}, {})
	)
		.sort(
			(left, right) =>
				right.totalAmount - left.totalAmount ||
				right.count - left.count ||
				left.detail.localeCompare(right.detail)
		)
		.slice(0, limit)
}

export function monthlyCumulativeSpend(txns: Transaction[], today: string): CumulativePoint[] {
	const monthPrefix = today.slice(0, 7)
	const todayDay = Number(today.slice(8, 10))
	const dailyTotals = new Map<string, number>()
	for (const t of txns) {
		if (!t.date.startsWith(monthPrefix)) continue
		dailyTotals.set(t.date, (dailyTotals.get(t.date) ?? 0) + t.amount)
	}

	const points: CumulativePoint[] = []
	let cumulative = 0
	for (let day = 1; day <= todayDay; day++) {
		const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`
		cumulative += dailyTotals.get(dateStr) ?? 0
		points.push({ label: String(day), cumulative })
	}
	return points
}

export function weeklyCumulativeSpend(txns: Transaction[], today: string): CumulativePoint[] {
	const dailyTotals = new Map<string, number>()
	for (const t of txns) {
		dailyTotals.set(t.date, (dailyTotals.get(t.date) ?? 0) + t.amount)
	}

	const todayDate = new Date(today + 'T00:00:00')
	const dow = todayDate.getDay()
	const sunday = new Date(todayDate)
	sunday.setDate(todayDate.getDate() - dow)

	const points: CumulativePoint[] = []
	let cumulative = 0
	for (let i = 0; i <= dow; i++) {
		const d = new Date(sunday)
		d.setDate(sunday.getDate() + i)
		cumulative += dailyTotals.get(toDateStr(d)) ?? 0
		points.push({ label: WEEKDAY_LABELS[i], cumulative })
	}
	return points
}

export function groupTransactionsByDay(
	txns: Transaction[]
): { date: string; transactions: Transaction[] }[] {
	const groups: { date: string; transactions: Transaction[] }[] = []

	for (const txn of txns) {
		const lastGroup = groups.at(-1)
		if (lastGroup?.date === txn.date) {
			lastGroup.transactions.push(txn)
			continue
		}

		groups.push({
			date: txn.date,
			transactions: [txn]
		})
	}

	return groups
}

export function formatHistoryDayLabel(date: string): string {
	const [, month, day] = date.split('-')
	return `${Number(month)}/${Number(day)}`
}

export function formatHistoryTransactionLine(txn: Transaction): string {
	const methodLabel = txn.method === 'cash' ? '' : ` ${PAYMENT_LABELS[txn.method]}`
	return `${txn.detail} ${txn.amount.toLocaleString()}${methodLabel}`
}

export function serializeHistoryDayText(date: string, txns: Transaction[]): string {
	return [formatHistoryDayLabel(date), ...txns.map(formatHistoryTransactionLine)].join('\n')
}

export function buildSummary(
	funds: Fund[],
	txns: Transaction[],
	targetDate: string | null,
	today: string
): Summary {
	const balance = walletBalance(funds, txns)
	const days = targetDate ? remainingDays(today, targetDate) : 0
	return {
		balance,
		cardTotals: cardTotals(txns),
		topDetails: topTransactionDetails(txns),
		remainingDays: days,
		dailyAllowance: dailyAllowance(balance, days),
		spentToday: spentToday(txns, today)
	}
}
