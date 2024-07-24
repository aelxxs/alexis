<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	const FETCH_INTERVAL = 5000;

	type Song = {
		url: string;
		image: string;
		name: string;
		artist: string;
	};

	let data: { track: Song } | null = null;

	async function fetchData() {
		try {
			const resp = await fetch("/api/status");
			const json = await resp.json();

			data = json;
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}

	onMount(async () => {
		fetchData();
		setInterval(fetchData, FETCH_INTERVAL);
	});
</script>

{#if data && data.track}
	<div class="cluster gap:-1" transition:fade>
		<img src={data.track.image} alt="" />
		<div>
			<p class="fs:xs">
				<span class="fw:bold">Latest Track</span>: (from Last.fm)
			</p>
			<a class="link" href={data.track.url} target="_blank">
				{data.track.name}
			</a>
			by
			<a class="link" href={data.track.url} target="_blank">
				{data.track.artist}
			</a>
		</div>
	</div>
{:else}
	<div class="cluster gap:-1">
		<div class="img-skeleton"></div>
		<div class="div">
			<div class="track-skeleton"></div>
			<div class="artist-skeleton"></div>
		</div>
	</div>
{/if}

<style>
	img {
		width: 3.25rem;
		height: auto;
		border-radius: 0.25rem;
	}

	.img-skeleton {
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 0.45rem;
		background-color: var(--bg-border);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.track-skeleton {
		width: 10rem;
		height: 1.15rem;
		border-radius: 0.25rem;
		background-color: var(--bg-border);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.artist-skeleton {
		margin-top: 0.35rem;
		width: 5rem;
		height: 1.15rem;
		border-radius: 0.25rem;
		background-color: var(--bg-border);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: 0.5;
		}
	}
</style>
