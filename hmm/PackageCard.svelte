<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { PACKAGES, type PackageKey } from '$lib/data/calculator';
	import { cn, fmt } from '$lib/utils/calculator';

	type Props = {
		selected: boolean;
		pkgKey: PackageKey;
	};
	const { selected, pkgKey }: Props = $props();

	const dispatch = createEventDispatcher<{
		select: void;
	}>();

	const pkg = PACKAGES[pkgKey];

	function onSelect() {
		dispatch('select');
	}
</script>

<div class="card {selected ? 'preset-outlined-primary ring-2 ring-primary-500/40' : 'preset-outlined'} cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-[0.98]" role="button" tabindex="0" onclick={onSelect} onkeydown={(e) => e.key === 'Enter' && onSelect()}>
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="h3">{pkg.name}</h3>
			<p class="text-2xl font-bold text-primary-500">{fmt(pkg.price)}</p>
		</div>
		<div class="badge {selected ? 'preset-filled-primary' : 'preset-tonal-surface'}">
			{selected ? 'Selected' : 'Choose'}
		</div>
	</div>
	<div class="mt-4">
		<p class="text-sm font-medium">What makes it different</p>
		<ul class="mt-1 text-sm list-disc ml-5 space-y-1">
			{#each pkg.unique as u}
				<li>{u}</li>
			{/each}
		</ul>
	</div>
	<details class="mt-3">
		<summary class="text-sm cursor-pointer select-none text-surface-700-300">Common inclusions</summary>
		<ul class="mt-2 text-sm list-disc ml-5 space-y-1 text-surface-700-300">
			{#each pkg.includes as inc}
				<li>{inc}</li>
			{/each}
		</ul>
	</details>
</div>