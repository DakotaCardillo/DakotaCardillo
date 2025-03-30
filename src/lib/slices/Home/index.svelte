<script lang="ts">
	import type { Content } from '@prismicio/client';
	import Label from '$lib/slices/RichText/Label.svelte';
	import { PrismicRichText } from '@prismicio/svelte';

	export let slice: Content.HomeSlice;
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	<div class="flex w-screen h-screen bg-neutral-800">
		<div class="flex flex-col flex-1 items-center place-content-start">
			<h3 class="text-goldenrod  text-[clamp(1rem,3vmin,5rem)] text-nowrap">
				<span>Tech Stack</span>
			</h3>
			{#each slice.primary.techstack_item as item}
					<span
						class="text-goldenrod bg-goldenrod/10 outline-goldenrod outline-1 px-3 py-1 text-xs rounded-full m-2"
					>
						{item.name}
					</span>
				<!--{#if item.icon}-->
				<!--	<img-->
				<!--		class="rounded-full"-->
				<!--		src="{item.icon.url}"-->
				<!--		alt="{item.icon.alt}"-->
				<!--	/>-->
				<!--{/if}-->
			{/each}
		</div>
		<div
			class="flex flex-col flex-1/4 items-center place-content-start"
		>
			<div class="flex flex-row items-center">
				<h1 class="text-goldenrod font-regular text-[clamp(3rem,7vmin,13rem)] ml-5 mr-5">
					<span>{slice.primary.first_name}</span>
				</h1>
				<h1 class="text-goldenrod font-light text-[clamp(3rem,7vmin,13rem)] ml-5 mr-5">
					<span>{slice.primary.last_name}</span>
				</h1>
			</div>
			<h2 class="text-verdigris font-regular text-[clamp(3rem,5vmin,13rem)] mb-10">
				<span>{slice.primary.title}</span>
			</h2>
			<div
				class="flex flex-row items-center place-content-center outline-goldenrod outline-2 p-10 rounded-2xl">
				{#each slice.primary.page_link as link}
					<div class="text-goldenrod w-[clamp(80px, 200px, 200px)] h-[clamp(80px, 200px, 200px)] m-2">
						<span>{link.title}</span>
						{#if link.video}
							<embed
								class="aspect-square w-[150px] rounded-2xl"
								src="{link.video.embed_url}"
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<div class="flex flex-col flex-1 items-center place-content-start text-seasalt">
			{#if slice.primary.portrait}
				<img
					class="rounded-full"
					src="{slice.primary.portrait.url}"
					alt="{slice.primary.portrait.alt}"
				/>
			{/if}
			<span>About</span>
			<PrismicRichText
				field={slice.primary.about_me}
				components={{
					label: Label
				}}
			/>
		</div>
	</div>
</section>
