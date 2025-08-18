<script lang="ts">
    import { page } from '$app/stores';
    let currentPath = $derived($page.url.pathname);

    function isActive(url: string) {
      if (url === '/') {
        return currentPath === url;
      } else {
        return currentPath.includes(url);
      }
    }

    const { navigation } = $props();
  </script>

<header class="sm:sticky fixed w-full sm:top-4 bottom-4 z-50">
  <nav class="mx-auto max-w-5xl px-4 py-2 rounded-full bg-surface/70
        backdrop-blur border border-zinc-800/60 shadow-soft">
    <div class="relative flex items-center justify-between py-5 sm:py-0">
    <a href="/" class="hidden sm:block font-bold tracking-tight text-zinc-200">Dakota Cardillo</a>

    <ul class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
      {#each navigation.data.links as item}
      <li><a href={item.link.url} class="{item.mobile_only ? 'sm:hidden flex' : ''} {isActive(item.link.url) ? 'text-accent bg-white/5' : ''} px-3 py-2 rounded-full hover:text-accent transition hover:shadow-glow hover:bg-white/5">{item.label}</a></li>
      {/each}
    </ul>

    <!-- <ul class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
      <li><a href="/" aria-current="page" class="sm:hidden flex px-3 py-2 rounded-full hover:text-accent transition hover:shadow-glow hover:bg-white/5">About</a></li>
      <li><a href="/demos" class="px-3 py-2 rounded-full hover:text-accent transition hover:shadow-glow hover:bg-white/5">Demos</a></li>
      <li><a href="/resume" class="px-3 py-2 rounded-full hover:text-accent transition
               hover:shadow-glow hover:bg-white/5">Resume</a></li>
      <li><a href="/blog" class="px-3 py-2 rounded-full hover:text-accent transition
               hover:shadow-glow hover:bg-white/5">Blog</a></li>
    </ul> -->
    <div class="hidden sm:flex">
      <a href="/DakotaCardillo_Resume.pdf" download rel="external" class="btn">Download PDF</a>
    </div>
    </div>
  </nav>
  </header>
  
  <!-- <div class="w-full flex justify-center pt-6 md:pt-8">
    <nav
      id="global-nav"
      class="glass transition-opacity duration-500 max-w-3xl w-[92%] md:w-auto px-3 md:px-5 py-2 rounded-pill shadow-soft border
             flex items-center justify-center gap-2 md:gap-3
             {navVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
      {#each NAV_ITEMS as item}
        <a
          data-nav-id={item.id}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noreferrer' : undefined}
          class="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm md:text-base text-text hover:text-accent transition
                 hover:shadow-glow hover:bg-white/5">
             {#if iconName}
                <Icon icon={iconName} width={18} height={18} class="text-accent group-hover:text-accent-alt" />
            {/if}
          <Icon name={item.icon} size={18} className="text-accent group-hover:text-accent-alt" />
          <span class="hidden sm:inline">{item.label}</span>
        </a>
      {/each}
    </nav>
  </div> -->
  
  <!-- <svelte:window on:show-nav={handleShowNav} /> -->
  