<script>
	let data = null;

	async function fetchData() {
		try {
			const res = await fetch("http://localhost:4321/api/status");
			if (!res.ok) {
				throw new Error("Network response was not ok");
			}
			const json = await res.json();

			data = json;
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}

	fetchData();
	const interval = setInterval(fetchData, 10000);
</script>

<div class="container">
	{#if data && data.track}
		<a
			id="now-playing"
			href={data.track.url}
			target="_blank"
			class="box"
			style="--padding: 0.5rem;"
		>
			<div class="cluster" style="--space: 0.75rem;">
				<img src={data.track.image} alt="" />
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
	{:else if data && data.lastTrack}
		<p>
			Latest track from Last.FM: <a href={data?.lastTrack.url}
				>{data?.lastTrack.name} – {data.lastTrack.artist}</a
			>
		</p>
	{:else}
		<p>Nothing is playing</p>
	{/if}
</div>

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
		border-radius: 0.35rem;
	}

	.box {
		/* Match the width of the contents */
		width: fit-content;
	}

	.sound-wave {
		margin-left: 0.5em;
		position: relative;
		display: flex;
		justify-content: space-between;
		width: 13px;
		height: 13px;
	}

	.sound-wave span {
		width: 0.2em;
		height: 100%;
		background-color: var(--clr-500);
		border-radius: 3px;
		transform-origin: bottom;
		animation: bounce 2.2s ease infinite alternate;
		content: "";
		bottom: 0;
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
