import { describe, it, expect } from 'vitest'
import {
	walletBalance,
	cardTotals,
	remainingDays,
	dailyAllowance,
	spentToday,
	topTransactionDetails,
	monthlyCumulativeSpend,
	weeklyCumulativeSpend,
	groupTransactionsByDay,
	formatHistoryDayLabel,
	formatHistoryTransactionLine,
	serializeHistoryDayText,
	buildSummary
} from './calc'
import type { Fund, Transaction } from './types'

describe('walletBalance', () => {
	it('subtracts expenses from funds', () => {
		const funds: Fund[] = [
			{ date: '2026-01-01', amount: 10000 },
			{ date: '2026-01-15', amount: 5000 }
		]
		const txns: Transaction[] = [
			{ date: '2026-01-02', detail: 'lunch', amount: 200, method: 'cash' }
		]
		expect(walletBalance(funds, txns)).toBe(14800)
	})

	it('returns 0 with no data', () => {
		expect(walletBalance([], [])).toBe(0)
	})
})

describe('cardTotals', () => {
	it('groups by bank across all time, ignores cash', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: 'a', amount: 100, method: 'CTBC' },
			{ date: '2026-06-15', detail: 'b', amount: 200, method: 'CTBC' },
			{ date: '2026-06-10', detail: 'c', amount: 50, method: 'E.SUN' },
			{ date: '2026-06-05', detail: 'd', amount: 300, method: 'cash' },
			{ date: '2026-05-01', detail: 'e', amount: 999, method: 'CTBC' }
		]
		const result = cardTotals(txns)
		expect(result).toEqual({ CTBC: 1299, 'E.SUN': 50 })
	})

	it('returns empty for no card txns', () => {
		expect(cardTotals([])).toEqual({})
	})
})

describe('remainingDays', () => {
	it('same day = 1 (inclusive)', () => {
		expect(remainingDays('2026-06-24', '2026-06-24')).toBe(1)
	})

	it('tomorrow = 2 (inclusive)', () => {
		expect(remainingDays('2026-06-24', '2026-06-25')).toBe(2)
	})

	it('past target = 0', () => {
		expect(remainingDays('2026-06-24', '2026-06-20')).toBe(0)
	})
})

describe('dailyAllowance', () => {
	it('divides balance by days', () => {
		expect(dailyAllowance(10000, 10)).toBe(1000)
	})

	it('returns 0 when days <= 0', () => {
		expect(dailyAllowance(10000, 0)).toBe(0)
		expect(dailyAllowance(10000, -1)).toBe(0)
	})
})

describe('spentToday', () => {
	it('sums only today transactions', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-24', detail: 'a', amount: 100, method: 'cash' },
			{ date: '2026-06-24', detail: 'b', amount: 250, method: 'CTBC' },
			{ date: '2026-06-23', detail: 'c', amount: 999, method: 'cash' }
		]
		expect(spentToday(txns, '2026-06-24')).toBe(350)
	})

	it('returns 0 with no today transactions', () => {
		expect(spentToday([], '2026-06-24')).toBe(0)
	})
})

describe('topTransactionDetails', () => {
	it('aggregates count and total amount by detail', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: '午餐', amount: 100, method: 'cash' },
			{ date: '2026-06-02', detail: '午餐', amount: 150, method: 'CTBC' },
			{ date: '2026-06-03', detail: '晚餐', amount: 220, method: 'cash' }
		]

		expect(topTransactionDetails(txns)).toEqual([
			{ detail: '午餐', count: 2, totalAmount: 250 },
			{ detail: '晚餐', count: 1, totalAmount: 220 }
		])
	})

	it('returns only the top five details by total amount', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: 'A', amount: 10, method: 'cash' },
			{ date: '2026-06-01', detail: 'B', amount: 20, method: 'cash' },
			{ date: '2026-06-01', detail: 'C', amount: 30, method: 'cash' },
			{ date: '2026-06-01', detail: 'D', amount: 40, method: 'cash' },
			{ date: '2026-06-01', detail: 'E', amount: 50, method: 'cash' },
			{ date: '2026-06-01', detail: 'F', amount: 60, method: 'cash' }
		]

		expect(topTransactionDetails(txns)).toEqual([
			{ detail: 'F', count: 1, totalAmount: 60 },
			{ detail: 'E', count: 1, totalAmount: 50 },
			{ detail: 'D', count: 1, totalAmount: 40 },
			{ detail: 'C', count: 1, totalAmount: 30 },
			{ detail: 'B', count: 1, totalAmount: 20 }
		])
	})

	it('uses count and detail name as deterministic tie breakers', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: '晚餐', amount: 100, method: 'cash' },
			{ date: '2026-06-02', detail: '早餐', amount: 60, method: 'cash' },
			{ date: '2026-06-03', detail: '早餐', amount: 40, method: 'cash' },
			{ date: '2026-06-04', detail: '午餐', amount: 100, method: 'cash' }
		]

		expect(topTransactionDetails(txns)).toEqual([
			{ detail: '早餐', count: 2, totalAmount: 100 },
			{ detail: '午餐', count: 1, totalAmount: 100 },
			{ detail: '晚餐', count: 1, totalAmount: 100 }
		])
	})

	it('returns empty for no transactions', () => {
		expect(topTransactionDetails([])).toEqual([])
	})
})

describe('monthlyCumulativeSpend', () => {
	it('accumulates day-by-day spend for the current month up to today', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: 'a', amount: 100, method: 'cash' },
			{ date: '2026-06-03', detail: 'b', amount: 50, method: 'cash' },
			{ date: '2026-06-03', detail: 'c', amount: 20, method: 'cash' },
			{ date: '2026-05-31', detail: 'd', amount: 999, method: 'cash' },
			{ date: '2026-06-10', detail: 'e', amount: 999, method: 'cash' }
		]
		expect(monthlyCumulativeSpend(txns, '2026-06-03')).toEqual([
			{ label: '1', cumulative: 100 },
			{ label: '2', cumulative: 100 },
			{ label: '3', cumulative: 170 }
		])
	})

	it('returns 0 cumulative points with no matching transactions', () => {
		expect(monthlyCumulativeSpend([], '2026-06-03')).toEqual([
			{ label: '1', cumulative: 0 },
			{ label: '2', cumulative: 0 },
			{ label: '3', cumulative: 0 }
		])
	})
})

describe('weeklyCumulativeSpend', () => {
	it('accumulates day-by-day spend from Sunday up to today', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-21', detail: 'a', amount: 100, method: 'cash' },
			{ date: '2026-06-23', detail: 'b', amount: 40, method: 'cash' },
			{ date: '2026-06-24', detail: 'c', amount: 10, method: 'cash' },
			{ date: '2026-06-20', detail: 'd', amount: 999, method: 'cash' },
			{ date: '2026-06-27', detail: 'e', amount: 999, method: 'cash' }
		]
		expect(weeklyCumulativeSpend(txns, '2026-06-24')).toEqual([
			{ label: '日', cumulative: 100 },
			{ label: '一', cumulative: 100 },
			{ label: '二', cumulative: 140 },
			{ label: '三', cumulative: 150 }
		])
	})

	it('returns a single 0 point when today is Sunday', () => {
		expect(weeklyCumulativeSpend([], '2026-06-21')).toEqual([{ label: '日', cumulative: 0 }])
	})
})

describe('buildSummary', () => {
	it('computes full summary', () => {
		const funds: Fund[] = [{ date: '2026-06-01', amount: 30000 }]
		const txns: Transaction[] = [
			{ date: '2026-06-10', detail: 'dinner', amount: 500, method: 'CTBC' },
			{ date: '2026-06-12', detail: 'dinner', amount: 300, method: 'cash' },
			{ date: '2026-06-15', detail: 'groceries', amount: 1000, method: 'cash' }
		]
		const s = buildSummary(funds, txns, '2026-06-30', '2026-06-24')
		expect(s.balance).toBe(28200)
		expect(s.cardTotals).toEqual({ CTBC: 500 })
		expect(s.topDetails).toEqual([
			{ detail: 'groceries', count: 1, totalAmount: 1000 },
			{ detail: 'dinner', count: 2, totalAmount: 800 }
		])
		expect(s.remainingDays).toBe(7)
		expect(s.dailyAllowance).toBeCloseTo(28200 / 7)
	})

	it('handles no target date', () => {
		const s = buildSummary([], [], null, '2026-06-24')
		expect(s.topDetails).toEqual([])
		expect(s.remainingDays).toBe(0)
		expect(s.dailyAllowance).toBe(0)
	})
})

describe('history copy helpers', () => {
	it('formats a day label as month/day', () => {
		expect(formatHistoryDayLabel('2026-10-02')).toBe('10/2')
	})

	it('omits cash label but keeps non-cash method labels', () => {
		expect(
			formatHistoryTransactionLine({
				date: '2026-10-02',
				detail: '早餐',
				amount: 80,
				method: 'cash'
			})
		).toBe('早餐 80')

		expect(
			formatHistoryTransactionLine({
				date: '2026-10-02',
				detail: '加油',
				amount: 500,
				method: 'CTBC'
			})
		).toBe('加油 500 中信')
	})

	it('groups consecutive transactions by day while preserving order', () => {
		const txns: Transaction[] = [
			{ date: '2026-10-02', detail: '加油', amount: 500, method: 'CTBC' },
			{ date: '2026-10-02', detail: '午餐', amount: 100, method: 'cash' },
			{ date: '2026-10-02', detail: '早餐', amount: 80, method: 'cash' },
			{ date: '2026-10-01', detail: '晚餐', amount: 120, method: 'E.SUN' }
		]

		expect(groupTransactionsByDay(txns)).toEqual([
			{
				date: '2026-10-02',
				transactions: txns.slice(0, 3)
			},
			{
				date: '2026-10-01',
				transactions: [txns[3]]
			}
		])
	})

	it('serializes a day block into chat-friendly text', () => {
		const txns: Transaction[] = [
			{ date: '2026-10-02', detail: '加油', amount: 500, method: 'CTBC' },
			{ date: '2026-10-02', detail: '午餐', amount: 100, method: 'cash' },
			{ date: '2026-10-02', detail: '早餐', amount: 80, method: 'cash' }
		]

		expect(serializeHistoryDayText('2026-10-02', txns)).toBe(
			'10/2\n加油 500 中信\n午餐 100\n早餐 80'
		)
	})
})
