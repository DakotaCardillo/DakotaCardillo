<script lang="ts">
	import type { Demo } from '$lib/data/demos';

	const { demos } = $props<{ demos: Demo[] }>();
	import DemoCard from '../../components/DemoCard.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.from('.slide-stagger', {
			y: 20,
			opacity: 0,
			duration: 0.7,
			stagger: 0.08,
			ease: 'power2.out'
		});
	});

	const tags: string[] = ['Unreal', 'Unity', 'C++', 'C#/.NET', 'WebGPU', 'Rendering', 'Graphics', 'Gameplay', 'Tools', 'Build/CI', 'Animation', 'OpenCV', 'Image Processing'];
	let query = $state('');
	let active = $state(new Set<string>());
	const toggle = (t: string) => {
		active.has(t) ? active.delete(t) : active.add(t);
		active = new Set(active);
	};
	const filtered = $derived(
		demos.filter((d: Demo) =>
			([...active].every(t => d.tags.includes(t))) &&
			(d.title.toLowerCase().includes(query.toLowerCase()) || d.summary.toLowerCase().includes(query.toLowerCase()))
		)
	);
</script>

<section class="flex-1">
	<div class="max-w-5xl mx-auto px-5 pt-10 pb-6 text-center md:text-left">
		<h1 class="slide-stagger text-3xl font-extrabold tracking-tight">Demos - Coming Soon!</h1>
		<!--		<p class="slide-stagger mt-2 text-zinc-400">Filter by capability and engine. Click a card to read or watch—desktop builds link to downloads/videos.</p>-->
		<p class="slide-stagger mt-2 text-zinc-400">Each card represents a personal project I've worked on.
			Full page write-ups and interactive demos are currently in the works.</p>

		<div class="slide-stagger mt-5 flex flex-wrap gap-2">
			<input class="w-full sm:w-64 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
						 placeholder="Search demos…" bind:value={query} />
			{#each tags as t}
				<button class="px-3 py-1.5 rounded-full border text-sm
					   {active.has(t) ? 'bg-accent text-black border-accent' : 'bg-transparent border-zinc-700 text-zinc-300'}"
								onclick={() => toggle(t)}>{t}</button>
			{/each}
		</div>

		{#if demos.some((d: Demo) => d.flagship)}
			<h2 class="slide-stagger mt-8 text-xl font-bold underline-accent">Featured</h2>
			<div class="slide-stagger grid md:grid-cols-3 gap-4 mt-3">
				{#each filtered.filter((d: Demo) => d.flagship) as d}
					<div id={d.slug}>
						<DemoCard {d} />
					</div>
				{/each}
			</div>
		{/if}

		<h2 class="slide-stagger mt-8 text-xl font-bold underline-accent">All Demos</h2>
		<div class="slide-stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
			{#each filtered as d}
				<div id={d.slug}>
					<DemoCard {d} />
				</div>
			{/each}
		</div>
	</div>
</section>

  