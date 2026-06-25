/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker'

declare const self: ServiceWorkerGlobalScope

const CACHE = `cache-${version}`
const ASSETS = new Set([...build, ...files, ...prerendered])

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE)
			await cache.addAll([...ASSETS])
		})()
	)

	void self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) {
					await caches.delete(key)
				}
			}

			await self.clients.claim()
		})()
	)
})

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return

	const url = new URL(event.request.url)
	if (url.origin !== self.location.origin) return

	if (event.request.mode === 'navigate') {
		event.respondWith(handleNavigation(event.request, url))
		return
	}

	if (ASSETS.has(url.pathname)) {
		event.respondWith(cacheFirst(event.request))
	}
})

async function handleNavigation(request: Request, url: URL) {
	const cache = await caches.open(CACHE)

	try {
		const response = await fetch(request)
		if (response.ok) {
			await cache.put(request, response.clone())
		}
		return response
	} catch {
		return (
			(await cache.match(request)) ??
			(await cache.match(url.pathname)) ??
			(await cache.match(new URL(self.registration.scope).pathname)) ??
			Response.error()
		)
	}
}

async function cacheFirst(request: Request) {
	const cache = await caches.open(CACHE)
	const cached = await cache.match(request)
	if (cached) return cached

	const response = await fetch(request)
	if (response.ok) {
		await cache.put(request, response.clone())
	}
	return response
}
