<script lang="ts">
	import type { PeriodTotal } from '$lib/domain/types'

	let { points }: { points: PeriodTotal[] } = $props()

	const maxValue = $derived(Math.max(0, ...points.map((p) => p.total)))
	const hasData = $derived(points.length > 0 && maxValue > 0)
</script>

{#if hasData}
	<div class="flex h-32 items-end gap-2">
		{#each points as p}
			<div class="flex flex-1 flex-col items-center gap-1">
				<span class="text-[10px] font-medium" style="color:var(--color-ink-soft)">
					{p.total > 0 ? p.total.toLocaleString() : ''}
				</span>
				<div
					class="w-full rounded-t"
					style="height:{Math.max(2, (p.total / maxValue) * 100)}px;background:linear-gradient(180deg,var(--color-primary),var(--color-primary-end))"
				></div>
				<span class="text-[10px]" style="color:var(--color-ink-soft)">{p.label}</span>
			</div>
		{/each}
	</div>
{:else}
	<p class="py-6 text-center text-sm" style="color:var(--color-ink-soft)">尚無資料</p>
{/if}
