<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/add', label: 'Add' },
		{ href: '/history', label: 'History' },
		{ href: '/setup', label: 'Setup' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
	<AppBar>
		<AppBar.Toolbar>
			<AppBar.Lead>
				<h1 class="text-xl font-bold">My Money</h1>
			</AppBar.Lead>
			<AppBar.Trail>
				<nav class="flex gap-2">
					{#each nav as n}
						<a
							href={n.href}
							class="btn btn-sm {page.url.pathname === n.href ? 'preset-filled-primary-500' : 'preset-outlined-surface-200-800'}"
						>{n.label}</a>
					{/each}
				</nav>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>
	<main class="mx-auto w-full max-w-2xl flex-1 p-4">
		{@render children()}
	</main>
</div>
