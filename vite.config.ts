import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		glsl({
			include: ['**/*.vert', '**/*.frag', '**/*.glsl', '**/*.wgsl']
		}),
		Icons({
			compiler: 'svelte',
			autoInstall: true
		})
	],
	server: {
		fs: {
			// Allow access to files from the project root.
			allow: ['..']
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext'
		}
	},
	build: {
		target: 'esnext'
	}
});
