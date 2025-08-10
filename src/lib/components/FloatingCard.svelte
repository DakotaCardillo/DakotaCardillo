<script lang="ts">
	//import Icon from '$lib/components/icons/Icon.svelte';
	import type { Component } from 'svelte';

	export let id;
	export let label;
	export let href;
	// export let onClick: (e: MouseEvent, meta: CardClickMeta) => void = () => {
	// };

	type AnyProps = Record<string, unknown>;
	export let icon: Component<AnyProps> | null = null;
  	export let iconClass = 'text-accent';   // tweak with Tailwind if you like
  	export let iconSize = 28;               // px size for width/height

	let el: HTMLButtonElement | null;
</script>

<button
	bind:this={el}
	data-card={id}
	onclick={() => { window.location.href = href; }}
	class="relative glass rounded-2xl p-4 md:p-6 shadow-soft w-full h-32 md:h-40
	flex flex-col items-start justify-between hover:shadow-glow transition will-change-transform">
<!-- 
	<span class="absolute inset-0 -z-10 pointer-events-none glass
	bg-linear-to-br from-white/5 to-transparent"></span> -->
	<!-- <span
    aria-hidden="true"
    class="absolute inset-0 -z-10 pointer-events-none
           glass [filter:url(#displacementFromImage)]"
  ></span> -->

  {#if icon}
    <!-- Iconify components accept width/height/class -->
    <svelte:component this={icon} width={iconSize} height={iconSize} class={iconClass} />
  {/if}

	<div class="text-left">
		<h3 class="text-lg md:text-xl font-semibold">{label}</h3>
		<p class="text-xs md:text-sm text-text-muted">{href}</p>
	</div>
</button>
