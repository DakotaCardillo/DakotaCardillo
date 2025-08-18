<script>
    const { demo } = $props();
  </script>
  
 
  {#if !demo}
    <section class="max-w-5xl mx-auto px-5 mt-10">
        <a href="/demos" class="text-sm text-zinc-400 hover:underline">← Back</a>
      <p class="text-zinc-400">Demo not found.</p>
    </section>
  {:else}
    <article class="max-w-5xl mx-auto px-5 mt-10 space-y-6">
        <a href="/demos" class="text-sm text-zinc-400 hover:underline">← Back</a>
      <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">{demo.title}</h1>
          <p class="text-zinc-400 mt-1">{demo.summary}</p>
        </div>
        <div class="flex flex-wrap gap-2 text-xs">
          {#each demo.tags as t}<span class="border border-zinc-700 px-2 py-0.5 rounded">{t}</span>{/each}
        </div>
      </header>
  
      <div class="card overflow-hidden">
        <div class="aspect-video bg-zinc-900">
          <img src={demo.media.poster} alt="poster" class="h-full w-full object-cover" />
        </div>
      </div>
  
      <section class="card p-6 md:p-8">
        <h2 class="text-xl font-bold underline-accent mb-4">Case Study (outline)</h2>
        <ol class="list-decimal pl-6 space-y-2 text-zinc-300">
          <li><span class="font-semibold">Problem:</span> Describe the challenge, constraints, and goals.</li>
          <li><span class="font-semibold">Approach:</span> Architecture, key techniques, trade-offs.</li>
          <li><span class="font-semibold">Results:</span> Numbers: fps, memory, build time, accuracy, etc.</li>
          <li><span class="font-semibold">What’s interesting:</span> Two technical highlights.</li>
        </ol>
  
        <div class="mt-5 flex flex-wrap gap-2">
          {#if demo.links.live}<a class="btn" href={demo.links.live} target="_blank">Live</a>{/if}
          {#if demo.links.watch}<a class="btn-ghost" href={demo.links.watch} target="_blank">Watch</a>{/if}
          {#if demo.links.code}<a class="btn-ghost" href={demo.links.code} target="_blank">Code</a>{/if}
          {#if demo.links.download}<a class="btn-ghost" href={demo.links.download} target="_blank">Download</a>{/if}
        </div>
      </section>
    </article>
  {/if}
  