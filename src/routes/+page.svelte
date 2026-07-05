<script lang="ts">
	import { getState } from '$lib/stores/money.svelte'
	import { BANKS, PAYMENT_LABELS } from '$lib/domain/types'
	import { Progress } from '@skeletonlabs/skeleton-svelte'
	import Coins from '@lucide/svelte/icons/coins'
	import Wallet from '@lucide/svelte/icons/wallet'
	import CreditCard from '@lucide/svelte/icons/credit-card'
	import ReceiptText from '@lucide/svelte/icons/receipt-text'

	const money = getState()

	const runwayPct = $derived(
		money.summary.dailyAllowance > 0
			? Math.min((money.summary.spentToday / money.summary.dailyAllowance) * 100, 100)
			: 0
	)
	const remaining = $derived(money.summary.dailyAllowance - money.summary.spentToday)
	const isOver = $derived(remaining < 0)
</script>

<div class="flex flex-col gap-4">
	<!-- Hero: 今日可花 -->
	{#if money.summary.remainingDays > 0}
		<div class="hero-card">
			<p
				class="inline-flex items-center gap-1.5 text-sm font-medium"
				style="color:rgb(255 255 255/.7)"
			>
				<Coins size={16} />今日可花
			</p>
			<p class="money mt-1 text-4xl font-extrabold">
				${Math.floor(money.summary.dailyAllowance).toLocaleString()}
			</p>

			<div class="mt-3">
				<Progress value={runwayPct} max={100}>
					<div class="mb-1 flex items-center justify-between">
						<Progress.Label class="text-xs" style="color:rgb(255 255 255/.65)">
							{#if isOver}
								今天已超支 ${Math.abs(Math.floor(remaining)).toLocaleString()}
							{:else if money.summary.spentToday > 0}
								今天還能花 ${Math.floor(remaining).toLocaleString()}
							{:else}
								今天尚未消費
							{/if}
						</Progress.Label>
						<span class="stat-chip" style="background:rgb(255 255 255/.18);color:white">
							剩 {money.summary.remainingDays} 天
						</span>
					</div>
					<Progress.Track class="runway-track">
						<Progress.Range class="runway-fill" data-over={isOver} />
					</Progress.Track>
				</Progress>
			</div>
		</div>
	{:else}
		<div class="hero-card">
			<p class="text-lg font-semibold">設定目標日期</p>
			<p class="mt-1 text-sm" style="color:rgb(255 255 255/.7)">
				前往設定頁，設定目標日期後即可計算每日預算
			</p>
		</div>
	{/if}

	<!-- 餘額 -->
	<div class="card surface-card">
		<p
			class="inline-flex items-center gap-1.5 text-xs font-medium"
			style="color:var(--color-ink-soft)"
		>
			<Wallet size={16} />錢包餘額
		</p>
		<p class="money mt-1 text-2xl font-bold" style="color:var(--color-positive)">
			${money.summary.balance.toLocaleString()}
		</p>
	</div>

	<!-- 本次卡費 -->
	{#if Object.keys(money.summary.cardTotals).length > 0}
		<div class="card surface-card">
			<p
				class="mb-3 inline-flex items-center gap-1.5 text-xs font-medium"
				style="color:var(--color-ink-soft)"
			>
				<CreditCard size={16} />本次信用卡應付
			</p>
			<div class="flex flex-col gap-2">
				{#each BANKS as bank}
					{#if money.summary.cardTotals[bank]}
						<div
							class="flex items-center justify-between border-b py-1.5"
							style="border-color:rgb(107 111 134/.08)"
						>
							<span class="inline-flex items-center gap-1 text-sm"
								><CreditCard size={14} />{PAYMENT_LABELS[bank]}</span
							>
							<span class="money text-sm font-semibold"
								>${money.summary.cardTotals[bank]!.toLocaleString()}</span
							>
						</div>
					{/if}
				{/each}
				<div class="flex items-center justify-between pt-1">
					<span class="text-sm font-semibold">合計</span>
					<span class="money text-sm font-bold" style="color:var(--color-primary)"
						>${Object.values(money.summary.cardTotals)
							.reduce((s, v) => s + (v ?? 0), 0)
							.toLocaleString()}</span
					>
				</div>
			</div>
		</div>
	{/if}

	{#if money.summary.topDetails.length > 0}
		<div class="card surface-card">
			<p
				class="mb-3 inline-flex items-center gap-1.5 text-xs font-medium"
				style="color:var(--color-ink-soft)"
			>
				<ReceiptText size={16} />明細前五名
			</p>
			<div class="flex flex-col gap-2">
				{#each money.summary.topDetails as item, index}
					<div
						class="flex items-center justify-between gap-3 border-b py-1.5 last:border-b-0"
						style="border-color:rgb(107 111 134/.08)"
					>
						<div class="min-w-0 flex-1">
							<p class="flex items-center gap-2 text-sm font-semibold">
								<span
									class="rounded-full bg-indigo-500/8 px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]"
									>#{index + 1}</span
								>
								<span class="truncate">{item.detail}</span>
							</p>
							<p class="mt-1 text-xs" style="color:var(--color-ink-soft)">{item.count} 次</p>
						</div>
						<span class="money shrink-0 text-sm font-bold" style="color:var(--color-primary)"
							>${item.totalAmount.toLocaleString()}</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
