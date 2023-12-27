<script lang="ts">
	import { onMount } from "svelte";

	let page = 0;
	let to = "";

	interface Link {
		id: string;
		to: string;
		ex: number;
		clicks: number;
		createdAt: number;
		updatedAt: number;
	}

	let links: Link[] = [];

	const onSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		const response = await fetch("/api/links", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ to }),
		});

		to = "";

		if (response.ok) {
			const link = (await response.json()) as Link & { id: string };

			links = [link, ...links];
		}
	};

	const fetchLinks = async () => {
		const data = await fetch("/api/links");
		const json = await data.json();

		links = json.links;
	};

	const chunk = <T,>(array: T[], size: number) => {
		const length = Math.ceil(array.length / size);
		return Array.from({ length }, (_, i) => {
			return array.slice(i * size, i * size + size);
		});
	};

	onMount(async () => {
		await fetchLinks();
		setInterval(fetchLinks, 5000);
	});

	$: sorted = links.sort((a, b) => b.createdAt - a.createdAt);
	$: chunks = chunk(sorted, 10);

	const next = () => {
		page = Math.min(page + 1, chunks.length - 1);
	};

	const back = () => {
		page = Math.max(page - 1, 0);
	};

	$: x = page * 10 + 1;
	$: y = page * 10 + chunks[page]?.length;
	$: z = links.length;
</script>

<div class="stack">
	<form on:submit={onSubmit} class="cluster gap:1">
		<input type="url" placeholder="Enter your link..." bind:value={to} />
		<button type="submit" disabled={!to.length}>Shorten</button>
	</form>

	{#if links.length}
		<div class="stack gap:1" style="margin-top: 1.75rem;">
			<table>
				<thead>
					<tr>
						<td>ID</td>
						<td>To</td>
						<td>Clicks</td>
					</tr>
				</thead>
				{#each chunks[page] as link}
					<tr>
						<td>
							<a target="_blank" href={`/l/${link.id}`}
								>{link.id}</a
							>
						</td>
						<td>{link.to}</td>
						<td>{link.clicks}</td>
					</tr>
				{/each}
			</table>

			<div class="box invert" style="--padding: 0.75rem;">
				<div class="cluster" data-justify="space-between">
					<p>Showing {x} – {y} of {z}</p>
					<div class="cluster">
						<button
							class="pagination-button"
							on:click={back}
							disabled={page === 0}
						>
							&lt;
						</button>
						<span>{page + 1} of {chunks.length}</span>
						<button
							class="pagination-button"
							on:click={next}
							disabled={page === chunks.length - 1}
						>
							&gt;
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>No links yet.</p>
	{/if}
</div>

<style>
	.pagination-button {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		vertical-align: middle;
		padding: 0.25rem;
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--bg-border);
		background-color: var(--bg-main);
		border-radius: 100%;
		transition: all 0.2s ease-in-out;
	}

	form {
		margin-top: 2rem;
	}

	input {
		padding: 0.75rem;
		border: 1px solid var(--bg-border);
		background-color: var(--bg-mute);
		border-radius: 0.5rem;
	}

	button {
		cursor: pointer;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--bg-border);
		background-color: var(--bg-mute);
		border-radius: 0.5rem;
		transition: all 0.2s ease-in-out;
	}

	button:not(:disabled):hover {
		scale: 1.05;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	table {
		border-spacing: 0;
		border: 1px solid var(--bg-border);
		overflow: hidden;
		overflow-x: auto;
		border-radius: 0.75rem;
		outline: var(--border-thin) transparent;
		outline-offset: calc(var(--border-thin) * -1);
	}

	table thead td {
		font-weight: bold;
	}

	table td {
		border-bottom: 1px solid var(--bg-border);
		padding: 0.85rem;
	}

	table tr:last-child > td {
		border-bottom: none;
	}

	table tr:nth-child(even) {
		background-color: var(--bg-mute);
	}
</style>
