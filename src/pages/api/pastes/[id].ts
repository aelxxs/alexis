import { kv } from "@vercel/kv";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (req) => {
	const paste = await kv.hget("pastes", req.params.id as string);

	if (!paste) {
		return new Response(JSON.stringify({ pastes: [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	console.log(paste);

	return new Response(JSON.stringify(paste), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
