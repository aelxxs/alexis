import { defineCollection, z } from "astro:content";

export const collections = {
	pages: defineCollection({
		type: "content",
		schema: z.object({
			title: z.string(),
			subtitle: z.string(),
		}),
	}),
	posts: defineCollection({
		type: "data",
		schema: z.object({
			title: z.string(),
			date: z.string(),
		}),
	}),
};
