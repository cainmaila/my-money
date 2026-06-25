<script lang="ts">
	import './layout.css'
	import { onMount } from 'svelte'
	import favicon from '$lib/assets/favicon.svg'
	import { AppBar, SegmentedControl } from '@skeletonlabs/skeleton-svelte'
	import { browser } from '$app/environment'
	import { base } from '$app/paths'
	import { page, updated } from '$app/state'
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

	onMount(() => {
		if (!browser || !('serviceWorker' in navigator)) return

		let refreshing = false

		const onControllerChange = () => {
			if (refreshing) return
			refreshing = true
			window.location.reload()
		}

		navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

		return () => {
			navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
		}
	})

	$effect(() => {
		if (!browser || !('serviceWorker' in navigator) || !updated.current) return
		navigator.serviceWorker.getRegistration().then((registration) => registration?.update())
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href={withBase('/manifest.webmanifest')} />
	<link rel="apple-touch-icon" href={withBase('/icons/apple-touch-icon.png')} />
	<meta name="application-name" content="我的錢包" />
	<meta name="apple-mobile-web-app-title" content="我的錢包" />
</svelte:head>

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
