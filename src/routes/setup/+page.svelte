<script lang="ts">
	import { getState } from '$lib/stores/money.svelte'
	import { addFund, clearWallet, setTargetDate } from '$lib/db/repo'

	const money = getState()

	let fundAmount = $state('')
	let targetInput = $state('')
	let showClearConfirm = $state(false)
	let isClearing = $state(false)

	async function handleAddFund(event: SubmitEvent) {
		event.preventDefault()
		const n = Number(fundAmount)
		if (!n || n <= 0) return
		await addFund(n)
		fundAmount = ''
	}

	async function handleSetTarget(event: SubmitEvent) {
		event.preventDefault()
		if (!targetInput) return
		await setTargetDate(targetInput)
	}

	function cancelClearWallet() {
		showClearConfirm = false
	}

	async function handleClearWallet() {
		if (isClearing) return
		isClearing = true
		try {
			await clearWallet()
			fundAmount = ''
			targetInput = ''
			showClearConfirm = false
		} finally {
			isClearing = false
		}
	}
</script>

<h2 class="mb-4 text-xl font-bold">設定</h2>

<div class="flex flex-col gap-4">
	<div class="card surface-card">
		<h3 class="mb-1 text-sm font-semibold">加入資金</h3>
		<p class="mb-3 text-xs" style="color:var(--color-ink-soft)">
			目前餘額：<span class="money font-semibold" style="color:var(--color-positive)"
				>${money.summary.balance.toLocaleString()}</span
			>
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
				目前：{money.targetDate}（剩餘
				<span class="font-semibold">{money.summary.remainingDays}</span> 天）
			</p>
		{:else}
			<p class="mb-3 text-xs" style="color:var(--color-ink-soft)">
				設定目標日期後，即可計算每日預算
			</p>
		{/if}
		<form onsubmit={handleSetTarget} class="flex gap-2">
			<input type="date" bind:value={targetInput} class="field w-48" />
			<button type="submit" class="btn preset-filled-primary-500">設定</button>
		</form>
	</div>

	<div class="card surface-card danger-card">
		<h3 class="mb-1 text-sm font-semibold">清空錢包</h3>
		<p class="mb-3 text-xs" style="color:var(--color-danger)">
			這會刪除所有資金、消費紀錄與目標日期，且無法復原。
		</p>

		{#if showClearConfirm}
			<div class="danger-panel flex flex-col gap-3" aria-live="polite">
				<p class="text-sm font-semibold">再次確認要重置錢包？</p>
				<p class="text-xs" style="color:var(--color-ink-soft)">
					確認後會立即清空所有資料。若只是想修正內容，請改用新增資金或編輯紀錄。
				</p>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class="btn preset-outlined-surface-200-800"
						onclick={cancelClearWallet}
						disabled={isClearing}
					>
						取消
					</button>
					<button
						type="button"
						class="btn btn-danger"
						onclick={handleClearWallet}
						disabled={isClearing}
					>
						{isClearing ? '清空中...' : '確認清空'}
					</button>
				</div>
			</div>
		{:else}
			<button type="button" class="btn btn-danger-soft" onclick={() => (showClearConfirm = true)}>
				清空錢包
			</button>
		{/if}
	</div>
</div>
