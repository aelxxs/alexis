<script lang="ts">
	import hljs from "highlight.js";
	import { beforeUpdate, onMount } from "svelte";

	let editor: HTMLTextAreaElement;
	const PER_PAGE = 6;

	let page = 0;
	type Hash = {
		l1: number | null;
		l2: number | null;
	};

	type Paste = {
		id: string;
		content: string;
		ex: number;
		clicks: number;
		createdAt: number;
		updatedAt: number;
	};

	export let paste: Paste;

	let pastes: Paste[] = [];

	let hash: Hash = { l1: null, l2: null };
	let html: HTMLElement;
	let code: string = "";

	$: hide = html?.innerHTML.length === 0;
	$: mode = paste ? "view" : "make";

	const edit = () => {
		html.innerHTML = "";
		mode = "edit";
	};

	const save = async (event: Event) => {
		event.preventDefault();

		if (!code.trim().length) return;

		let response: Response;

		if (mode === "edit") {
			response = await fetch(`/api/pastes`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: paste.id,
					content: code.trim(),
				}),
			});
		} else {
			response = await fetch("/api/pastes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: code.trim(),
				}),
			});
		}

		const { value } = hljs.highlightAuto(code);
		html.innerHTML = transform(value);

		const { id } = await response.json();

		window.history.pushState({}, "", `/p/${id}`);
	};

	const deletePaste = async (id: string) => {
		const response = await fetch(`/api/pastes`, {
			method: "DELETE",
			body: JSON.stringify({ id }),
		});

		if (response.ok) {
			pastes = pastes.filter((paste) => paste.id !== id);
		}
	};

	const transform = (text: string) => {
		let html = "";

		for (const line of text.split(/\n/)) {
			html += `<div class='line'>${line || "<br>"}</div>`;
		}

		return html;
	};

	const highlight = (code: HTMLElement, area: Hash, reset = false) => {
		const l1 = (area.l1 && --area.l1) ?? 0;
		const l2 = (area.l2 && --area.l2) ?? l1;

		const lines = code.getElementsByClassName("line");

		if (l1 < 0 || l2 > lines.length) return;

		for (const line of lines) {
			line.classList.remove(
				"highlighted",
				"rounded:md-tr",
				"rounded:md-br",
			);
		}

		if (reset) return;

		for (let i = l1; i <= l2; ++i) {
			if (l1 === l2) {
				lines[i].classList.add(
					"highlighted",
					"rounded:md-tr",
					"rounded:md-br",
				);
			} else {
				if (i === l1) {
					lines[i].classList.add("highlighted", "rounded:md-tr");
				} else if (i === l2) {
					lines[i].classList.add("highlighted", "rounded:md-br");
				} else {
					lines[i].classList.add("highlighted");
				}
			}
		}
	};

	const select = (event: MouseEvent | KeyboardEvent, ln: number) => {
		if (!html.innerHTML.length) return;

		if (hash.l1 === ln && hash.l2 === null) {
			hash.l1 = null;
			hash.l2 = null;
			window.history.pushState({}, "", "#");
			highlight(html, { ...hash }, true);
			return;
		}

		if (event.shiftKey) {
			if (hash.l1 && hash.l1 < ln) {
				hash.l2 = ln;
				window.history.pushState({}, "", `#L${hash.l1}-L${ln}`);
			} else if (hash.l1 && hash.l1 > ln) {
				if (hash.l2 === null) {
					hash.l2 = hash.l1;
				}
				hash.l1 = ln;

				window.history.pushState({}, "", `#L${ln}-L${hash.l2}`);
			} else {
				hash.l1 = ln;
				hash.l2 = null;
				window.history.pushState({}, "", `#L${ln}`);
			}
		} else {
			hash.l1 = ln;
			hash.l2 = null;
			window.history.pushState({}, "", `#L${ln}`);
		}

		highlight(html, { ...hash });
	};

	const fetchPastes = async () => {
		const data = await fetch("/api/pastes");
		const json = await data.json();

		pastes = json.pastes;
	};

	onMount(async () => {
		if (paste !== undefined) {
			const { value } = hljs.highlightAuto(paste.content);

			code = value;
			html.innerHTML = transform(value);

			if (window.location.hash) {
				const regex = /#L(\d+)(?:-L(\d+))?/;
				const match = window.location.hash.match(regex);

				if (match) {
					const [l1, l2] = match.slice(1);

					hash.l1 = +l1;
					hash.l2 = +l2 || hash.l1;
					highlight(html, { ...hash });
				}
			}
		}

		await fetchPastes();
		setInterval(fetchPastes, 5000);
	});

	const chunk = <T,>(array: T[], size: number) => {
		const length = Math.ceil(array.length / size);
		return Array.from({ length }, (_, i) => {
			return array.slice(i * size, i * size + size);
		});
	};

	$: sorted = pastes.sort((a, b) => b.createdAt - a.createdAt);
	$: chunks = chunk(sorted, PER_PAGE);

	const next = () => {
		page = Math.min(page + 1, chunks.length - 1);
	};

	const back = () => {
		page = Math.max(page - 1, 0);
	};

	$: x = page * PER_PAGE + 1;
	$: y = page * PER_PAGE + chunks[page]?.length;
	$: z = pastes.length;

	const formatDate = (date: number) => {
		const d = new Date(date);

		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
		});
	};
</script>

<form class="box no-hover">
	<div class="wrapper">
		{#if mode === "edit" || mode === "make"}
			<div class="controls">
				<div class="cluster gap:0">
					<button
						class="ff:editor"
						type="submit"
						on:click={edit}
						disabled={!html?.innerHTML.length}
					>
						Edit
					</button>
					<button
						class="ff:editor"
						type="submit"
						on:click={save}
						disabled={code.trim().length === 0}
					>
						Save
					</button>
				</div>
			</div>
		{/if}
		<div class="lines">
			{#each code.split("\n") as _, i}
				<span
					class="line txt:mute ff:editor"
					role="button"
					tabindex={0}
					on:keydown={(event) => {
						if (event.key === "Enter") {
							select(event, i + 1);
						}
					}}
					on:keyup={(event) => {
						if (event.key === "Enter") {
							select(event, i + 1);
						}
					}}
					on:click={(event) => select(event, i + 1)}>{i + 1}</span
				>
			{/each}
		</div>
		<div class="editor" class:hide={hide !== false}>
			<pre><code bind:this={html} class="ff:editor" /></pre>
		</div>
		<div class:hide={hide === false} class="editor">
			<div
				contenteditable
				style="overflow-y: hidden;"
				class="ff:editor"
				bind:innerText={code}
			/>
			<textarea
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck="false"
				class="ff:mono ff:editor"
				bind:value={code}
				bind:this={editor}
				on:keydown={(event) => {
					if (event.key === "Tab") {
						event.preventDefault();

						const start = editor.selectionStart;
						const end = editor.selectionEnd;

						editor.setRangeText("\t", start, end, "end");
					}
				}}
			/>
		</div>
	</div>
</form>

{#if mode === "make"}
	<h3 style="margin-top: 1.75rem;">Recent Pastes</h3>
	{#if pastes.length}
		<div class="stack gap:1" style="margin-top: 1.5rem;">
			<div class="grid" style="--minimum: 25ch">
				{#each chunks[page] as p}
					<div class="box no-hover">
						<div class="stack" style="--space: 0.5rem;">
							<a
								href={`/p/${p.id}`}
								class="fw:medium fs:md txt:main cluster gap:-1"
								>{p.id}<ion-icon name="open-outline"
								></ion-icon></a
							>

							<small class="txt:mute truncate">
								{p.content}
							</small>
							<div class="cluster" data-justify="space-between">
								<div class="cluster">
									<div
										class="cluster"
										style="--space: 0.35rem;"
									>
										<ion-icon
											name="eye-outline"
											class="txt:mute"
										/>
										<small>
											<strong>{p.clicks}</strong>
										</small>
									</div>
									<span class="vertical-sep"></span>

									<small class="txt:mute">
										{formatDate(p.createdAt)}
									</small>
								</div>

								<button
									class="unset"
									on:click={() => deletePaste(p.id)}
								>
									<ion-icon
										name="trash-outline"
										style="color: #e05d5d;"
									/>
								</button>
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
		<p>No pastes yet.</p>
	{/if}
{/if}

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");

	.truncate {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.vertical-sep {
		width: 1px;
		height: 1.25rem;
		background-color: var(--bg-border);
	}

	.unset {
		all: unset !important;
	}

	button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	form {
		margin-top: 1rem;
		max-height: 45rem;
	}

	.wrapper {
		display: flex;
		position: relative;
		min-width: 100%;
		min-height: 100%;
		overflow-y: hidden;
	}

	.controls {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}

	pre {
		// computed
		min-width: max(50%, 100%);
		> code {
			tab-size: 4;
		}
	}

	.editor {
		position: relative;
		display: flex;
		width: 100%;
		overflow-y: hidden;

		> textarea {
			position: absolute;
			overflow-y: hidden;
			height: 100%;
			width: 100%;
			border: none;
			outline: 0;
			tab-size: 4;
			resize: none;
			padding: 0;
			margin: 0;
			background-color: var(--bg-main);
			padding-left: 0.5rem;
		}
	}

	form.box {
		overflow-y: auto;
		height: 25rem;
	}

	.lines {
		display: flex;
		flex-direction: column;
		position: relative;
		text-align: end;
		user-select: none;

		.line {
			cursor: pointer;
			border-right: 1px solid var(--bg-border);
			padding-right: 0.5rem;

			&:hover {
				color: var(--txt-main) !important;
			}
		}
	}

	.ff\:editor {
		white-space: pre;

		font-family: "JetBrains Mono", monospace !important;
		font-weight: 400 !important;
		font-size: 13px !important;
		line-height: 17.5px !important;
	}

	.hide {
		display: none;
	}

	button:not(:disabled) {
		background-color: var(--clr-500);
		color: white;
		font-weight: 500;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
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

	ion-icon {
		transition: transform 0.2s ease-in-out;
	}

	ion-icon:hover,
	ion-icon:focus {
		cursor: pointer;
		transform: scale(1.2) rotate(2.5deg);
	}

	button {
		cursor: pointer !important;
		padding: 0.15rem 0.35rem;
		border: 1px transparent;
		background-color: var(--bg-mute);
		border-radius: 0.35rem;
		transition: all 0.2s ease-in-out;
	}
</style>
