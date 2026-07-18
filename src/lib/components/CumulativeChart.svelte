<script lang="ts">
	import type { CumulativePoint } from '$lib/domain/types'

	let { points }: { points: CumulativePoint[] } = $props()

	const width = 300
	const height = 130
	const padX = 12
	const plotTop = 10
	const plotBottom = 104

	const maxValue = $derived(Math.max(0, ...points.map((p) => p.cumulative)))
	const hasData = $derived(points.length > 0 && maxValue > 0)

	const coords = $derived(
		points.map((p, i) => ({
			x: points.length > 1 ? padX + (i / (points.length - 1)) * (width - padX * 2) : width / 2,
			y: plotBottom - (p.cumulative / maxValue) * (plotBottom - plotTop)
		}))
	)

	const linePoints = $derived(coords.map((c) => `${c.x},${c.y}`).join(' '))
	const last = $derived(coords.at(-1))
	const labelStep = $derived(Math.max(1, Math.ceil(points.length / 6)))
</script>

{#if hasData}
	<svg viewBox="0 0 {width} {height}" class="w-full" role="img" aria-label="累積花費折線圖">
		<polyline
			points={linePoints}
			fill="none"
			stroke="var(--color-primary)"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		{#if last}
			<circle cx={last.x} cy={last.y} r="4" fill="var(--color-primary-end)" />
		{/if}
		{#each coords as c, i}
			{#if i % labelStep === 0 || i === coords.length - 1}
				<text x={c.x} y={height - 6} font-size="9" text-anchor="middle" fill="var(--color-ink-soft)"
					>{points[i].label}</text
				>
			{/if}
		{/each}
	</svg>
{:else}
	<p class="py-6 text-center text-sm" style="color:var(--color-ink-soft)">尚無資料</p>
{/if}
