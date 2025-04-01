<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Pane, Folder, List, Slider, Button, Checkbox } from 'svelte-tweakpane-ui';
	import type { ListOptions } from 'svelte-tweakpane-ui';

	const waveAlgoOptions: ListOptions<number> = {
		sum_of_sines: 0,
		exponential_sum_of_sines: 1,
		fractional_brownian_motion: 2,
		fast_forieuire_transform: 3
	} as const;

	const waveTypeOptions: ListOptions<number> = {
		sine: 0,
		circular: 1
	} as const;

	let waveCount = $state(4);
	let fragmentWaveCount = $state(40);
	let waveType = $state(0);
	let waveAlgorithm = $state(0);
	let wireframe = $state(false);

</script>

<div class="pointer-events-auto relative w-full h-full">

	<div class="absolute top-0 left-0 ml-4 mt-16 z-10">
		<Pane
			position="inline"
			title="Water"
		>
			<List
				bind:value={waveAlgorithm}
				label="Wave Algorithm"
				options={waveAlgoOptions}
			/>
			<List
				bind:value={waveType}
				label="Wave Type"
				options={waveTypeOptions}
				disabled={waveAlgorithm !== 0}
			/>
			<Slider
				label="Wave Count"
				bind:value={waveCount}
				min={0}
				max={waveAlgorithm === 2 ? 32 : 4}
				step={1}
			/>
			<Slider
				label="FBM Fragment Wave Count"
				bind:value={fragmentWaveCount}
				min={0}
				max={100}
				step={1}
				disabled={waveAlgorithm !== 2}
			/>
			<Checkbox
				label="Show Wireframe"
				bind:value={wireframe}
			/>
		</Pane>
	</div>

	<Canvas>
		<Scene {waveCount} {waveType} {waveAlgorithm} {wireframe} {fragmentWaveCount} />
	</Canvas>
</div>
