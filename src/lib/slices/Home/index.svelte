<script lang="ts">
	import type { Content } from '@prismicio/client';
	import FloatingCard from '$lib/components/FloatingCard.svelte';
	import * as prismic from '@prismicio/client';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		// Intro title
		gsap.from('.slide-stagger', {
			y: 20,
			opacity: 0,
			duration: 0.7,
			stagger: 0.08,
			ease: 'power2.out'
		});
	});

	export let slice: Content.HomeSlice;

	const items = (slice.primary.page_link ?? []).map((pl, index) => {
		const label = pl.title ?? '';
		const normalized = label.toLowerCase().trim();
		const id = normalized.replace(/\s+/g, '-') || `link-${index}`;
		const href = prismic.asLink(pl.link) ?? '#';
		const iconName = pl.icon ?? null; // optional text field in slice, fallback to title mapping
		return { id, label, href, iconName };
	});
</script>

<!--<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>-->
<!--	<div class="flex w-full h-full bg-gradient-to-b from-neutral-700 to to-neutral-900 via-neutral-800">-->
<!--		<div class="flex flex-col flex-1 items-center place-content-start">-->
<!--			<h3 class="text-goldenrod  text-[clamp(1rem,3vmin,5rem)] text-nowrap">-->
<!--				<span>Tech Stack</span>-->
<!--				<IconUnreal />-->
<!--			</h3>-->
<!--			{#each slice.primary.techstack_item as item}-->
<!--					<span-->
<!--						class="text-goldenrod bg-goldenrod/10 outline-goldenrod outline-1 px-3 py-1 text-xs rounded-full m-2"-->
<!--					>-->
<!--						{item.name}-->
<!--					</span>-->
<!--				&lt;!&ndash;{#if item.icon}&ndash;&gt;-->
<!--				&lt;!&ndash;	<img&ndash;&gt;-->
<!--				&lt;!&ndash;		class="rounded-full"&ndash;&gt;-->
<!--				&lt;!&ndash;		src="{item.icon.url}"&ndash;&gt;-->
<!--				&lt;!&ndash;		alt="{item.icon.alt}"&ndash;&gt;-->
<!--				&lt;!&ndash;	/>&ndash;&gt;-->
<!--				&lt;!&ndash;{/if}&ndash;&gt;-->
<!--			{/each}-->
<!--		</div>-->
<!--		<div-->
<!--			class="flex flex-col flex-1/4 items-center place-content-start"-->
<!--		>-->
<!--			<div class="flex flex-row items-center">-->
<!--				<h1 class="text-goldenrod font-regular text-[clamp(3rem,7vmin,13rem)] ml-5 mr-5">-->
<!--					<span>{slice.primary.first_name}</span>-->
<!--				</h1>-->
<!--				<h1 class="text-goldenrod font-light text-[clamp(3rem,7vmin,13rem)] ml-5 mr-5">-->
<!--					<span>{slice.primary.last_name}</span>-->
<!--				</h1>-->
<!--			</div>-->
<!--			<h2 class="text-verdigris font-regular text-[clamp(3rem,5vmin,13rem)] mb-10">-->
<!--				<span>{slice.primary.title}</span>-->
<!--			</h2>-->
<!--			<div-->
<!--				class="flex flex-row items-center place-content-center outline-goldenrod outline-2 p-10 rounded-2xl">-->
<!--				{#each slice.primary.page_link as link}-->
<!--					<PrismicLink field={link.link}>-->
<!--						<div class="text-goldenrod w-[clamp(80px, 200px, 200px)] h-[clamp(80px, 200px, 200px)] m-2">-->
<!--							<span>{link.title}</span>-->
<!--							&lt;!&ndash;{#if link.video}&ndash;&gt;-->
<!--							&lt;!&ndash;	<video&ndash;&gt;-->
<!--							&lt;!&ndash;		class="aspect-square w-[150px] rounded-2xl"&ndash;&gt;-->
<!--							&lt;!&ndash;		src={link.video.text}&ndash;&gt;-->
<!--							&lt;!&ndash;		playsInline&ndash;&gt;-->
<!--							&lt;!&ndash;		muted&ndash;&gt;-->
<!--							&lt;!&ndash;		loop&ndash;&gt;-->
<!--							&lt;!&ndash;	></video>&ndash;&gt;-->
<!--							&lt;!&ndash;{/if}&ndash;&gt;-->
<!--						</div>-->
<!--					</PrismicLink>-->
<!--				{/each}-->
<!--			</div>-->
<!--		</div>-->
<!--		<div class="flex flex-col flex-1 items-center place-content-start text-seasalt">-->
<!--			{#if slice.primary.portrait}-->
<!--				<img-->
<!--					class="rounded-full"-->
<!--					src="{slice.primary.portrait.url}"-->
<!--					alt="{slice.primary.portrait.alt}"-->
<!--				/>-->
<!--			{/if}-->
<!--			<span>About</span>-->
<!--			<PrismicRichText-->
<!--				field={slice.primary.about_me}-->
<!--				components={{-->
<!--					label: Label-->
<!--				}}-->
<!--			/>-->
<!--		</div>-->
<!--	</div>-->
<!--</section>-->

<section class="flex-1">
	<div class="max-w-5xl mx-auto px-5 pt-10 pb-6">
		<header class="text-center md:text-left">
			<h1 class="slide-stagger text-4xl sm:text-5xl font-extrabold tracking-tight">
				<span class="text-zinc-100">{slice.primary.first_name} {slice.primary.last_name}</span>
				<span class="text-accent"> • </span>
				<span class="text-zinc-100">{slice.primary.title}</span>
			</h1>
			<!--			<p class="slide-stagger text-text-muted max-w-3xl mx-auto md:mx-0 mt-2">-->
			<!--				Welcome to my website!-->
			<!--			</p>-->
			<p class="slide-stagger text-text-muted max-w-3xl mx-auto md:mx-0 mt-2">
				10+ years building real-time games and simulations. Specialized in graphics performance, DevOps
				automation, and writing custom tools that accelerate development.
			</p>
			<div class="mt-5 flex justify-center md:justify-start gap-3">
				<a class="slide-stagger btn" href="/demos">View Demos</a>
				<a class="slide-stagger btn-ghost" href="/resume">View Resume</a>
				<a class="slide-stagger btn-ghost" href="https://www.linkedin.com/in/dakotacardillo">LinkedIn</a>
			</div>
		</header>
		<!-- <section class="max-w-5xl mx-auto px-5 mt-14">
			<h1 class="text-4xl md:text-5xl font-extrabold">Dakota Cardillo • Software Developer</h1>
			<p class="mt-2 text-zinc-400">Real-time simulation • Unreal Engine 5 • Tools</p>

		  </section> -->

		<!-- <section class="max-w-5xl mx-auto mt-10">
		<h2 class="text-xl font-bold underline-accent mb-4">Featured</h2>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
			<article class="card p-5">
			<div class="text-accent mb-2">📄</div>
			<h3 class="font-semibold">Resume</h3>
			<p class="text-zinc-400 mt-1">Highlights, experience, and recent work.</p>
			<a class="mt-3 inline-flex items-center gap-2 text-accent link-underline" href="/resume">View →</a>
			</article>
		</div>
		</section> -->

		<h2 class="slide-stagger text-xl font-bold underline-accent mb-4 mt-4">Featured</h2>
		<div class="slide-stagger mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
			{#each items as item}
				<FloatingCard {...item} />
			{/each}
		</div>
	</div>
</section>
