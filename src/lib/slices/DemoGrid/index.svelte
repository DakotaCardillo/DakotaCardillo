<script lang="ts">
	import type { Content } from '@prismicio/client';
	import type { SvelteComponent } from 'svelte';
	import gsap from 'gsap';
	import WaterSimulation from '$lib/demos/WaterSimulationn/index.svelte';
	import ShellTexturing from '$lib/demos/ShellTexturing/index.svelte';
	import BlinnPhong from '$lib/demos/BlinnPhong/index.svelte';

	export let slice: Content.DemoGridSlice;

	let activeDemo: SvelteComponent | null = null;
	let activeSlug: string | null;
	let activeVideoURL: string | null;
	let isTransitioning = false;
	let isExpandingOrShrinking = false;
	let overlayElement: HTMLDivElement;
	let clickedElement: HTMLElement;
	let demoContainerElement: HTMLElement;
	let originalParent: HTMLElement;
	let originalNextSibling: Node | null = null;

	let clickedElementOriginalStyles = { top: '', left: '', width: '', height: '' };

	const demoMap = new Map();

	demoMap.set('water-simulation', WaterSimulation);
	demoMap.set('shell-texturing', ShellTexturing);
	demoMap.set('blinn-phong', BlinnPhong);

	const videoMap = new Map();

	const previews = slice.primary.demo_preview;

	previews.forEach((preview) => {
		videoMap.set(String(preview.slug), String(preview.video.embed_url));
	});

	function handlePreviewClick(slug: string, event: MouseEvent) {
		activeSlug = slug;
		activeVideoURL = videoMap.get(slug);
		activeDemo = demoMap.get(slug);
		isTransitioning = true;
		isExpandingOrShrinking = true;

		// Get the clicked video element, in addition to its parent and next sibling
		clickedElement = event.currentTarget as HTMLElement;
		originalParent = clickedElement.parentElement;
		originalNextSibling = clickedElement.nextSibling;

		// Set the dimensions of the overlay to equal that of the clicked elemnt
		const rect = clickedElement.getBoundingClientRect();
		clickedElementOriginalStyles = {
			top: `${rect.top}px`,
			left: `${rect.left}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`
		};
		overlayElement.style.position = 'fixed';
		overlayElement.style.top = `${rect.top}px`;
		overlayElement.style.left = `${rect.left}px`;
		overlayElement.style.width = `${rect.width}px`;
		overlayElement.style.height = `${rect.height}px`;
		overlayElement.style.opacity = '1';
		overlayElement.style.zIndex = '1000';

		// Remove the video from its original container and add it to the overlay
		overlayElement.appendChild(clickedElement);

		const demoRect = demoContainerElement.getBoundingClientRect();

		// Animate the overlay to expand to the size of the demo component
		gsap.to(overlayElement, {
			duration: 0.25,
			top: demoRect.top,
			left: demoRect.left,
			width: demoRect.width,
			height: demoRect.height,
			padding: 10,
			ease: 'power2.in',
			onComplete: () => {
				isExpandingOrShrinking = false;
				// After expansion, fade out the overlay over 1 second.
				gsap.to(overlayElement, {
					duration: 0.25,
					opacity: 0,
					onComplete: () => {
						isTransitioning = false;
					}
				});
			}
		});
	}

	function handleBack() {

		isTransitioning = true;

		gsap.to(overlayElement, {
			duration: 0.25,
			opacity: 1,
			onComplete: () => {
				isExpandingOrShrinking = true;
				gsap.to(overlayElement, {
					duration: 0.25,
					top: clickedElementOriginalStyles.top,
					left: clickedElementOriginalStyles.left,
					width: clickedElementOriginalStyles.width,
					height: clickedElementOriginalStyles.height,
					padding: 0,
					ease: 'power2.out',
					onComplete: () => {
						if (clickedElement && originalParent) {
							if (originalNextSibling) {
								originalParent.insertBefore(clickedElement, originalNextSibling);
							} else {
								originalParent.appendChild(clickedElement);
							}
						}
						overlayElement.style.opacity = '0';
						activeDemo = null;
						activeSlug = null;
						activeVideoURL = null;
						isTransitioning = false;
						isExpandingOrShrinking = false;
					}
				});
			}
		});
	}
</script>

<section
	data-slice-type={slice.slice_type} data-slice-variation={slice.variation}
	class="w-screen h-screen"
>
	<div class="bg-neutral-800 w-full h-full">

		{#if !activeDemo || isExpandingOrShrinking}
			<div class="grid grid-cols-3 w-full h-full bg-neutral-800">
				{#each slice.primary.demo_preview as preview, index}
					<div class="w-full p-3 place-content-center">
						<span class="text-seasalt text-2xl">{preview.title}</span>
						<div class="video-container w-full h-max aspect-video">
							<video
								onclick={(e) => handlePreviewClick(String(preview.slug), e)}
								src={preview.video.text}
								class="rounded-2xl bg-transparent"
								playsinline
								autoplay
								loop
								muted
							>
							</video>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!--		<div class="pointer-events-none fixed inset-0 z-0 bg-transparent p-10">-->
		<!--			<div class="rounded-2xl w-full h-full overflow-hidden">-->
		<!--			</div>-->
		<!--		</div>-->
		<div bind:this={overlayElement}
				 class="fixed pointer-events-none inset-0 rounded-2xl overflow-hidden bg-transparent"></div>

		<div class="pointer-events-none fixed inset-0 z-0 bg-transparent p-10">
			<div bind:this={demoContainerElement} class="pointer-events-none rounded-2xl w-full h-full overflow-hidden">
				{#if activeDemo && !isExpandingOrShrinking}
					<svelte:component this={activeDemo} />
					<button
						class="pointer-events-auto absolute top-14 left-14 z-10 text-seasalt outline-2 bg-white/50 rounded-full outline-seasalt px-3 py-1"
						onclick={handleBack}>
						Back
					</button>
				{/if}
			</div>
		</div>
	</div>
</section>
