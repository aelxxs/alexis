import { Redis } from "@upstash/redis";
import { rewrite } from "@vercel/edge";

export const config = {
	matcher: "/f/:path*",
};

const redis = Redis.fromEnv();

/**
 *
 * @param {Request} request
 * @returns
 */
export default async function middleware(request) {
	const url = new URL(request.url);
	const id = url.pathname.split("/").pop();

	const file = await redis.hget("files", id);

	if (!file) {
		return Response.redirect(new URL("/", request.url));
	}

	file.clicks++;

	await redis.hset("files", {
		[id]: file,
	});

	return rewrite(
		`https://sf4xxnguvhaohooo.public.blob.vercel-storage.com/${id}`
	);
}
