<script lang="ts">
	import { getState } from '$lib/stores/money.svelte';
	import { updateTransaction } from '$lib/db/repo';
	import { BANKS, type PaymentMethod } from '$lib/domain/types';

	const money = getState();
	let editingId: number | null = $state(null);
	let editDate = $state('');
	let editDetail = $state('');
	let editAmount = $state('');
	let editMethod: PaymentMethod = $state('cash');

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

<h2 class="mb-4 text-2xl font-bold">History</h2>

{#if money.transactions.length === 0}
	<p class="text-surface-500">No transactions yet.</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each money.transactions as txn (txn.id)}
			{#if editingId === txn.id}
				<div class="card preset-filled-surface-100-900 flex flex-col gap-2 p-3">
					<input type="date" bind:value={editDate} class="input" />
					<input type="text" bind:value={editDetail} class="input" />
					<input type="number" bind:value={editAmount} min="1" class="input" />
					<select bind:value={editMethod} class="select">
						<option value="cash">Cash</option>
						{#each BANKS as bank}
							<option value={bank}>{bank}</option>
						{/each}
					</select>
					<div class="flex gap-2">
						<button onclick={saveEdit} class="btn preset-filled-primary-500">Save</button>
						<button onclick={cancelEdit} class="btn preset-filled-surface-200-800">Cancel</button>
					</div>
				</div>
			{:else}
				<button
					onclick={() => startEdit(txn)}
					class="card preset-filled-surface-100-900 flex w-full items-center justify-between p-3 text-left"
				>
					<div>
						<p class="font-semibold">{txn.detail}</p>
						<p class="text-surface-500 text-xs">{txn.date} · {txn.method}</p>
					</div>
					<span class="font-bold">${txn.amount.toLocaleString()}</span>
				</button>
			{/if}
		{/each}
	</div>
{/if}
