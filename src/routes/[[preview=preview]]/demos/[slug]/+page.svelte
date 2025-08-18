<script lang="ts">
    import DemoDetail from '$lib/components/DemoDetail.svelte';
    // import ThreeCanvas from '$lib/ThreeCanvas.svelte'; // if interactive
    const { data } = $props();
    const demo = data.demo;
  </script>
  
  <article class="max-w-6xl mx-auto px-5 space-y-6">
    <!-- If this demo is ThreeJS/WebGL -->
    <!-- {#if demo?.interactive}
      <ThreeCanvas config={demo.webgl} />
    {/if} -->
    <DemoDetail demo={demo} />
  </article>