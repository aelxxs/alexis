<script lang="ts">
	import { onMount } from "svelte";
	import { lanyard, type KVBattery } from "./lanyard.ts";

	let percentage = 0;
	let isCharging = false;

	onMount(() => {
		const socket = lanyard(({ kv }) => {
			const battery = JSON.parse(kv.battery) as KVBattery;
			percentage = battery.percentage;
			isCharging = battery.isCharging;
		});

		return () => socket.close();
	});

	$: message = `Laptop Battery: ${percentage}% ${isCharging ? "(charging)" : ""}`;
</script>

<p class="fs:xs">{message}</p>
