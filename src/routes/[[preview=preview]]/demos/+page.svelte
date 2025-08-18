<script lang="ts">
    import DemoGrid from '$lib/slices/DemoGrid/index.svelte';
    const { data } = $props();      // runes: page data from load()
    const demos = data.demos;
  </script>
  
  <section class="max-w-6xl mx-auto px-5 pb-24 sm:pb-10">
    <DemoGrid demos={demos} />
  </section>