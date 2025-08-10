<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { NAV_ITEMS } from '$lib/data/nav';
	import FloatingCard from '$lib/components/FloatingCard.svelte';
	import Label from '$lib/slices/RichText/Label.svelte';
	import { PrismicRichText, PrismicLink } from '@prismicio/svelte';
	import IconUnreal from '~icons/file-icons/unrealscript';

	export let slice: Content.HomeSlice;

  import IconGithub from '~icons/simple-icons/github';
  import IconNewspaper from '~icons/mdi/newspaper-variant';
  import IconFile from '~icons/ri/file-list-3-line';
  import IconCube from '~icons/mdi/cube-outline';
  import IconVideo from '~icons/ph/video-camera-duotone';


  const items = [
    { id: 'resume', label: 'Resume', href: '/resume', icon: IconFile },
	{ id: 'demos',  label: 'Demos',  href: '/demos',  icon: IconCube },
    { id: 'blog',   label: 'Blog',   href: '/blog',   icon: IconNewspaper },
    { id: 'github', label: 'GitHub', href: 'https://github.com/you', icon: IconGithub },
    { id: 'videos', label: 'Videos', href: '/videos', icon: IconVideo }
  ];
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
	<div class="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-10">
		<header class="text-center md:text-left space-y-5">
			<h1 class="text-3xl md:text-5xl font-extrabold tracking-tight">
				<span class="text-text"> {slice.primary.first_name} {slice.primary.last_name} </span>
				<span class="text-accent">·</span>
				<span class="text-text"> {slice.primary.title} </span>
			</h1>
			<p class="text-text-muted max-w-3xl mx-auto md:mx-0">
				{slice.primary.about_me}
			</p>
		</header>

		<div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
			{#each items as item}
				<FloatingCard {...item} />
			{/each}
		</div>

		<div class="mt-6 md:mt-10 text-center md:text-left">
			<p class="text-xs text-text-muted">
				Tip: click a card to enter via the navbar animation.
			</p>
		</div>
	</div>
</section>
