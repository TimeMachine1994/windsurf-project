<script lang="ts">
	let { currentStepIndex = 0 } = $props<{ currentStepIndex: number }>();

	const steps = ['Select Tier', 'Service Details', 'Add-ons', 'Payment'];
</script>

<ol class="progress-bar">
	{#each steps as step, i}
		<li class="step-item {i <= currentStepIndex ? 'active' : ''} {i < steps.length - 1 ? 'has-connector' : ''}">
			<span class="step-content">
				{#if i < currentStepIndex}
					<svg
						class="check-icon"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
						/>
					</svg>
				{:else}
					<span class="step-number">{i + 1}</span>
				{/if}
				<span class="step-label">{step}</span>
			</span>
		</li>
	{/each}
</ol>

