export const BANKS = ['CTBC', 'E.SUN', 'Taishin', 'Fubon', 'DBS'] as const;
export type Bank = (typeof BANKS)[number];
export type PaymentMethod = 'cash' | Bank;

export interface Fund {
	id?: number;
	date: string;
	amount: number;
}

export interface Transaction {
	id?: number;
	date: string;
	detail: string;
	amount: number;
	method: PaymentMethod;
}

export interface Settings {
	key: string;
	value: string;
}

export interface Summary {
	balance: number;
	cardTotals: Partial<Record<Bank, number>>;
	remainingDays: number;
	dailyAllowance: number;
}
