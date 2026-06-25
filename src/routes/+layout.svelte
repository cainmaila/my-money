<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { AppBar, SegmentedControl } from '@skeletonlabs/skeleton-svelte'
	import { base } from '$app/paths'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	let { children } = $props()

	const nav = [
		{ value: '/', label: '總覽' },
		{ value: '/add', label: '記帳' },
		{ value: '/history', label: '紀錄' },
		{ value: '/setup', label: '設定' }
	]

	function withBase(pathname: string) {
		return `${base}${pathname}`
	}

	function onNavChange(detail: { value: string | null }) {
		if (detail.value) goto(withBase(detail.value))
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-dvh flex-col pb-16 sm:pb-0">
	<!-- Desktop header -->
	<AppBar class="app-header hidden sm:block">
		<AppBar.Toolbar>
			<AppBar.Lead>
				<span class="money text-lg font-bold tracking-tight" style="color:var(--color-primary)"
					>我的錢包</span
				>
			</AppBar.Lead>
			<AppBar.Trail>
				<SegmentedControl value={page.route.id ?? '/'} onValueChange={onNavChange}>
					<SegmentedControl.Control>
						{#each nav as n}
							<SegmentedControl.Item value={n.value}>
								<SegmentedControl.ItemText>{n.label}</SegmentedControl.ItemText>
								<SegmentedControl.ItemHiddenInput />
							</SegmentedControl.Item>
						{/each}
						<SegmentedControl.Indicator />
					</SegmentedControl.Control>
				</SegmentedControl>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<!-- Content -->
	<main class="mx-auto w-full max-w-lg flex-1 px-4 py-5">
		{@render children()}
	</main>

	<!-- Mobile bottom bar -->
	<nav class="bottom-bar sm:hidden">
		{#each nav as n}
			<a href={withBase(n.value)} aria-current={page.route.id === n.value ? 'page' : undefined}
				>{n.label}</a
			>
		{/each}
	</nav>
</div>
