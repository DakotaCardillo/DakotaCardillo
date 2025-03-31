<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { isFilled } from '@prismicio/client';
	import { PrismicLink } from '@prismicio/svelte';
	import IconGithub from '~icons/simple-icons/github';
	import IconLinkedin from '~icons/simple-icons/linkedin';

	export let settings: Content.SettingsDocument;
</script>

<footer>
	<div class="container mx-auto flex flex-col items-center justify-between mt-20 gap-6 py-8 sm:flex-row">
		<div class="name flex flex-col items-center justify-center gap-x-4 gap-y-2 sm:flex-row sm:justify-self-start">
			<a href="/" class="text-xl font-regular text-seasalt transition-color duration-100 hover:text-goldenrod">
				{settings.data.first_name} {settings.data.last_name}
			</a>
			<span class="text-3xl hidden font-extralight leading-0 text-seasalt sm:inline" aria-hidden="true">/</span>
			<p class="text-sm text-seasalt">
				© {new Date().getFullYear()} {settings.data.first_name} {settings.data.last_name}
			</p>
		</div>
		<div class="navigation" aria-label="Footer Navigation">
			<ul class="flex items-center gap-1">
				{#each settings.data.navigation as { link, label }, index}
					<li>
						<PrismicLink
							field={link}
							class="block px-3 py-1 text-base font-regular text-seasalt transition-color duration-10 hover:text-goldenrod"
						>
							{label}
						</PrismicLink>
					</li>
					{#if index < settings.data.navigation.length - 1}
						<span class="text-3xl hidden font-extralight leading-0 text-seasalt sm:inline" aria-hidden="true">/</span>
					{/if}
				{/each}
			</ul>
		</div>
		<div class="socials text-seasalt inline-flex justify-center sm:justify-end">
			{#if isFilled.link(settings.data.github_link) }
				<PrismicLink
					field={settings.data.github_link}
					class="p-2 text-2xl text-seasalt transition-all duration-10 hover:text-goldenrod hover:scale-125"
					aria-label={settings.data.first_name + ' ' + settings.data.last_name + '\'s ' + 'Github'}
				>
					<IconGithub />
				</PrismicLink>
			{/if}
			{#if isFilled.link(settings.data.linkedin_link) }
				<PrismicLink
					field={settings.data.linkedin_link}
					class="p-2 text-2xl text-seasalt transition-all duration-10 hover:text-goldenrod hover:scale-125"
					aria-label={settings.data.first_name + ' ' + settings.data.last_name + '\'s ' + 'LinkedIn'}
				>
					<IconLinkedin />
				</PrismicLink>
			{/if}
		</div>
	</div>
</footer>