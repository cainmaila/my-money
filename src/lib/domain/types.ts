export const BANKS = ['CTBC', 'E.SUN', 'Taishin', 'Fubon', 'DBS'] as const
export type Bank = (typeof BANKS)[number]
export type PaymentMethod = 'cash' | Bank

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
	cash: '現金',
	CTBC: '中信',
	'E.SUN': '玉山',
	Taishin: '台新',
	Fubon: '富邦',
	DBS: '星展'
}

export const PAYMENT_ICON: Record<PaymentMethod, 'cash' | 'card'> = {
	cash: 'cash',
	CTBC: 'card',
	'E.SUN': 'card',
	Taishin: 'card',
	Fubon: 'card',
	DBS: 'card'
}

export interface Fund {
	id?: number
	date: string
	amount: number
}

export interface Transaction {
	id?: number
	date: string
	detail: string
	amount: number
	method: PaymentMethod
}

export interface DetailSummary {
	detail: string
	count: number
	totalAmount: number
}

export interface Settings {
	key: string
	value: string
}

export interface Summary {
	balance: number
	cardTotals: Partial<Record<Bank, number>>
	topDetails: DetailSummary[]
	remainingDays: number
	dailyAllowance: number
	spentToday: number
}
