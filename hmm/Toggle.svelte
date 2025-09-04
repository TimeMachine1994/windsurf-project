<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	
	let {
		label,
		description = '',
		checked = $bindable(),
		class: className = ''
	} = $props();
</script>

<label class="flex items-center justify-between cursor-pointer {className}">
	<div class="text-sm">
		<p class="font-medium">{label}</p>
		{#if description}
			<p class="text-surface-600-400">{description}</p>
		{/if}
	</div>
	<Switch bind:checked />
</label>