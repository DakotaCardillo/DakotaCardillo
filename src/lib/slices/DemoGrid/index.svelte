<script lang="ts">
	import { demos } from '../../data/demos';
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

	const tags: string[] = ['Unreal','Unity','C++','C#/.NET','WebGL','Rendering','Gameplay','Tools','Build/CI','Testing','Performance','Web'];
	let query = $state('');
	let active = $state(new Set<string>());
	const toggle = (t: string) => { active.has(t) ? active.delete(t) : active.add(t); active = new Set(active); };
	const filtered = $derived(
	  demos.filter(d =>
		([...active].every(t => d.tags.includes(t))) &&
		(d.title.toLowerCase().includes(query.toLowerCase()) || d.summary.toLowerCase().includes(query.toLowerCase()))
	  )
	);
  </script>
  
  <section class="max-w-5xl mx-auto px-5 mt-10">
	<h1 class="slide-stagger text-3xl font-extrabold tracking-tight">Demos</h1>
	<p class="slide-stagger mt-2 text-zinc-400">Filter by capability and engine. Click a card to read or watch—desktop builds link to downloads/videos.</p>
  
	<div class="slide-stagger mt-5 flex flex-wrap gap-2">
	  <input class="w-full sm:w-64 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700"
			 placeholder="Search demos…" bind:value={query} />
	  {#each tags as t}
		<button class="px-3 py-1.5 rounded-full border text-sm
					   {active.has(t) ? 'bg-accent text-black border-accent' : 'bg-transparent border-zinc-700 text-zinc-300'}"
				onclick={() => toggle(t)}>{t}</button>
	  {/each}
	</div>
  
	{#if demos.some(d => d.flagship)}
	  <h2 class="slide-stagger mt-8 text-xl font-bold underline-accent">Featured</h2>
	  <div class="slide-stagger grid md:grid-cols-3 gap-4 mt-3">
		{#each filtered.filter(d=>d.flagship) as d}
		  <DemoCard {d}/>
		{/each}
	  </div>
	{/if}
  
	<h2 class="slide-stagger mt-8 text-xl font-bold underline-accent">All demos</h2>
	<div class="slide-stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
	  {#each filtered as d}
		<DemoCard {d}/>
	  {/each}
	</div>
  </section>
  