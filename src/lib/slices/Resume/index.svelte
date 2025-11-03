<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	// ────────────────────────────────────────────────────────────────────────────────
	// Data (reworded + condensed from the uploaded resume)
	// ────────────────────────────────────────────────────────────────────────────────
	const profile = {
		name: 'Dakota Cardillo',
		title: 'Senior Software Engineer',
		domain: 'Simulation • DevOps • Graphics',
		email: 'Dakota.Cardillo@pm.me',
		phone: '(631) 276-9148',
		location: 'USA',
		clearance: 'Active Secret Clearance',
		links: {
			linkedin: 'https://www.linkedin.com/in/dakotacardillo/'
		}
	};

	// Use a small rune so we can demo Svelte 5. Toggle to show condensed/full bullets.
	let compact = $state(true);

	const highlights = [
		'Directed multi‑disciplinary teams delivering large‑scale UE5 VR simulations.',
		'Re‑engineered Perforce/Zen workflows; 3× faster sync & clone times.',
		'Built automated regression testing for real‑time apps (Unreal/Unity).',
		'Shipped secure financial data tooling (PII‑safe tax ID encryption).'
	];

	const skills = [
		{
			label: 'Core',
			items: ['Real-Time Simulation', 'Multiplayer / Networking', 'Performance Optimization', 'Design Patterns', 'CI/CD Systems', 'Advanced Debugging', '3D Rendering']
		},
		{
			label: 'Languages & Tools',
			items: ['Unreal Engine', 'Unity', 'C/C++', 'C#/.NET', 'SQL', 'Python', 'JavaScript', 'Perforce', 'Git', 'Jenkins', 'Docker', 'Visual Studio', 'CMake', 'Blender']
		},
		{
			label: 'Unreal Systems',
			items: ['Slate', 'Unreal Insights', 'Unreal Horde', 'Zen Server', 'Gameplay Ability System', 'XR/VR', 'Unreal Build Tool']
		}
	];

	const experience = [
		{
			company: 'Applied Research Associates',
			title: 'Senior Software Engineer',
			period: '2023 — Present',
			bullets: [
				'Led a cross-disciplinary UE5 VR team (dev/art/QA) to deliver features for experimental hardware on aggressive timelines.',
				'Re-engineered Perforce and UE project structure, yielding 3× faster syncs via multithreaded sync.',
				'Standardized UE workflows company-wide (UGS, Horde, Zen DDC) and instituted automated regression testing.',
				'Mentored junior/intermediate engineers and instituted consistent code/debug practices.',
				'Led automated regression testing strategies with developer training and suggestions on server optimization.'
			]
		},
		{
			company: 'SS&C Advent — Black Diamond',
			title: 'Mid‑Level Software Engineer',
			period: '2020 — 2023',
			bullets: [
				'Built C# services with complex SQL to reconcile cost-basis data at scale.',
				'Added custodial interfaces to process bulk transactions for thousands of clients.',
				'Implemented PII-safe tax-ID encryption to enable secure financial portfolio tracking.',
				'Delivered full-stack features after ramping on React/Redux, Docker, and database tooling.'
			]
		},
		{
			company: 'The Boeing Company',
			title: 'Software Engineer / Scrum Master',
			period: '2019 — 2020',
			bullets: [
				'Served as development lead and Scrum Master for 737/P-8A and AH-6i virtual maintenance trainers.',
				'Created automated regression suite to record & validate discrepancies across Unity and C++ backend.',
				'Built workflow tools that removed artist/engineer bottlenecks (prefab loading, selection, search).',
				'Implemented features across aircraft systems (flight controls, MCP, hydraulics).'
			]
		},
		{
			company: 'System Service Enterprises (SSE)',
			title: 'Software Engineer',
			period: '2016 — 2019',
			bullets: [
				'Developed a procedural animation system for realistic simulation of flight‑control mechanisms.',
				'Built a low‑latency VNC streaming layer inside Unity for in-game control of virtual desktops.',
				'Led an FAA demo of a lightweight virtual trainer (360° media + XML).'
			]
		}
	];

	const projects = [
		{
			name: 'Slayer — FPS on Lyra (WIP)',
			stack: ['Unreal Engine 5', 'Blender'],
			desc: 'Destiny‑style first‑person camera; mannequin split to support modular armor.',
			year: '2025'
		},
		{
			name: 'Home Server for Unreal Horde',
			stack: ['Proxmox', 'Horde', 'Perforce', 'Tailscale'],
			desc: 'Windows/Ubuntu VMs host Horde & P4; remote commits trigger incremental builds.',
			year: '2024'
		},
		{
			name: 'Unity Animation Tools for Motion Graphics',
			stack: ['Unity', 'Blender', 'Blend Shapes', 'Animation Tweening'],
			desc: 'A motion graphics project made with Unity; illustrating how 3D models are created using custom animation scripts.',
			year: '2020'
		},
		{
			name: 'Cell Counter (PC)',
			stack: ['C++', 'OpenCV'],
			desc: 'Counts G‑CaMP neurons via filtering & color analysis; accurate per‑image totals.',
			year: '2017'
		}
	];

	const education = {
		school: 'Full Sail University',
		degree: 'B.S. — Game Development',
		year: '2016',
		notes: 'Course Director’s Award in Windows Tools Programming & Game Engine Development'
	};

	// ────────────────────────────────────────────────────────────────────────────────
	// Animations
	// ────────────────────────────────────────────────────────────────────────────────
	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		// Intro title
		gsap.from('.slide-stagger', {
			y: 20,
			opacity: 0,
			duration: 0.7,
			stagger: 0.08,
			ease: 'power2.out'
		});

		// Section reveals
		document.querySelectorAll('.reveal').forEach((el) => {
			gsap.from(el, {
				opacity: 0,
				y: 24,
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: el,
					start: 'top 85%'
				}
			});
		});

		// Timeline items – slide in slightly
		document.querySelectorAll('.timeline-item').forEach((el, i) => {
			gsap.from(el, {
				opacity: 0,
				x: -16,
				duration: 0.6,
				ease: 'power2.out',
				delay: i * 0.05,
				scrollTrigger: {
					trigger: el,
					start: 'top 90%'
				}
			});
		});
	});

	const { slice } = $props<{ slice: Content.ResumeSlice }>();

</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	<!-- Page container -->
	<div class="min-h-screen">
		<header class="max-w-5xl mx-auto px-5 pt-10 pb-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<h1 class="slide-stagger text-4xl sm:text-5xl font-extrabold tracking-tight">
						<span class="text-zinc-100">{profile.name}</span>
						<span class="text-accent"> • </span>
						<span class="text-zinc-100">{profile.title}</span>
					</h1>
					<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div>
							<p class="slide-stagger text-2xl mt-3 text-accent">{profile.domain}</p>
							<p class="slide-stagger mt-3 text-zinc-400">{profile.clearance}</p>
						</div>
						<div
							class="slide-stagger mt-3 grid grid-cols-[max-content_1fr] gap-2 text-right text-sm text-zinc-400 md:text-base">
							<div class="font-semibold text-zinc-300">Email</div>
							<div><a class="link-underline" href={"mailto:" + profile.email}>{profile.email}</a></div>
							<div class="font-semibold text-zinc-300">Phone</div>
							<div>{profile.phone}</div>
						</div>
					</div>

					<div class="slide-stagger mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
						<a class="btn" href="/DakotaCardillo_Resume.pdf" download>Download PDF</a>
						<a class="btn-ghost" href={"mailto:" + profile.email}>Email</a>
						<a class="btn-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
						<!--<button class="btn-ghost" onclick={() => compact = !compact}>
							{compact ? 'Expand details' : 'Condense details'}
						</button>-->
					</div>

				</div>
			</div>
		</header>

		<main class="max-w-5xl mx-auto px-5 pb-24 space-y-14">
			<!-- Highlights -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<h2 class="text-xl font-bold mb-4 underline-accent">Highlights</h2>
					<ul class="grid sm:grid-cols-2 gap-3">
						{#each highlights as h}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-block size-2 rounded-full bg-accent"></span>
								<span class="text-zinc-300">{h}</span>
							</li>
						{/each}
					</ul>
				</div>
			</section>

			<!-- Skills -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<h2 class="text-xl font-bold mb-4 underline-accent">Skills</h2>
					<div class="grid md:grid-cols-3 gap-6">
						{#each skills as group}
							<div>
								<h3 class="text-sm font-semibold text-zinc-300 mb-3">{group.label}</h3>
								<div class="flex flex-wrap gap-2">
									{#each group.items as s}
										<span
											class="rounded-lg border border-zinc-700 bg-surface px-3 py-1.5 text-sm text-zinc-300">{s}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Experience (timeline) -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<div class="flex items-end justify-between gap-4">
						<h2 class="text-xl font-bold underline-accent">Experience</h2>
						<!--						<div class="text-xs text-zinc-400">({compact ? 'condensed' : 'full'})</div>-->
					</div>

					<div class="mt-6 timeline space-y-6">
						{#each experience as job}
							<article class="timeline-item">
								<header class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
									<h3 class="text-lg font-semibold text-zinc-100">
										{job.title}
										<span class="text-accent"> • </span>
										<span class="text-zinc-300">{job.company}</span>
									</h3>
									<div class="text-sm text-zinc-400">{job.period}</div>
								</header>
								<ul class="mt-2 space-y-2">
									{#each job.bullets as b}
										<li class="text-zinc-300 leading-relaxed">• {b}</li>
									{/each}
								</ul>
							</article>
						{/each}
					</div>
				</div>
			</section>

			<!-- Projects -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<h2 class="text-xl font-bold mb-4 underline-accent">Selected Projects</h2>
					<div class="grid md:grid-cols-3 gap-4">
						{#each projects as p}
							<div class="rounded-2xl border border-zinc-700 bg-[--surface-2] p-4">
								<div class="flex items-center justify-between">
									<h3 class="font-semibold">{p.name}</h3>
									<span
										class="text-xs px-2 py-1 rounded justify-start bg-accent/10 text-accent border border-accent/30">{p.year}
									</span>
								</div>
								<p class="mt-2 text-zinc-300">{p.desc}</p>
								<div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
									{#each p.stack as s}
										<span class="rounded-md border border-zinc-700 px-2 py-1">{s}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Education -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<h2 class="text-xl font-bold mb-4 underline-accent">Education</h2>
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div>
							<div class="text-lg font-semibold">{education.degree}</div>
							<div class="text-zinc-300">{education.school}</div>
						</div>
						<div class="text-zinc-400">{education.year}</div>
					</div>
					<p class="mt-3 text-zinc-300">{education.notes}</p>
				</div>
			</section>

			<!-- Footer / Contact -->
			<section class="reveal">
				<div class="card p-6 md:p-8">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h2 class="text-xl font-bold">Let’s build something in real‑time.</h2>
							<p class="text-zinc-300 mt-1">Game Dev • Simulation • DevOps • Graphics • Tools • High-performance
								systems</p>
						</div>
						<div class="flex gap-3">
							<a class="btn" href={"mailto:" + profile.email}>Contact</a>
							<a class="btn-ghost" href="/DakotaCardillo_Resume.pdf" download>Get PDF</a>
						</div>
					</div>
				</div>
			</section>
		</main>

		<footer class="max-w-5xl mx-auto px-5 pb-12 text-sm text-zinc-500">
			© {new Date().getFullYear()} {profile.name}
		</footer>
	</div>

</section>
