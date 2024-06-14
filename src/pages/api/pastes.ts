import { kv } from "@vercel/kv";
import type { APIRoute } from "astro";
import { z } from "zod";

type FixedString<N extends number> = {
	0: string;
	length: N;
} & string;

export type Paste = {
	content: string;
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

export const GET: APIRoute = async () => {
	const pastes = await kv.hgetall<Record<string, Paste>>("pastes");

	if (!pastes) {
		return new Response(JSON.stringify({ pastes: [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const linkArray = Object.entries(pastes).map(([id, paste]) => ({
		id,
		...paste,
	}));

	return new Response(JSON.stringify({ pastes: linkArray }), {
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

		await kv.hdel("pastes", id);

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};

const PasteCreateSchema = z.object({
	content: z.string().url(),
});

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();

	try {
		const { content } = PasteCreateSchema.parse(body);

		const now = Date.now();

		const id = uid(6);
		const ex = now + 1000 * 60 * 60 * 24 * 7;

		const paste = {
			content,
			ex,
			clicks: 0,
			createdAt: now,
			updatedAt: now,
		};

		await kv.hset<Paste>("pastes", {
			[id]: { ...paste },
		});

		return new Response(JSON.stringify({ id, ...paste }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};
