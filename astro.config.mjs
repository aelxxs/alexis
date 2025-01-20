import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://alexis.lol",
	prefetch: true,
	output: "server",
	adapter: vercel(),
	integrations: [svelte()],
	rewriting: true,
	// experimental: {
	// 	rewriting: true,
	// },
	redirects: {
		"/p": "/paste",
	},
});
