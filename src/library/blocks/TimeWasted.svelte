<script lang="ts">
	let seconds = 0;

	setInterval(() => {
		seconds++;
	}, 1000);

	const fmtTime = (s: number) => {
		if (s >= 60 ** 2 * 24) return "∞";

		const p = (n: number) => (n < 10 ? `0${n}` : n);

		const hrs = p(~~(s / 60 ** 2));
		const min = p(~~(s / 60));
		const sec = p(~~(s % 60));

		return `${hrs}:${min}:${sec}`;
	};

	$: time = fmtTime(seconds);
</script>

<div class="corner-container">
	<div class="box no-hover" style="--padding: 0.75rem;">
		<div class="stack" style="--space: 0.25rem;">
			<p style="font-weight: 600;">Time Wasted</p>
			<p class="txt:mute">{time}</p>
		</div>
	</div>
	<img class="corner" src="/sticker.png" alt="" />
</div>

<style>
	.box {
		border-top-right-radius: 0;
		border-bottom-left-radius: 0;
		transition: opacity transform 1s ease-in-out;
		transform: translateY(5rem);
	}

	.corner-container {
		position: fixed;
		bottom: 0;
		right: 0;
		z-index: -1;
	}

	.corner {
		width: 3rem;
		position: fixed;
		bottom: -0.25rem;
		right: -0.25rem;
	}

	.corner-container:hover .box {
		transform: translateY(0);
	}
</style>
