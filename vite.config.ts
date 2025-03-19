import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		glsl({
			include: ['**/*.vert', '**/*.frag', '**/*.glsl']
		})
	],
	server: {
		fs: {
			// Allow access to files from the project root.
			allow: ['..']
		}
	}
});
