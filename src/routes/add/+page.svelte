<script lang="ts">
	import { addTransaction } from '$lib/db/repo';
	import { BANKS, PAYMENT_LABELS, type PaymentMethod } from '$lib/domain/types';
	import { goto } from '$app/navigation';

	let date = $state(new Date().toISOString().slice(0, 10));
	let detail = $state('');
	let amount = $state('');
	let method = $state<PaymentMethod>('cash');

	const methods: PaymentMethod[] = ['cash', ...BANKS];

	async function handleSubmit() {
		const n = Number(amount);
		if (!n || n <= 0 || !detail.trim()) return;
		await addTransaction({ date, detail: detail.trim(), amount: n, method });
		goto('/');
	}
</script>

<h2 class="mb-4 text-xl font-bold">記帳</h2>

<form onsubmit={handleSubmit} class="card surface-card flex flex-col gap-4">
	<label class="flex flex-col gap-1">
		<span class="text-xs font-medium" style="color:var(--color-ink-soft)">日期</span>
		<input type="date" bind:value={date} class="field" />
	</label>
	<label class="flex flex-col gap-1">
		<span class="text-xs font-medium" style="color:var(--color-ink-soft)">明細</span>
		<input type="text" bind:value={detail} placeholder="花了什麼？" class="field" />
	</label>
	<label class="flex flex-col gap-1">
		<span class="text-xs font-medium" style="color:var(--color-ink-soft)">金額</span>
		<input type="number" bind:value={amount} placeholder="0" min="1" class="field" />
	</label>
	<fieldset class="flex flex-col gap-1.5">
		<legend class="text-xs font-medium" style="color:var(--color-ink-soft)">付款方式</legend>
		<div class="flex flex-wrap gap-2">
			{#each methods as m}
				<button
					type="button"
					class="chip {method === m ? 'preset-filled-primary-500' : 'preset-outlined-surface-200-800'}"
					onclick={() => (method = m)}
				>{PAYMENT_LABELS[m]}</button>
			{/each}
		</div>
	</fieldset>
	<button type="submit" class="btn preset-filled-primary-500 self-start">儲存</button>
</form>
