export type Demo = {
	slug: string;
	title: string;
	summary: string;
	year?: string;
	tags: string[];
	media: { poster: string; mp4?: string; webm?: string };
	links: { play?: string; watch?: string; read?: string; code?: string; download?: string };
	flagship?: boolean;
	interactive?: boolean;
	webgl?: {
		width: number;
		height: number;
		antialias: boolean;
	};
};

export const demos: Demo[] = [
	{
		slug: 'unreal-homelab',
		title: 'Unreal Homelab',
		summary: 'A home server setup for automating Unreal Engine 5 builds.',
		year: '2024',
		tags: ['Unreal', 'Tools', 'Build/CI'],
		media: { poster: '/poster.svg' },
		links: { read: '/demos/unreal-homelab' },
		flagship: false,
		interactive: false
	},
	{
		slug: 'ocean-simulation',
		title: 'Ocean Simulation',
		summary: 'An ocean simulation using FFT with compute shaders in WebGPU (WIP)',
		year: '2025',
		tags: ['WebGPU', 'Graphics', 'Simulation'],
		media: { poster: '/poster.svg' },
		links: { play: '/demos/ocean-simulation' },
		flagship: false,
		interactive: true,
		webgl: {
			width: 1000,
			height: 1000,
			antialias: true
		}
	},
	{
		slug: 'shell-texturing',
		title: 'Shell Texturing',
		summary: 'A simple demo of shell texturing in WebGL.',
		year: '2025',
		tags: ['WebGL', 'Graphics'],
		media: { poster: '/poster.svg' },
		links: { play: '/demos/shell-texturing' },
		flagship: false,
		interactive: true,
		webgl: {
			width: 1000,
			height: 1000,
			antialias: true
		}
	},
	{
		slug: 'blinn-phong',
		title: 'Blinn-Phong Shading',
		summary: 'A simple demo of Blinn-Phong shading in WebGL.',
		year: '2025',
		tags: ['WebGL', 'Graphics'],
		media: { poster: '/poster.svg' },
		links: { play: '/demos/blinn-phong' },
		flagship: false,
		interactive: true,
		webgl: {
			width: 1000,
			height: 1000,
			antialias: true
		}
	},
	{
		slug: 'lyra-fps-camera',
		title: 'Lyra-based FPS Camera (Destiny-like)',
		summary: 'Custom first-person pipeline with mannequin split for modular armor.',
		year: '2025',
		tags: ['Unreal', 'Gameplay', 'Rendering'],
		media: { poster: '/poster.svg' },
		links: { read: '/demos/lyra-fps-camera' },
		flagship: false
	},
	{
		slug: 'cell-counter',
		title: 'Cell Counter',
		summary:
			'Image processing application for counting cells in images of GCaMP expressed neurons using OpenCV and C++',
		year: '2017',
		tags: ['C++', 'OpenCV', 'Image Processing'],
		media: { poster: '/poster.svg' },
		links: { read: '/demos/cell-counter' },
		flagship: false
	},
	{
		slug: 'bullet-bloom',
		title: 'Bullet Bloom',
		summary: 'Unreal Engine 5 Demo for testing a bullet spread feature in FPS games.',
		year: '2021',
		tags: ['Unreal', 'Gameplay', 'C++'],
		media: { poster: '/poster.svg' },
		links: { read: '/demos/bullet-bloom' },
		flagship: false
	},
	{
		slug: 'unity-animation',
		title: 'Unity Motion Graphics',
		summary: 'Unity project for creating educational videos with 3D motion graphics',
		year: '2020',
		tags: ['Unity', 'Animation', 'Graphics'],
		media: { poster: '/poster.svg' },
		links: { read: '/demos/unity-animation' },
		flagship: false
	}
];
