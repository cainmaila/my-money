<script lang="ts">
	import { getState } from '$lib/stores/money.svelte';
	import { BANKS } from '$lib/domain/types';

	const money = getState();
</script>

<h2 class="mb-4 text-2xl font-bold">Dashboard</h2>

<div class="grid gap-4 sm:grid-cols-2">
	<div class="card preset-filled-surface-100-900 p-4">
		<h3 class="text-surface-500 text-sm">Wallet Balance</h3>
		<p class="text-3xl font-bold">${money.summary.balance.toLocaleString()}</p>
	</div>

	<div class="card preset-filled-surface-100-900 p-4">
		<h3 class="text-surface-500 text-sm">Daily Allowance</h3>
		{#if money.summary.remainingDays > 0}
			<p class="text-3xl font-bold">${Math.floor(money.summary.dailyAllowance).toLocaleString()}</p>
			<p class="text-surface-500 text-xs">{money.summary.remainingDays} days remaining</p>
		{:else}
			<p class="text-surface-500 text-sm">Set a target date in Setup</p>
		{/if}
	</div>
</div>

{#if Object.keys(money.summary.cardTotals).length > 0}
	<h3 class="mt-6 mb-2 text-lg font-semibold">Monthly Card Payables</h3>
	<div class="grid gap-2 sm:grid-cols-2">
		{#each BANKS as bank}
			{#if money.summary.cardTotals[bank]}
				<div class="card preset-filled-surface-100-900 flex items-center justify-between p-3">
					<span>{bank}</span>
					<span class="font-bold">${money.summary.cardTotals[bank]!.toLocaleString()}</span>
				</div>
			{/if}
		{/each}
	</div>
{/if}
