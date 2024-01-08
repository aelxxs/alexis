<script lang="ts">
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";

	export let mode: "full" | "compact" = "full";

	type Song = {
		name: string;
		artist: string;
		url: string;
		image: string;
	};

	let data: { track: Song; lastTrack: Song } | null = null;

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
		fetchData();

		fetchData();

		setInterval(fetchData, 10000);
	});
</script>

{#if mode === "full"}
	{#if data && data.track}
		<div class="container" transition:slide>
			<a
				id="now-playing"
				href={data.track.url}
				target="_blank"
				class="box"
				style="--padding: 0.5rem;"
			>
				<div class="cluster" style="--space: 0.75rem;">
					<img class="rounded:md" src={data.track.image} alt="" />
					<div class="stack" style="--space: 0.25rem;">
						<p style="font-weight: 600;">{data.track.name}</p>
						<div class="cluster" data-justify="space-between">
							<p class="txt:mute">{data.track.artist}</p>
							<div class="sound-wave">
								<span />
								<span />
								<span />
							</div>
						</div>
					</div>
				</div>
			</a>
		</div>
	{/if}
{:else if mode === "compact"}
	{#if data && data.lastTrack}
		<p>
			Last Track: <a href={data?.lastTrack?.url}
				>{data?.lastTrack?.name} – {data?.lastTrack?.artist}</a
			>
		</p>
	{/if}
{/if}

<style>
	.container {
		margin-top: 1.5rem;
	}

	#now-playing {
		display: block;
		text-decoration: none;
	}

	img {
		width: 03rem;
		height: auto;
		border-radius: 0.45rem;
	}

	.box {
		/* Match the width of the contents */
		width: fit-content;
	}

	.sound-wave {
		display: flex;
		justify-content: space-between;
		margin-left: 0.5rem;
		width: 13px;
		height: 13px;
	}

	.sound-wave span {
		width: 0.2rem;
		height: 100%;
		background-color: var(--clr-500);
		border-radius: 0.25rem;
		transform-origin: bottom;
		animation: bounce 2.2s ease infinite alternate;
	}

	.sound-wave span:nth-of-type(2) {
		background-color: var(--clr-400);
		animation-delay: -2.2s;
	}

	.sound-wave span:nth-of-type(3) {
		animation-delay: -3.7s;
	}

	@keyframes bounce {
		10% {
			transform: scaleY(0.3); /* start by scaling to 30% */
		}

		30% {
			transform: scaleY(1); /* scale up to 100% */
		}

		60% {
			transform: scaleY(0.5); /* scale down to 50% */
		}

		80% {
			transform: scaleY(0.75); /* scale up to 75% */
		}

		100% {
			transform: scaleY(0.6); /* scale down to 60% */
		}
	}
</style>
