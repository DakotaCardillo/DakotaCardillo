<script
	lang="ts"
	module
>
	// Four vertices (x, y, z)
	const vertices = new Float32Array([
		-1, -1, 0,  // bottom left
		1, -1, 0,  // bottom right
		1, 1, 0,  // top right
		-1, 1, 0   // top left
	]);

	// Corresponding UVs for each vertex (u, v)
	const uvs = new Float32Array([
		0, 0,  // bottom left
		1, 0,  // bottom right
		1, 1,  // top right
		0, 1   // top left
	]);

	// Define indices for two triangles that form the quad
	const indices = new Uint16Array([
		0, 1, 2, // first triangle
		0, 2, 3  // second triangle
	]);

	const center = new Vector3(0);
</script>
<script lang="ts">
	import type { Props } from '@threlte/core';
	import { BufferAttribute, BufferGeometry, Sphere, Vector3 } from 'three';
	import { T } from '@threlte/core';

	let {
		ref = $bindable(new BufferGeometry()),
		children,
		...restProps
	}: Props<BufferGeometry> = $props();

	ref.setAttribute('position', new BufferAttribute(vertices, 3));
	ref.setAttribute('uv', new BufferAttribute(uvs, 2));
	ref.setIndex(new BufferAttribute(indices, 1));
	ref.boundingSphere = new Sphere().set(center, Infinity);
</script>
<T
	is={ref}
	{...restProps}
>
	{@render children?.({
		ref
	})}
</T>