<script lang="ts">
	import type { Content } from '@prismicio/client';
	import Scene from './Scene.svelte';

	export let slice: Content.HeroSlice;

</script>

<section
	data-slice-type={slice.slice_type}
	data-slice-variation={slice.variation}
	class="w-screen h-screen"
>
	<div class="absolute top-0 left-0 w-full h-full bg-black z-[0]">
		<Scene />
	</div>
	<div class="absolute top-0 left-0 w-full h-full z-[10] pointer-events-none">
		<h1
			class="ml-8 mt-6 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z10 pointer-events-none">
			<span class="text-slate-500">
				>{slice.primary.first_name}_\
			</span>
		</h1>
		<h1
			class="ml-8 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z-10 pointer-events-none">
			<span class="text-slate-600">
				>{slice.primary.last_name}
			</span>
		</h1>
	</div>
	<!--	<div class="mx-auto w-full max-w-7xl">-->
	<!--		<div class="grid min-h-[65vh] grid-cols-1 items-center md:grid-cols-2">-->
	<!--			<div-->
	<!--				class="relative z-10 row-span-1 row-start-1 -my-10 aspect-[1/1.3] overflow-hidden md:col-span-1 md:col-start-2 md:mt-0"-->
	<!--			>-->
	<!--				<Scene />-->
	<!--			</div>-->
	<!--			<div class="col-start-1 md:row-start-1">-->
	<!--				<h1-->
	<!--					class="mb-2 md:mb-8 text-[clamp(3rem,20vmin,13rem)] leading-none font-extrabold tracking-tighter text-nowrap"-->
	<!--				>-->
	<!--					<span class="block text-slate-300">-->
	<!--						{slice.primary.first_name}-->
	<!--					</span>-->
	<!--					<span class="block text-slate-500 -mt-[.2em]">-->
	<!--						{slice.primary.last_name}-->
	<!--					</span>-->
	<!--				</h1>-->
	<!--				<span-->
	<!--					class="block bg-gradient-to-tr-->
	<!--				from-yellow-500 via-yellow-200 to-yellow-500-->
	<!--				bg-clip-text text-2xl font-bold tracking-[.2em] text-transparent-->
	<!--				uppercase md:text-4xl"-->
	<!--				>-->
	<!--					{slice.primary.title}-->
	<!--				</span>-->
	<!--			</div>-->
	<!--		</div>-->
</section>
