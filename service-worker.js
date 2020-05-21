---
layout: null
---

'use strict';
const CACHE_NAME = 'offline-cache-{{'now' | date: '%s' }}';

const FILES_TO_CACHE = [
	'/',
	'/favicon.png',
	'/icon-5124.png',
	'/poppins-700.subset.woff2',
	{%- for recipe in site.recipes %}
	'{{ recipe.url | relative_url }}',
	{%- endfor %}
];

self.addEventListener('install', evt => {
	evt.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
});

self.addEventListener('activate', evt => {
	evt.waitUntil(
		caches.keys().then(keyList => {
			return Promise.all(
				keyList.map(key => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

self.addEventListener('fetch', evt => {
	if (evt.request.method !== 'GET') {
		// Not a page navigation, bail.
		return;
	}

	evt.respondWith(
		caches.match(evt.request).then(r => {
			return (
				r ||
				fetch(evt.request).then(response => {
					return caches.open(CACHE_NAME).then(cache => {
						cache.put(evt.request, response.clone());
						return response;
					});
				})
			);
		})
	);
});
