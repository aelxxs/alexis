import { Redis } from "@upstash/redis";

import type { APIRoute } from "astro";

export type Link = {
	to: string;
	ex: number;
	clicks: number;
	createdAt: number;
	updatedAt: number;
};

const redis = Redis.fromEnv();

export const GET: APIRoute = async (request) => {
	const { params } = request;

	const id = params.id as string;
	const link = await redis.hget<Link>("links", id);

	// if (!link || link.ex < Date.now()) {
	//	await kv.hdel("links", id);

	//	return request.redirect("/");
	// }

	link.clicks++;

	await redis.hset("links", {
		[id]: link,
	});

	return request.redirect(link.to);
};
