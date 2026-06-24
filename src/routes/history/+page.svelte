<script lang="ts">
	import { getState } from '$lib/stores/money.svelte';
	import { updateTransaction } from '$lib/db/repo';
	import { BANKS, PAYMENT_LABELS, type PaymentMethod } from '$lib/domain/types';

	const money = getState();
	let editingId: number | null = $state(null);
	let editDate = $state('');
	let editDetail = $state('');
	let editAmount = $state('');
	let editMethod: PaymentMethod = $state('cash');

	const methods: PaymentMethod[] = ['cash', ...BANKS];

	function startEdit(txn: { id?: number; date: string; detail: string; amount: number; method: PaymentMethod }) {
		editingId = txn.id ?? null;
		editDate = txn.date;
		editDetail = txn.detail;
		editAmount = String(txn.amount);
		editMethod = txn.method;
	}

	function cancelEdit() {
		editingId = null;
	}

	async function saveEdit() {
		if (editingId == null) return;
		const n = Number(editAmount);
		if (!n || n <= 0 || !editDetail.trim()) return;
		await updateTransaction(editingId, {
			date: editDate,
			detail: editDetail.trim(),
			amount: n,
			method: editMethod
		});
		editingId = null;
	}
</script>

<h2 class="mb-4 text-xl font-bold">紀錄</h2>

{#if money.transactions.length === 0}
	<div class="card surface-card text-center">
		<p style="color:var(--color-ink-soft)">還沒有紀錄，去記第一筆吧</p>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each money.transactions as txn (txn.id)}
			{#if editingId === txn.id}
				<div class="card surface-card flex flex-col gap-3">
					<input type="date" bind:value={editDate} class="field" />
					<input type="text" bind:value={editDetail} class="field" />
					<input type="number" bind:value={editAmount} min="1" class="field" />
					<div class="flex flex-wrap gap-2">
						{#each methods as m}
							<button
								type="button"
								class="chip {editMethod === m ? 'preset-filled-primary-500' : 'preset-outlined-surface-200-800'}"
								onclick={() => (editMethod = m)}
							>{PAYMENT_LABELS[m]}</button>
						{/each}
					</div>
					<div class="flex gap-2">
						<button onclick={saveEdit} class="btn preset-filled-primary-500">儲存</button>
						<button onclick={cancelEdit} class="btn preset-outlined-surface-200-800">取消</button>
					</div>
				</div>
			{:else}
				<button
					onclick={() => startEdit(txn)}
					class="card surface-card flex w-full items-center justify-between text-left transition-shadow hover:shadow-lg"
				>
					<div>
						<p class="text-sm font-semibold">{txn.detail}</p>
						<p class="text-xs" style="color:var(--color-ink-soft)">{txn.date} · {PAYMENT_LABELS[txn.method]}</p>
					</div>
					<span class="money font-semibold" style="color:var(--color-danger)">${txn.amount.toLocaleString()}</span>
				</button>
			{/if}
		{/each}
	</div>
{/if}
