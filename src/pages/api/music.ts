import type { APIRoute } from "astro";

const LASTFM_API_KEY = import.meta.env.LASTFM_API_KEY;
const LASTFM_USER = "aelxxs";

const request = async (url: string) => {
	const data = await fetch(url);
	return await data.json();
};

const composeUrl = (method: string, args: string = "") => {
	return `https://ws.audioscrobbler.com/2.0/?method=${method}&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json${args}`;
};

const TOP_ARTISTS = composeUrl("user.getWeeklyArtistChart");
const TOP_TRACKS = composeUrl("user.getWeeklyTrackChart");
const TOP_ALBUMS = composeUrl("user.getWeeklyAlbumChart");

const getArtists = async () => {};
const getTracks = async () => {};
const getAlbums = async () => {};

export const GET: APIRoute = async () => {
	console.log(LASTFM_API_KEY);

	const [artists, tracks, albums] = await Promise.all([
		request(TOP_ARTISTS),
		request(TOP_TRACKS),
		request(TOP_ALBUMS),
	]);

	return new Response(
		JSON.stringify({
			artists,
			tracks,
			albums,
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
};
