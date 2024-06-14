<script lang="ts">
	import { onMount } from "svelte";
	import * as test from "../scripts/highlight";
	const URL_REGEX = /\/([\w]*)\.?(\w*)?\#?(L[\d]*[\-?L[\d]*]?)?/;
	const SPAN_REGEX = /(<span [^>]+>)|(<\/span>)|(\n)/g;

	export let id: string;
	let hash: {
		l1: number;
		l2: number;
	};
	let html: HTMLElement;

	$: code = "";
	$: hide = html?.innerHTML.length === 0;
	$: mode = id ? "view" : "edit";

	const save = async (e) => {
		e.preventDefault();
		if (!code.trim().length) return;

		const response = await fetch("/api/pastes", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: code,
			}),
		});

		const { id } = await response.json();

		window.location.href = `/p/${id}`;
	};

	const transform = (text: string) => {
		const openTags: string[] = [];

		const lines = text.replace(SPAN_REGEX, (match) => {
			if (match === "\n") {
				return (
					"</span>".repeat(openTags.length) + "\n" + openTags.join("")
				);
			}

			if (match === "</span>") {
				openTags.pop();
			} else {
				openTags.push(match);
			}

			return match;
		});

		let html = "";

		for (const line of lines.split(/\n/)) {
			html += `<div class='line'>${line || "<br>"}</div>`;
		}

		return html;
	};

	onMount(() => {
		if (id) {
			(async () => {
				const response = await fetch(`/api/pastes/${id}`, {
					headers: {
						"Content-Type": "application/json",
					},
				});
				const { content } = await response.json();

				console.log({ content });

				code = content;

				const { value } = test.hljs.highlightAuto(content);

				html.innerHTML = transform(value);
			})();
		}
	});
</script>

<form class="box no-hover" style="position: relative; height: 45rem;">
	{#if mode === "edit"}
		<button on:click={save}>Test</button>
	{/if}
	<div class="wrapper">
		<div class="lines">
			{#each code.split("\n") as _, i}
				<span class="line txt:mute ff:mono">{i + 1}</span>
			{/each}
		</div>
		<pre class:hide={hide !== false}><code bind:this={html} /></pre>
		<div class:hide={hide === false} class="editor">
			<div contenteditable bind:innerText={code}></div>
			<textarea
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck="false"
				bind:value={code}
				class="ff:mono"
			></textarea>
		</div>
	</div>
</form>

<style>
	@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");

	form {
		margin-top: 1rem;
	}

	* {
		font-family: "JetBrains Mono", monospace !important;
		font-weight: 400;
		line-height: 1.2;
		font-size: 13px;
		/* color: var(--txt-1); */
	}
	.box {
		overflow-y: auto;
	}

	.wrapper {
		display: flex;
		overflow-y: hidden;
		flex-direction: row;
		min-width: 100%;
		min-height: 100%;
		background-color: var(--bg-alpha);
	}

	.lines {
		display: flex;
		flex-direction: column;
		position: relative;
		padding-right: 0.5em;
		margin-top: 0.06rem;
		text-align: end;
		user-select: none;
	}

	.line {
		cursor: pointer;
		padding: 0 0.5em;
	}

	.editor {
		position: relative;
		display: flex;
		width: 100%;
	}

	.editor > textarea {
		caret-color: var(--clr-500);
		position: absolute;
		overflow-y: hidden;
		height: 100%;
		width: 100%;
		border: none;
		outline: 0;
		tab-size: 4;
		resize: none;
		padding: 0;
		background-color: var(--bg-main);
		white-space: pre;
	}

	pre {
		width: 100%;
		margin-top: 0.06rem;
	}

	.hide {
		display: none;
	}

	code {
		tab-size: 4;
	}
</style>
