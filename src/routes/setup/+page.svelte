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

<h2 class="mb-4 text-xl font-bold">設定</h2>

<div class="flex flex-col gap-4">
	<div class="card surface-card">
		<h3 class="mb-1 text-sm font-semibold">加入資金</h3>
		<p class="mb-3 text-xs" style="color:var(--color-ink-soft)">
			目前餘額：<span class="money font-semibold" style="color:var(--color-positive)">${money.summary.balance.toLocaleString()}</span>
		</p>
		<form onsubmit={handleAddFund} class="flex gap-2">
			<input type="number" bind:value={fundAmount} placeholder="金額" min="1" class="field w-40" />
			<button type="submit" class="btn preset-filled-primary-500">加入</button>
		</form>
	</div>

	<div class="card surface-card">
		<h3 class="mb-1 text-sm font-semibold">目標日期</h3>
		{#if money.targetDate}
			<p class="mb-3 text-xs" style="color:var(--color-ink-soft)">
				目前：{money.targetDate}（剩餘 <span class="font-semibold">{money.summary.remainingDays}</span> 天）
			</p>
		{:else}
			<p class="mb-3 text-xs" style="color:var(--color-ink-soft)">設定目標日期後，即可計算每日預算</p>
		{/if}
		<form onsubmit={handleSetTarget} class="flex gap-2">
			<input type="date" bind:value={targetInput} class="field w-48" />
			<button type="submit" class="btn preset-filled-primary-500">設定</button>
		</form>
	</div>
</div>
