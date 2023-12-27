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

<div class="box" style="--padding: 0.75rem;">
	<div class="stack" style="--space: 0.25rem;">
		<p style="font-weight: 600;">Time Wasted</p>
		<p class="txt:mute">{time}</p>
	</div>
</div>

<style>
	.box {
		border-top-right-radius: 0;
		border-bottom-left-radius: 0;
	}
</style>
