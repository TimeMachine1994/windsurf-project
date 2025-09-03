<script lang="ts">
	import type { CalculatorFormData } from '$lib/types/livestream';

	let { formData = $bindable() } = $props<{ formData: CalculatorFormData }>();
</script>

<div class="card p-4 md:p-6 space-y-4">
	<h3 class="h3">Main Service Details</h3>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
		<label class="label">
			<span>Date of Service</span>
			<input
				class="input"
				type="date"
				bind:value={formData.mainService.time.date}
				disabled={formData.mainService.time.isUnknown}
			/>
		</label>
		<label class="label">
			<span>Time of Livestream</span>
			<input
				class="input"
				type="time"
				bind:value={formData.mainService.time.time}
				disabled={formData.mainService.time.isUnknown}
			/>
		</label>
		<button
			class="btn {formData.mainService.time.isUnknown ? 'btn-primary' : 'btn-secondary'}"
			onclick={() => {
				formData.mainService.time.isUnknown = !formData.mainService.time.isUnknown;
			}}
		>
			Unknown
		</button>
	</div>
	<label class="label">
		<span>Number of Hours (Main Location): <strong>{formData.mainService.hours}</strong></span>
		<input
			type="range"
			bind:value={formData.mainService.hours}
			min="1"
			max="8"
			step="1"
			class="range"
		/>
	</label>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
		<label class="label md:col-span-2">
			<span>Location Name</span>
			<input
				class="input"
				type="text"
				bind:value={formData.mainService.location.name}
				disabled={formData.mainService.location.isUnknown}
				placeholder="e.g., St. Mary's Church"
			/>
		</label>
		<label class="label md:col-span-3">
			<span>Location Address</span>
			<input
				class="input"
				type="text"
				bind:value={formData.mainService.location.address}
				disabled={formData.mainService.location.isUnknown}
				placeholder="123 Main St, Anytown, USA"
			/>
		</label>
		<button
			class="btn {formData.mainService.location.isUnknown ? 'btn-primary' : 'btn-secondary'} md:col-start-3"
			onclick={() => {
				formData.mainService.location.isUnknown = !formData.mainService.location.isUnknown;
			}}
		>
			Unknown
		</button>
	</div>
</div>

<style>
	.card {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem 0;
	}

	.label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label span {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.input {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: border-color 0.2s ease;
	}

	.input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.input:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.range {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: #d1d5db;
		outline: none;
		cursor: pointer;
	}

	.range::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #667eea;
		cursor: pointer;
	}

	.range::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #667eea;
		cursor: pointer;
		border: none;
	}

	.btn {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 1px solid #667eea;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.grid {
		display: grid;
		gap: 1rem;
	}

	.grid-cols-1 {
		grid-template-columns: 1fr;
	}

	.space-y-4 > * + * {
		margin-top: 1rem;
	}

	.items-end {
		align-items: end;
	}

	@media (min-width: 768px) {
		.md\:grid-cols-3 {
			grid-template-columns: repeat(3, 1fr);
		}

		.md\:col-span-2 {
			grid-column: span 2;
		}

		.md\:col-span-3 {
			grid-column: span 3;
		}

		.md\:col-start-3 {
			grid-column-start: 3;
		}
	}
</style>
