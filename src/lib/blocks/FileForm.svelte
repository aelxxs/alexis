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
		setInterval(fetchfiles, 5000);
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
						<div class="stack">
							<img
								src={file.to}
								alt={file.to}
								class="file-preview"
							/>
							<div class="cluster" data-justify="space-between">
								<div class="cluster gap:0">
									<ion-icon name="eye-outline" />
									<p>{file.clicks}</p>
								</div>
								<div class="cluster">
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
