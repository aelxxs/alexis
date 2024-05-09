import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const collection = await fetch(
		"https://api.discogs.com/users/aelxxs/collection"
	);

	const releases = await collection.json();

	if (!releases) {
		return new Response(JSON.stringify({ releases: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!releases.length) {
		return new Response(JSON.stringify({ releases: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ releases }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
