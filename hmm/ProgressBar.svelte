<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton-svelte';
	
	let { currentStepIndex = 0 } = $props<{ currentStepIndex: number }>();

	const steps = ['Select Tier', 'Service Details', 'Add-ons', 'Payment'];
</script>

<ProgressBar value={currentStepIndex} max={steps.length - 1} class="mb-8">
	<div class="flex justify-between text-sm font-medium mt-2">
		{#each steps as step, i}
			<span class="{i <= currentStepIndex ? 'text-primary-500' : 'text-surface-500'}">
				{step}
			</span>
		{/each}
	</div>
</ProgressBar>