import { rewrite } from "@vercel/edge";

export const config = {
	matcher: "/f",
};

const file =
	"https://sf4xxnguvhaohooo.public.blob.vercel-storage.com/image-ZLBGwd30CnwzNF7O53Gli2zeL7HcHA.png";

export default function middleware(request: Request): Response {
	const url = new URL(request.url);

	if (url.pathname === "/f") {
		url.pathname = "/hi";
	}

	return rewrite(file, {
		headers: {
			"Content-Disposition": "inline",
		},
	});
}
