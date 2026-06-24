import { describe, it, expect } from 'vitest';
import { walletBalance, monthlyCardTotals, remainingDays, dailyAllowance, spentToday, buildSummary } from './calc';
import type { Fund, Transaction } from './types';

describe('walletBalance', () => {
	it('subtracts expenses from funds', () => {
		const funds: Fund[] = [{ date: '2026-01-01', amount: 10000 }, { date: '2026-01-15', amount: 5000 }];
		const txns: Transaction[] = [{ date: '2026-01-02', detail: 'lunch', amount: 200, method: 'cash' }];
		expect(walletBalance(funds, txns)).toBe(14800);
	});

	it('returns 0 with no data', () => {
		expect(walletBalance([], [])).toBe(0);
	});
});

describe('monthlyCardTotals', () => {
	it('groups by bank for current month, ignores cash', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-01', detail: 'a', amount: 100, method: 'CTBC' },
			{ date: '2026-06-15', detail: 'b', amount: 200, method: 'CTBC' },
			{ date: '2026-06-10', detail: 'c', amount: 50, method: 'E.SUN' },
			{ date: '2026-06-05', detail: 'd', amount: 300, method: 'cash' },
			{ date: '2026-05-01', detail: 'e', amount: 999, method: 'CTBC' },
		];
		const result = monthlyCardTotals(txns, '2026-06-20');
		expect(result).toEqual({ CTBC: 300, 'E.SUN': 50 });
	});

	it('returns empty for no card txns', () => {
		expect(monthlyCardTotals([], '2026-06-01')).toEqual({});
	});
});

describe('remainingDays', () => {
	it('same day = 1 (inclusive)', () => {
		expect(remainingDays('2026-06-24', '2026-06-24')).toBe(1);
	});

	it('tomorrow = 2 (inclusive)', () => {
		expect(remainingDays('2026-06-24', '2026-06-25')).toBe(2);
	});

	it('past target = 0', () => {
		expect(remainingDays('2026-06-24', '2026-06-20')).toBe(0);
	});
});

describe('dailyAllowance', () => {
	it('divides balance by days', () => {
		expect(dailyAllowance(10000, 10)).toBe(1000);
	});

	it('returns 0 when days <= 0', () => {
		expect(dailyAllowance(10000, 0)).toBe(0);
		expect(dailyAllowance(10000, -1)).toBe(0);
	});
});

describe('spentToday', () => {
	it('sums only today transactions', () => {
		const txns: Transaction[] = [
			{ date: '2026-06-24', detail: 'a', amount: 100, method: 'cash' },
			{ date: '2026-06-24', detail: 'b', amount: 250, method: 'CTBC' },
			{ date: '2026-06-23', detail: 'c', amount: 999, method: 'cash' },
		];
		expect(spentToday(txns, '2026-06-24')).toBe(350);
	});

	it('returns 0 with no today transactions', () => {
		expect(spentToday([], '2026-06-24')).toBe(0);
	});
});

describe('buildSummary', () => {
	it('computes full summary', () => {
		const funds: Fund[] = [{ date: '2026-06-01', amount: 30000 }];
		const txns: Transaction[] = [
			{ date: '2026-06-10', detail: 'dinner', amount: 500, method: 'CTBC' },
			{ date: '2026-06-15', detail: 'groceries', amount: 1000, method: 'cash' },
		];
		const s = buildSummary(funds, txns, '2026-06-30', '2026-06-24');
		expect(s.balance).toBe(28500);
		expect(s.cardTotals).toEqual({ CTBC: 500 });
		expect(s.remainingDays).toBe(7);
		expect(s.dailyAllowance).toBeCloseTo(28500 / 7);
	});

	it('handles no target date', () => {
		const s = buildSummary([], [], null, '2026-06-24');
		expect(s.remainingDays).toBe(0);
		expect(s.dailyAllowance).toBe(0);
	});
});
