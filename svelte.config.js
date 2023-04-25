import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import switchCase from 'svelte-switch-case';
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'public',
			assets: 'public',
			fallback: 'index.html',
			precompress: false,
			static: false 
		})
	},
};

export default config;
