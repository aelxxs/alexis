<script lang="ts">
	import { onMount } from "svelte";

	let file: File | null = null;
	const PER_PAGE = 6;

	let page = 0;
	let pass = "";

	interface TFile {
		id: string;
		to: string;
		ex: number;
		clicks: number;
		createdAt: number;
		updatedAt: number;
		isCopied: boolean;
	}

	let files: TFile[] = [];

	const onSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		if (!file) {
			alert("Please select a file to upload.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("pass", pass);

		try {
			const response = await fetch("/api/files", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload file");
			}

			if (response.ok) {
				const fileOut = (await response.json()) as TFile & {
					id: string;
				};

				files = [fileOut, ...files];
			}
		} catch (error) {
			console.error("Error uploading file:", error);
		}
	};

	const handleFileChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target && target.files) {
			file = target.files[0];
		}
	};

	const fetchfiles = async () => {
		const data = await fetch("/api/files");
		const json = await data.json();

		files = json.files.map((file: TFile & { id: string }) => {
			return {
				...file,
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
		await fetchfiles();
		// setInterval(fetchfiles, 5000);
	});

	$: sorted = files.sort((a, b) => b.createdAt - a.createdAt);
	$: chunks = chunk(sorted, PER_PAGE);

	const next = () => {
		page = Math.min(page + 1, chunks.length - 1);
	};

	const back = () => {
		page = Math.max(page - 1, 0);
	};

	$: x = page * PER_PAGE + 1;
	$: y = page * PER_PAGE + chunks[page]?.length;
	$: z = files.length;

	const deleteFile = async (id: string) => {
		const response = await fetch("/api/files", {
			method: "DELETE",
			body: JSON.stringify({ id }),
		});

		if (response.ok) {
			files = files.filter((file) => file.id !== id);
		}
	};

	const copyToClipboard = (file: TFile, text: string) => {
		navigator.clipboard.writeText(text);

		console.log({ file });
		file.isCopied = true;

		setTimeout(() => {
			file.isCopied = false;
		}, 2000);
	};

	const formatDate = (date: number) => {
		const d = new Date(date);

		// Relative Time eg. 5 minutes ago, Today, Yesterday
		// const rtf = new Intl.RelativeTimeFormat("en", {
		// 	localeMatcher: "best fit",
		// 	numeric: "auto",
		// 	style: "long",
		// });

		// const diff = Date.now() - d.getTime();

		// if (diff < 60 * 1000) {
		// 	return "Just now";
		// }

		// if (diff < 60 * 60 * 1000) {
		// 	return rtf.format(-Math.floor(diff / 60 / 1000), "minutes");
		// }

		// if (diff < 24 * 60 * 60 * 1000) {
		// 	return rtf.format(-Math.floor(diff / 60 / 60 / 1000), "hours");
		// }

		// if (diff < 48 * 60 * 60 * 1000) {
		// 	return "Yesterday";
		// }

		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			// 24 hour format
			minute: "numeric",
		});
	};
</script>

<div class="stack">
	<form on:submit={onSubmit} class="stack gap:1">
		<div class="cluster">
			<input type="file" on:change={handleFileChange} />
			<input
				type="password"
				placeholder="🔒"
				autocomplete="off"
				data-lpignore="true"
				bind:value={pass}
			/>
			<button type="submit">Upload</button>
		</div>
	</form>

	{#if files.length}
		<div class="stack gap:1" style="margin-top: 1.75rem;">
			<div class="grid">
				{#each chunks[page] as file}
					<div class="box no-hover">
						<div class="stack" style="--space: 0.75rem;">
							<img
								src={file.to}
								alt={file.to}
								class="file-preview"
							/>
							<div>
								<div class="stack" style="--space: 0.25rem;">
									<p>
										<strong>
											{file.id}
										</strong>
									</p>
									<small class="txt:mute"
										>{formatDate(file.createdAt)}</small
									>
								</div>
							</div>
							<div class="cluster" data-justify="space-between">
								<div class="cluster" style="--space: 0.35rem;">
									<ion-icon
										name="eye-outline"
										class="txt:mute"
									/>
									<small>
										<strong>{file.clicks}</strong>
									</small>
								</div>
								<div class="cluster" style="--space: 0.75rem;">
									<button
										class="unset"
										on:click={() =>
											copyToClipboard(file, file.to)}
									>
										{#if file.isCopied}
											<ion-icon name="checkbox-outline" />
										{:else}
											<ion-icon
												name="clipboard-outline"
											/>
										{/if}
									</button>
									<a
										href={`${file.to}?download=1`}
										target="_blank"
										><ion-icon
											name="cloud-download-outline"
										/></a
									>
									<span class="vertical-sep"></span>
									<button
										class="unset"
										on:click={() => deleteFile(file.id)}
									>
										<ion-icon
											name="trash-outline"
											style="color: #e05d5d;"
										/>
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
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
							<ion-icon
								name="caret-back-outline"
								style="margin-right: 0.1rem;"
							/>
						</button>
						<span> {page + 1} of {chunks.length}</span>
						<button
							class="pagination-button"
							on:click={next}
							disabled={page === chunks.length - 1}
						>
							<ion-icon
								name="caret-forward-outline"
								style="margin-left: 0.1rem;"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>No files yet.</p>
	{/if}
</div>

<style>
	.vertical-sep {
		width: 1px;
		height: 1.25rem;
		background-color: var(--bg-border);
	}

	.unset {
		all: unset !important;
	}

	input[type="password"] {
		max-width: 6rem;
	}

	.file-preview {
		object-fit: cover;
		width: 100%;
		max-height: 100%;
		height: 200px;
		object-fit: cover;
		border-radius: 0.45rem;
	}

	@media (max-width: 429px) {
		.hide\:sm {
			display: none;
		}
	}

	ion-icon {
		transition: transform 0.2s ease-in-out;
	}

	ion-icon:hover,
	ion-icon:focus {
		cursor: pointer;
		transform: scale(1.2) rotate(2.5deg);
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
</style>
