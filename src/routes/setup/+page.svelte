<script lang="ts">
	import { getState } from '$lib/stores/money.svelte';
	import { addFund, setTargetDate } from '$lib/db/repo';

	const money = getState();

	let fundAmount = $state('');
	let targetInput = $state('');

	async function handleAddFund() {
		const n = Number(fundAmount);
		if (!n || n <= 0) return;
		await addFund(n);
		fundAmount = '';
	}

	async function handleSetTarget() {
		if (!targetInput) return;
		await setTargetDate(targetInput);
	}
</script>

<h2 class="mb-4 text-2xl font-bold">Setup</h2>

<section class="mb-6">
	<h3 class="mb-2 text-lg font-semibold">Add Funds</h3>
	<p class="text-surface-500 mb-2 text-sm">Current balance: ${money.summary.balance.toLocaleString()}</p>
	<form onsubmit={handleAddFund} class="flex gap-2">
		<input
			type="number"
			bind:value={fundAmount}
			placeholder="Amount"
			min="1"
			class="input w-40"
		/>
		<button type="submit" class="btn preset-filled-primary-500">Add</button>
	</form>
</section>

<section>
	<h3 class="mb-2 text-lg font-semibold">Target Date</h3>
	{#if money.targetDate}
		<p class="text-surface-500 mb-2 text-sm">Current: {money.targetDate} ({money.summary.remainingDays} days left)</p>
	{/if}
	<form onsubmit={handleSetTarget} class="flex gap-2">
		<input type="date" bind:value={targetInput} class="input w-48" />
		<button type="submit" class="btn preset-filled-primary-500">Set</button>
	</form>
</section>
