<script lang="ts">
	import type { Content } from '@prismicio/client';

	export let slice: Content.DemoSlice;
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	Placeholder component for {slice.primary.title} (variation: {slice.variation}) Slices
</section>
