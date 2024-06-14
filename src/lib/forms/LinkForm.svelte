<script lang="ts">
	import { onMount } from "svelte";

	const PER_PAGE = 5;

	let page = 0;
	let to = "";

	interface Link {
		id: string;
		to: string;
		ex: number;
		clicks: number;
		createdAt: number;
		updatedAt: number;
		isCopied: boolean;
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

		links = json.links.map((link: Link & { id: string }) => {
			return {
				...link,
				isCopied: false,
			};
		});
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
	$: chunks = chunk(sorted, PER_PAGE);

	const next = () => {
		page = Math.min(page + 1, chunks.length - 1);
	};

	const back = () => {
		page = Math.max(page - 1, 0);
	};

	$: x = page * PER_PAGE + 1;
	$: y = page * PER_PAGE + chunks[page]?.length;
	$: z = links.length;
</script>

<div class="stack">
	<form on:submit={onSubmit} class="cluster gap:1">
		<input type="url" placeholder="🍔 Enter your link..." bind:value={to} />
		<button type="submit" disabled={!to.length}>Shorten</button>
	</form>

	{#if links.length}
		<div class="stack gap:1" style="margin-top: 1.75rem;">
			<table>
				<thead>
					<tr>
						<td> ID </td>
						<td> To </td>
						<td> Clicks </td>
					</tr>
				</thead>
				{#each chunks[page] as link}
					<tr>
						<td
							class="cluster"
							style="--space: 0.5rem; width: 110px;"
						>
							<button
								style="all: unset !important;"
								on:click={() => {
									navigator.clipboard.writeText(
										`https://alexis.lol/l/${link.id}`,
									);

									link.isCopied = true;

									setTimeout(() => {
										link.isCopied = false;
									}, 2000);
								}}
							>
								{#if link.isCopied}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="check"
										viewBox="0 0 512 512"
										><path
											d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
											fill="none"
											stroke="currentColor"
											stroke-miterlimit="10"
											stroke-width="32"
										/><path
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="32"
											d="M352 176L217.6 336 160 272"
										/></svg
									>
								{:else}
									<abbr title="Copy Link">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="copy"
											viewBox="0 0 512 512"
											><rect
												x="128"
												y="128"
												width="336"
												height="336"
												rx="57"
												ry="57"
												fill="none"
												stroke="currentColor"
												stroke-linejoin="round"
												stroke-width="32"
											/><path
												d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24"
												fill="none"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="32"
											/></svg
										>
									</abbr>
								{/if}
							</button>
							<a
								target="_blank"
								href={`/l/${link.id}`}
								class="ff:mono"
							>
								{link.isCopied ? "Copied!" : link.id}
							</a>
						</td>
						<td style="min-width: 100%;">
							<abbr title={link.to}>
								{link.to}
							</abbr>
						</td>
						<td style="text-align: center;">{link.clicks}</td>
					</tr>
				{/each}
			</table>

			<div class="box invert" style="--padding: 0.75rem;">
				<div class="cluster" data-justify="space-between">
					<div class="cluster gap:-1">
						<ion-icon src="/eyes.svg" style="font-size: 20px;" />
						<span class="hide:sm">
							<p>Showing {x} – {y} of {z}</p>
						</span>
					</div>
					<div class="cluster">
						<button
							class="pagination-button"
							on:click={back}
							disabled={page === 0}
						>
							<svg
								style="margin-right: 0.1rem;"
								xmlns="http://www.w3.org/2000/svg"
								class="ionicon"
								viewBox="0 0 512 512"
								><path
									d="M321.94 98L158.82 237.78a24 24 0 000 36.44L321.94 414c15.57 13.34 39.62 2.28 39.62-18.22v-279.6c0-20.5-24.05-31.56-39.62-18.18z"
								/></svg
							>
						</button>
						<span> {page + 1} of {chunks.length}</span>
						<button
							class="pagination-button"
							on:click={next}
							disabled={page === chunks.length - 1}
						>
							<svg
								style="margin-left: 0.1rem;"
								xmlns="http://www.w3.org/2000/svg"
								class="ionicon"
								viewBox="0 0 512 512"
								><path
									d="M190.06 414l163.12-139.78a24 24 0 000-36.44L190.06 98c-15.57-13.34-39.62-2.28-39.62 18.22v279.6c0 20.5 24.05 31.56 39.62 18.18z"
								/></svg
							>
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
	@media (max-width: 429px) {
		.hide\:sm {
			display: none;
		}
	}

	.ionicon {
		display: block;
		width: 1rem;
		fill: var(--txt-1);
	}

	.copy,
	.check {
		display: block;
		width: 1rem;
		transition: transform 0.2s ease-in-out;
		fill: red !important;
	}

	.check {
		width: 1.15rem;
		fill: red;
	}

	.copy:hover,
	.copy:focus {
		cursor: pointer;
		transform: scale(1.2) rotate(5deg);
	}

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
		width: 50%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--bg-border);
		background-color: var(--bg-mute);
		border-radius: 0.5rem;
	}

	button {
		cursor: pointer;
		padding: 0.5rem 0.75rem;
		border: 1px transparent;
		background-color: var(--bg-mute);
		border-radius: 0.5rem;

		transition: all 0.2s ease-in-out;
	}

	button:not(:disabled) {
		background-color: var(--clr-500);
		color: white;
		font-weight: 500;
	}

	button:not(:disabled):hover {
		scale: 1.05;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	table {
		width: 100%;
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
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	table tr:last-child > td {
		border-bottom: none;
	}

	table tr:nth-child(even) {
		background-color: var(--bg-mute);
	}
</style>
