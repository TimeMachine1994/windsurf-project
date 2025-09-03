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

<style>
	.progress-bar {
		display: flex;
		align-items: center;
		width: 100%;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		color: #9ca3af;
		margin-bottom: 2rem;
		list-style: none;
		padding: 0;
		margin-left: 0;
		margin-right: 0;
	}

	.step-item {
		display: flex;
		align-items: center;
		flex: 1;
		position: relative;
	}

	.step-item.active {
		color: #667eea;
	}

	.step-item.has-connector::after {
		content: '';
		position: absolute;
		top: 50%;
		right: 0;
		left: 100%;
		height: 1px;
		background-color: #e5e7eb;
		transform: translateY(-50%);
		z-index: -1;
	}

	.step-item.active.has-connector::after {
		background-color: #667eea;
	}

	.step-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		z-index: 1;
		background: white;
		padding: 0 0.5rem;
	}

	.check-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.step-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background-color: #f3f4f6;
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.step-item.active .step-number {
		background-color: #667eea;
		color: white;
	}

	.step-label {
		font-size: 0.875rem;
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.progress-bar {
			font-size: 0.75rem;
		}

		.step-content {
			flex-direction: column;
			gap: 0.25rem;
			padding: 0 0.25rem;
		}

		.step-label {
			font-size: 0.75rem;
		}

		.step-number {
			width: 1.25rem;
			height: 1.25rem;
			font-size: 0.625rem;
		}

		.check-icon {
			width: 0.875rem;
			height: 0.875rem;
		}
	}

	@media (min-width: 640px) {
		.progress-bar {
			font-size: 1rem;
		}

		.step-item.has-connector::after {
			left: 60%;
			right: -60%;
		}
	}
</style>
