<script lang="ts">
	const { d } = $props();
	let el: HTMLElement | null = null;
	let visible = $state(false);
	let observer: IntersectionObserver | null = null;
	const onIntersect = (entries: IntersectionObserverEntry[]) => {
		if (entries[0].isIntersecting) {
			visible = true;
			observer?.disconnect();
		}
	};
	$effect(() => {
		observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' });
		el && observer.observe(el);
		return () => observer?.disconnect();
	});

</script>

<article bind:this={el} class="card overflow-hidden group">
	<div class="aspect-video bg-zinc-900">
		{#if visible}
			<video class="h-full w-full object-cover" autoplay muted loop playsinline poster={d.media.poster}>
				{#if d.media.webm}
					<source src={d.media.webm} type="video/webm" />
				{/if}
				{#if d.media.mp4}
					<source src={d.media.mp4} type="video/mp4" />
				{/if}
			</video>
		{/if}
	</div>
	<div class="p-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold">{d.title}</h3>
			{#if d.year}<span
				class="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30">{d.year}</span>{/if}
		</div>
		<p class="text-zinc-400 text-sm mt-1">{d.summary}</p>
		<div class="mt-3 flex flex-wrap gap-2 text-xs">
			{#each d.tags as t}<span class="border border-zinc-700 px-2 py-0.5 rounded">{t}</span>{/each}
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			{#if d.links.play}<a class="btn" href={d.links.play} on:click|preventDefault={(e) => {
														      const forceWebGL = e.shiftKey;       // Shift held = force WebGL
																	const url = new URL(window.location.origin + d.links.play);
																	url.searchParams.set('mode', forceWebGL ? 'webgl' : 'webgpu');
																	window.location.href = url.toString();
													 }} target="_self">Play</a>{/if}
			{#if d.links.watch}<a class="btn-ghost" href={d.links.watch} target="_self">Watch</a>{/if}
			{#if d.links.read}<a class="btn-ghost" href={d.links.read}>Read</a>{/if}
			{#if d.links.code}<a class="btn-ghost" href={d.links.code} target="_self">Code</a>{/if}
			{#if d.links.download}<a class="btn-ghost" href={d.links.download} target="_self">Download</a>{/if}
		</div>
	</div>
</article>
  