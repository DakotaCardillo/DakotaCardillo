<script lang="ts">
    import DemoDetail from '$lib/components/DemoDetail.svelte';
    const { data } = $props();
    const demo = data.demo;
  </script>
  
  <article class="max-w-6xl mx-auto px-5 space-y-6">
    <DemoDetail demo={demo} />
  </article>