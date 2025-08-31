import { Redis } from "@upstash/redis";
import type { APIRoute } from "astro";

const redis = Redis.fromEnv();

export const GET: APIRoute = async (req) => {
	const paste = await redis.hget("pastes", req.params.id as string);

	if (!paste) {
		return new Response(JSON.stringify({ pastes: [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const id = req.params.id as string;

	await redis.hset("pastes", {
		[id]: {
			...paste,
			clicks: paste.clicks + 1,
		},
	});

	return new Response(JSON.stringify(paste), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
