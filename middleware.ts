import { rewrite } from "@vercel/edge";

export const config = {
	// Only run the middleware on the admin route
	matcher: "/f",
};

const file =
	"https://sf4xxnguvhaohooo.public.blob.vercel-storage.com/articles/blob-HlmeYYVfpatdJoEl2MqEHShBVrdGQl.txt";

export default function middleware(request: Request): Response {
	const url = new URL(request.url);

	if (url.pathname === "/f") {
		url.pathname = "/hi";
	}

	return rewrite(file);
}
