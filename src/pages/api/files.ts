import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import type { APIRoute } from "astro";
import { z } from "zod";

type FixedString<N extends number> = {
	0: string;
	length: N;
} & string;

export type file = {
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

export const GET: APIRoute = async () => {
	const files = await kv.hgetall<Record<string, file>>("files");

	if (!files) {
		return new Response(JSON.stringify({ files: [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const fileArray = Object.entries(files).map(([id, file]) => ({
		id,
		...file,
	}));

	return new Response(JSON.stringify({ files: fileArray }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

const fileDeleteSchema = z.object({
	id: z.string().length(6),
});

export const DELETE: APIRoute = async ({ request }) => {
	const body = await request.json();

	try {
		const { id } = fileDeleteSchema.parse(body);

		await kv.hdel("files", id);

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();

	const file = form.get("file") as File | null;
	const pass = form.get("pass") as string | null;

	const passcode = import.meta.env.PASSCODE;

	if (!pass || pass !== passcode) {
		return new Response("Invalid password", { status: 400 });
	}

	if (!file) {
		return new Response("No file found", { status: 400 });
	}

	try {
		const now = Date.now();

		const id = uid(6);
		const ex = now + 1000 * 60 * 60 * 24 * 7;

		const { url } = await put(id, file, {
			access: "public",
			addRandomSuffix: false,
		});

		const fileData = {
			to: url,
			ex,
			clicks: 0,
			createdAt: now,
			updatedAt: now,
		};

		await kv.hset<file>("files", {
			[id]: { ...fileData },
		});

		return new Response(JSON.stringify({ id, ...file }), { status: 200 });
	} catch (e) {
		return new Response("An error occured", { status: 400 });
	}
};
