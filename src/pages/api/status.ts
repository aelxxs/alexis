import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const data = await fetch(
		`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=aelxxs&api_key=${
			import.meta.env.LASTFM_API_KEY
		}&format=json`
	);

	const { recenttracks } = await data.json();

	if (!recenttracks) {
		return new Response(JSON.stringify({ track: null, lastTrack: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!recenttracks.track.length) {
		return new Response(JSON.stringify({ track: null, lastTrack: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	const [track, actualLastTrack] = recenttracks.track;

	if (!track) {
		return new Response(JSON.stringify({ track: null, lastTrack: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	if (track["@attr"]?.nowplaying !== "true") {
		return new Response(
			JSON.stringify({ track: null, lastTrack: normalizeData(track) }),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	return new Response(
		JSON.stringify({
			lastTrack: normalizeData(actualLastTrack),
			track: normalizeData(track),
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
};

function normalizeData(data: any) {
	return {
		url: data.url,
		name: data.name,
		artist: data.artist["#text"],
		album: data.album["#text"],
		image: data.image[3]["#text"],
	};
}
