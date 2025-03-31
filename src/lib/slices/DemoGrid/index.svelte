<script lang="ts">
	import type { Content } from '@prismicio/client';

	export let slice: Content.DemoGridSlice;
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	<div class="container grid grid-cols-3">
		{#each slice.primary.demo_preview as preview, index}
			<div class="container columns-[{index}]">
				<span class="text-seasalt text-2xl">{preview.title}</span>
			</div>
		{/each}
	</div>
</section>
