import { kv } from "@vercel/kv";

import type { APIRoute } from "astro";

export type Link = {
	to: string;
	ex: number;
	clicks: number;
	createdAt: number;
	updatedAt: number;
};

export const GET: APIRoute = async (request) => {
	const { url, params } = request;

	const id = params.id as string;
	const link = await kv.hget<Link>("links", id);

	if (!link || link.ex < Date.now()) {
		await kv.hdel("links", id);

		return request.redirect("/");
	}

	link.clicks++;

	await kv.hset("links", {
		[id]: link,
	});

	return request.redirect(link.to);
};

