import { Redis } from "@upstash/redis";
import type { APIRoute } from "astro";
import { z } from "zod";

type FixedString<N extends number> = {
	0: string;
	length: N;
} & string;

export type Link = {
	to: string;
	ex: number;
	clicks: number;
	createdAt: number;
	updatedAt: number;
};

import { randomInt } from "crypto";

const uid = <N extends number>(length: N): FixedString<N> => {
	const alphabet =
		"abcdefghijklmnopqrstuvwxyz" +
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"0123456789" +
		"-";

	let id = "";

	for (let i = 0; i < length; i++) {
		id += alphabet[randomInt(0, alphabet.length)];
	}

	return id as FixedString<N>;
};

const redis = Redis.fromEnv();

export const GET: APIRoute = async () => {
	const links = await redis.hgetall<Record<string, Link>>("links");

	if (!links) {
		return new Response(JSON.stringify({ links: [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const linkArray = Object.entries(links).map(([id, link]) => ({
		id,
		...link,
	}));

	return new Response(JSON.stringify({ links: linkArray }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

const LinkDeleteSchema = z.object({
	id: z.string().length(6),
});

export const DELETE: APIRoute = async ({ request }) => {
	const body = await request.json();

	try {
		const { id } = LinkDeleteSchema.parse(body);

		await redis.hdel("links", id);

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};

const LinkCreateSchema = z.object({
	to: z.string().url(),
});

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();

	try {
		const { to } = LinkCreateSchema.parse(body);

		const now = Date.now();

		const id = uid(6);
		const ex = now + 1000 * 60 * 60 * 24 * 7;

		const link = {
			to,
			ex,
			clicks: 0,
			createdAt: now,
			updatedAt: now,
		};

		await redis.hset<Link>("links", {
			[id]: { ...link },
		});

		return new Response(JSON.stringify({ id, ...link }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};
