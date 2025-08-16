export type Demo = {
    slug: string;
    title: string;
    summary: string;
    year?: string;
    tags: string[];
    media: { poster: string; mp4?: string; webm?: string; };
    links: { live?: string; watch?: string; read?: string; code?: string; download?: string; };
    flagship?: boolean;
  };
  
  export const demos: Demo[] = [
    {
      slug: 'ue5-horde-perf',
      title: 'UE5 Horde + Perforce: 3× Faster Sync',
      summary: 'Modular workspaces, Zen-aware caching, and multi-threaded sync for big teams.',
      year: '2025',
      tags: ['Unreal','Tools','Build/CI'],
      media: { poster: '/poster.svg' },
      links: { read: '#/demos/ue5-horde-perf' },
      flagship: true
    },
    {
      slug: 'lyra-fps-camera',
      title: 'Lyra-based FPS Camera (Destiny-like)',
      summary: 'Custom first-person pipeline with mannequin split for modular armor.',
      year: '2025',
      tags: ['Unreal','Gameplay','Rendering'],
      media: { poster: '/poster.svg' },
      links: { read: '#/demos/lyra-fps-camera' },
      flagship: true
    },
    {
      slug: 'unity-regression',
      title: 'Unity UI Regression Recorder',
      summary: 'Record-replay harness for validation & discrepancy capture in trainers.',
      year: '2020',
      tags: ['Unity','Tools','Testing'],
      media: { poster: '/poster.svg' },
      links: { read: '#/demos/unity-regression' }
    }
  ];
  