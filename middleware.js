import { rewrite } from "@vercel/edge";
import { kv } from "@vercel/kv";

export const config = {
	matcher: "/f/:path*",
};

/**
 *
 * @param {Request} request
 * @returns
 */
export default async function middleware(request) {
	const url = new URL(request.url);
	const id = url.pathname.split("/").pop();

	const file = await kv.hget("files", id);

	if (!file) {
		return Response.redirect(new URL("/", request.url));
	}

	file.clicks++;

	await kv.hset("files", {
		[id]: file,
	});

	return rewrite(
		`https://sf4xxnguvhaohooo.public.blob.vercel-storage.com/${id}`
	);
}
