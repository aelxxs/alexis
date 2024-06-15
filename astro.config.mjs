import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	prefetch: true,
	output: "server",
	adapter: vercel(),
	integrations: [svelte()],
	experimental: {
		rewriting: true,
	},
});
