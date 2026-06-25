<script lang="ts">
	import { getState } from '$lib/stores/money.svelte'
	import { updateTransaction } from '$lib/db/repo'
	import {
		formatHistoryDayLabel,
		groupTransactionsByDay,
		serializeHistoryDayText
	} from '$lib/domain/calc'
	import { BANKS, PAYMENT_LABELS, type PaymentMethod, type Transaction } from '$lib/domain/types'

	const money = getState()
	let editingId: number | null = $state(null)
	let editDate = $state('')
	let editDetail = $state('')
	let editAmount = $state('')
	let editMethod: PaymentMethod = $state('cash')
	let copiedDate = $state<string | null>(null)
	let copiedResetTimer: ReturnType<typeof setTimeout> | null = null

	const transactionGroups = $derived(groupTransactionsByDay(money.transactions))

	const methods: PaymentMethod[] = ['cash', ...BANKS]

	function startEdit(txn: Transaction) {
		editingId = txn.id ?? null
		editDate = txn.date
		editDetail = txn.detail
		editAmount = String(txn.amount)
		editMethod = txn.method
	}

	function cancelEdit() {
		editingId = null
	}

	async function saveEdit() {
		if (editingId == null) return
		const n = Number(editAmount)
		if (!n || n <= 0 || !editDetail.trim()) return
		await updateTransaction(editingId, {
			date: editDate,
			detail: editDetail.trim(),
			amount: n,
			method: editMethod
		})
		editingId = null
	}

	async function copyDayText(date: string, txns: Transaction[]) {
		if (!navigator.clipboard?.writeText) return
		await navigator.clipboard.writeText(serializeHistoryDayText(date, txns))
		copiedDate = date
		if (copiedResetTimer) clearTimeout(copiedResetTimer)
		copiedResetTimer = setTimeout(() => {
			copiedDate = null
			copiedResetTimer = null
		}, 1500)
	}
</script>

<h2 class="mb-4 text-xl font-bold">紀錄</h2>

{#if money.transactions.length === 0}
	<div class="card surface-card text-center">
		<p style="color:var(--color-ink-soft)">還沒有紀錄，去記第一筆吧</p>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each transactionGroups as group (group.date)}
			<div class="card surface-card flex flex-col gap-2">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-sm font-semibold">{formatHistoryDayLabel(group.date)}</p>
						<p class="text-xs" style="color:var(--color-ink-soft)">
							{group.transactions.length} 筆
						</p>
					</div>
					<button
						type="button"
						class="btn preset-outlined-surface-200-800"
						onclick={() => copyDayText(group.date, group.transactions)}
					>
						{copiedDate === group.date ? '已複製' : '複製文字'}
					</button>
				</div>

				<div class="flex flex-col">
					{#each group.transactions as txn, index (txn.id)}
						<div class:mt-2={index > 0} class:border-t={index > 0} class:pt-2={index > 0}>
							{#if editingId === txn.id}
								<div class="flex flex-col gap-3 rounded-xl border p-3">
									<input type="date" bind:value={editDate} class="field" />
									<input type="text" bind:value={editDetail} class="field" />
									<input type="number" bind:value={editAmount} min="1" class="field" />
									<div class="flex flex-wrap gap-2">
										{#each methods as m}
											<button
												type="button"
												class="chip {editMethod === m
													? 'preset-filled-primary-500'
													: 'preset-outlined-surface-200-800'}"
												onclick={() => (editMethod = m)}>{PAYMENT_LABELS[m]}</button
											>
										{/each}
									</div>
									<div class="flex gap-2">
										<button onclick={saveEdit} class="btn preset-filled-primary-500">儲存</button>
										<button onclick={cancelEdit} class="btn preset-outlined-surface-200-800"
											>取消</button
										>
									</div>
								</div>
							{:else}
								<button
									onclick={() => startEdit(txn)}
									class="flex w-full items-center justify-between gap-4 text-left transition-opacity hover:opacity-80"
								>
									<div>
										<p class="text-sm font-semibold">{txn.detail}</p>
										<p class="text-xs" style="color:var(--color-ink-soft)">
											{PAYMENT_LABELS[txn.method]}
										</p>
									</div>
									<span class="money shrink-0 font-semibold" style="color:var(--color-danger)"
										>${txn.amount.toLocaleString()}</span
									>
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
