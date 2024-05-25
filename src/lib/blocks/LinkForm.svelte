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
						<svg
							width={22}
							viewBox="0 6 32 26"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9.52777 7C4.83335 7 1.02777 10.8056 1.02777 15.5V22.5C1.02777 27.1944 4.83335 31 9.52777 31C12.1363 31 14.4695 29.8246 16.0278 27.9773C17.5861 29.8246 19.9193 31 22.5278 31C27.2222 31 31.0278 27.1944 31.0278 22.5V15.5C31.0278 10.8056 27.2222 7 22.5278 7C19.9193 7 17.5861 8.17537 16.0278 10.0227C14.4695 8.17537 12.1363 7 9.52777 7Z"
								fill="#9B9B9B"
							/>
							<path
								d="M9.52777 8C5.38564 8 2.02777 11.3579 2.02777 15.5V22.5C2.02777 26.6421 5.38564 30 9.52777 30C12.3062 30 14.7318 28.4891 16.0278 26.2442C17.3237 28.4891 19.7493 30 22.5278 30C26.6699 30 30.0278 26.6421 30.0278 22.5V15.5C30.0278 11.3579 26.6699 8 22.5278 8C19.7493 8 17.3237 9.51086 16.0278 11.7558C14.7318 9.51086 12.3062 8 9.52777 8Z"
								fill="white"
							/>
							<path
								d="M15.0278 15.5C15.0278 14.1363 15.3917 12.8577 16.0278 11.7558C15.1755 10.2794 13.8345 9.12044 12.226 8.5H12.059C13.1528 9.15625 13.9965 11.75 13.9965 13V25.125C13.9965 26.4997 13.8403 28.2181 12.06 29.5618C13.7422 28.9585 15.1463 27.7711 16.0278 26.2442C15.3917 25.1423 15.0278 23.8637 15.0278 22.5V15.5Z"
								fill="#D3D3D3"
							/>
							<path
								d="M30.0278 15.5C30.0278 12.309 28.035 9.58346 25.226 8.5H25.059C26.7153 9.59375 27.9653 11.5625 27.9653 13.0312V25C27.9653 26.3747 26.8407 28.2181 25.06 29.5618C27.9561 28.5231 30.0278 25.7535 30.0278 22.5V15.5Z"
								fill="#D3D3D3"
							/>
							<path
								d="M6.59027 13C4.65727 13 3.09027 14.567 3.09027 16.5V21.5C3.09027 23.433 4.65727 25 6.59027 25C8.52327 25 10.0903 23.433 10.0903 21.5V16.5C10.0903 14.567 8.52327 13 6.59027 13Z"
								fill="#321B41"
							/>
							<path
								d="M19.5278 13C17.5948 13 16.0278 14.567 16.0278 16.5V21.5C16.0278 23.433 17.5948 25 19.5278 25C21.4608 25 23.0278 23.433 23.0278 21.5V16.5C23.0278 14.567 21.4608 13 19.5278 13Z"
								fill="#321B41"
							/>
							<path
								d="M8.76628 16.861C9.13773 16.5518 9.12055 15.9188 8.7279 15.4471C8.33525 14.9754 7.71583 14.8437 7.34438 15.1528C6.97294 15.462 6.99012 16.0951 7.38277 16.5668C7.77541 17.0385 8.39483 17.1702 8.76628 16.861Z"
								fill="#F4F4F4"
							/>
							<path
								d="M21.7629 16.861C22.1343 16.5518 22.1171 15.9188 21.7245 15.4471C21.3318 14.9754 20.7124 14.8437 20.341 15.1528C19.9695 15.462 19.9867 16.0951 20.3793 16.5668C20.772 17.0385 21.3914 17.1702 21.7629 16.861Z"
								fill="#F4F4F4"
							/>
						</svg>
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
