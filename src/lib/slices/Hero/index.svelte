<script lang="ts">
	import type { Content } from '@prismicio/client';
	import Scene from './Scene.svelte';

	export let slice: Content.HeroSlice;


	let translateX = 0;
	let translateY = 0;
	const maxTranslation = 50; // max translation in pixels

	function handleMouseMove(event) {
		const { clientX, clientY } = event;
		const { innerWidth, innerHeight } = window;
		// Normalize mouse coordinates to a range between -1 and 1.
		const offsetX = (clientX / innerWidth - 0.5) * 2;
		const offsetY = (clientY / innerHeight - 0.5) * 2;

		// Move in the opposite direction
		translateX = -offsetX * maxTranslation;
		translateY = -offsetY * maxTranslation;
	}
</script>

<section
	data-slice-type={slice.slice_type}
	data-slice-variation={slice.variation}
	class="w-screen h-screen bg-neutral-50"
>
<!--	<div class="absolute top-0 left-0 w-full h-full bg-black z-[0]">-->
<!--		<Scene />-->
<!--	</div>-->

	<!-- Fullscreen container that listens for mouse movement -->
	<div
		class="w-screen h-screen relative overflow-hidden"
		on:mousemove={handleMouseMove}
		aria-hidden="true"
	>
<!--		style="box-shadow: 0 0 200px rgba(0,0,0,0.9) inset"-->
		<!-- The grid container uses inline style for background gradients and transform -->
<!--		<div-->
<!--			class="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] transition-transform duration-75 ease-out"-->
<!--			style="-->
<!--				transform: translate({translateX}px, {translateY}px);-->
<!--				background-image:-->
<!--					linear-gradient(#eee 1px, transparent 1px, transparent 1px, transparent 20px),-->
<!--					linear-gradient(-90deg, #eee 1px, transparent 1px, transparent 1px, transparent 20px);-->
<!--				background-size: 30px 30px;-->
<!--    	"-->
<!--		>-->
<!--			<div class="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] transition-transform duration-75 ease-out"-->
<!--					 style="-->
<!--				transform: translate({translateX * 2}px, {translateY * 2}px);-->
<!--				background-image:-->
<!--					radial-gradient(circle, #888 1px, rgba(0, 0, 0, 0) 1px),-->
<!--					linear-gradient(#ddd 1px, transparent 1px, transparent 1px, transparent 20px),-->
<!--					linear-gradient(-90deg, #ddd 1px, transparent 1px, transparent 1px, transparent 20px);-->
<!--				background-size:-->
<!--					120px 120px,-->
<!--					60px 60px,-->
<!--					60px 60px;-->
<!--    	"></div>-->
<!--		</div>-->
<!--	</div>-->

		<div
				class="absolute top-0 left-0 w-full h-full z-[10] pointer-events-none"
				style="transform: translate({translateX * 0.5}px, {translateY * 0.5}px);"
		>
			<h1
				class="ml-8 mt-6 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-regular text-nowrap z-10 pointer-events-none">
				<span class="text-verdigris">
					{slice.primary.first_name}
				</span>
			</h1>
			<h1
				class="ml-8 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-regular text-nowrap z-10 pointer-events-none">
				<span class="text-nowrap">
					{slice.primary.last_name}
				</span>
			</h1>
		</div>

<!--	/* Vertical line: 90deg corresponds to a left-to-right gradient */-->
<!--	linear-gradient(90deg, transparent calc(50% - 1px), #ccc calc(50% - 1px), #ccc calc(50% + 1px), transparent calc(50% + 1px)),-->
<!--	/* Horizontal line: 0deg corresponds to a bottom-to-top gradient */-->
<!--	linear-gradient(0deg, transparent calc(50% - 1px), #ccc calc(50% - 1px), #ccc calc(50% + 1px), transparent calc(50% + 1px));-->

<!--	<div class="absolute top-0 left-0 w-full h-full z-[10] pointer-events-none">-->
<!--		<h1-->
<!--			class="ml-8 mt-6 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z10 pointer-events-none">-->
<!--			<span class="text-goldenrod">-->
<!--				{slice.primary.first_name}-->
<!--			</span>-->
<!--		</h1>-->
<!--		<h1-->
<!--			class="ml-8 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z-10 pointer-events-none">-->
<!--			<span class="text-goldenrod">-->
<!--				{slice.primary.last_name}-->
<!--			</span>-->
<!--		</h1>-->
<!--	</div>-->


	<!--	<div class="absolute top-0 left-0 w-full h-full z-[10] pointer-events-none">-->
	<!--		<h1-->
	<!--			class="ml-8 mt-6 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z10 pointer-events-none">-->
	<!--			<span class="text-slate-500">-->
	<!--				>{slice.primary.first_name}_\-->
	<!--			</span>-->
	<!--		</h1>-->
	<!--		<h1-->
	<!--			class="ml-8 mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-bold text-nowrap z-10 pointer-events-none">-->
	<!--			<span class="text-slate-600">-->
	<!--				>{slice.primary.last_name}-->
	<!--			</span>-->
	<!--		</h1>-->
	<!--	</div>-->


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
