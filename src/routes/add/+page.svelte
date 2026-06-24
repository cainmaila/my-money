<script lang="ts">
	import { addTransaction } from '$lib/db/repo';
	import { BANKS, type PaymentMethod } from '$lib/domain/types';
	import { goto } from '$app/navigation';

	let date = $state(new Date().toISOString().slice(0, 10));
	let detail = $state('');
	let amount = $state('');
	let method = $state<PaymentMethod>('cash');

	async function handleSubmit() {
		const n = Number(amount);
		if (!n || n <= 0 || !detail.trim()) return;
		await addTransaction({ date, detail: detail.trim(), amount: n, method });
		goto('/');
	}
</script>

<h2 class="mb-4 text-2xl font-bold">Add Transaction</h2>

<form onsubmit={handleSubmit} class="flex flex-col gap-3">
	<label class="label">
		<span>Date</span>
		<input type="date" bind:value={date} class="input" />
	</label>
	<label class="label">
		<span>Detail</span>
		<input type="text" bind:value={detail} placeholder="What for?" class="input" />
	</label>
	<label class="label">
		<span>Amount</span>
		<input type="number" bind:value={amount} placeholder="0" min="1" class="input" />
	</label>
	<label class="label">
		<span>Payment Method</span>
		<select bind:value={method} class="select">
			<option value="cash">Cash</option>
			{#each BANKS as bank}
				<option value={bank}>{bank}</option>
			{/each}
		</select>
	</label>
	<button type="submit" class="btn preset-filled-primary-500 self-start">Save</button>
</form>
