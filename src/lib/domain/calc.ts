import {
	PAYMENT_LABELS,
	type Bank,
	type DetailSummary,
	type Fund,
	type PeriodTotal,
	type Summary,
	type Transaction
} from './types'

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

export function monthlyTotals(txns: Transaction[], today: string, months = 6): PeriodTotal[] {
	const [todayYear, todayMonth] = today.split('-').map(Number)
	const totals = new Map<string, number>()
	for (const t of txns) {
		const key = t.date.slice(0, 7)
		totals.set(key, (totals.get(key) ?? 0) + t.amount)
	}

	const points: PeriodTotal[] = []
	for (let i = months - 1; i >= 0; i--) {
		const d = new Date(todayYear, todayMonth - 1 - i, 1)
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
		points.push({ label: `${d.getMonth() + 1}月`, total: totals.get(key) ?? 0 })
	}
	return points
}

export function weeklyTotals(txns: Transaction[], today: string, weeks = 6): PeriodTotal[] {
	const dailyTotals = new Map<string, number>()
	for (const t of txns) {
		dailyTotals.set(t.date, (dailyTotals.get(t.date) ?? 0) + t.amount)
	}

	const todayDate = new Date(today + 'T00:00:00')
	const thisSunday = new Date(todayDate)
	thisSunday.setDate(todayDate.getDate() - todayDate.getDay())

	const points: PeriodTotal[] = []
	for (let w = weeks - 1; w >= 0; w--) {
		const sunday = new Date(thisSunday)
		sunday.setDate(thisSunday.getDate() - w * 7)
		let total = 0
		for (let i = 0; i < 7; i++) {
			const d = new Date(sunday)
			d.setDate(sunday.getDate() + i)
			total += dailyTotals.get(toDateStr(d)) ?? 0
		}
		points.push({ label: `${sunday.getMonth() + 1}/${sunday.getDate()}`, total })
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
