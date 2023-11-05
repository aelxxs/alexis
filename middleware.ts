export const config = {
	// Only run the middleware on the admin route
	matcher: "/f",
};

export default function middleware(request: Request): Response {
	const url = new URL(request.url);

	if (url.pathname === "/f") {
		url.pathname = "/";
	}
	return Response.redirect(url);
}
