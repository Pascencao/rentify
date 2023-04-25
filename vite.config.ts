import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from "path";

const config: UserConfig = {
	plugins: [sveltekit()],
	resolve:{
		alias:{
			$lib: path.resolve("./src/lib"),
			$service: path.resolve("./src/service"),
		}
	}
};

export default config;
