<script lang="ts">
	import type { CalculatorFormData } from '$lib/types/livestream';

	let { formData = $bindable() } = $props<{ formData: CalculatorFormData }>();
</script>

<div class="space-y-8">
	<div class="card p-4 md:p-6 space-y-4">
		<h3 class="h3">Funeral Professional Information (Optional)</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>Funeral Director Name</span>
				<input class="input" type="text" bind:value={formData.funeralDirectorName} />
			</label>
			<label class="label">
				<span>Funeral Home</span>
				<input class="input" type="text" bind:value={formData.funeralHome} />
			</label>
		</div>
	</div>

	<div class="card p-4 md:p-6 space-y-6">
		<h3 class="h3">Additional Services</h3>
		<div class="service-toggle">
			<span>Add a second location for the same day?</span>
			<div class="btn-group">
				<button
					class="btn {formData.additionalLocation.enabled ? 'btn-primary' : 'btn-secondary'}"
					onclick={() => {
						formData.additionalLocation.enabled = true;
					}}
				>
					Yes
				</button>
				<button
					class="btn {!formData.additionalLocation.enabled ? 'btn-primary' : 'btn-secondary'}"
					onclick={() => {
						formData.additionalLocation.enabled = false;
					}}
				>
					No
				</button>
			</div>
		</div>

		{#if formData.additionalLocation.enabled}
			<div class="additional-service-card">
				<h4 class="h4">Additional Location Details</h4>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<label class="label">
						<span>Location Name</span>
						<input
							class="input"
							type="text"
							bind:value={formData.additionalLocation.location.name}
						/>
					</label>
					<label class="label">
						<span>Location Address</span>
						<input
							class="input"
							type="text"
							bind:value={formData.additionalLocation.location.address}
						/>
					</label>
					<label class="label">
						<span>Start Time</span>
						<input class="input" type="time" bind:value={formData.additionalLocation.startTime} />
					</label>
				</div>
				<label class="label">
					<span>Number of Hours: <strong>{formData.additionalLocation.hours}</strong></span>
					<input
						type="range"
						bind:value={formData.additionalLocation.hours}
						min="1"
						max="8"
						step="1"
						class="range"
					/>
				</label>
			</div>
		{/if}

		<div class="service-toggle">
			<span>Add another day of service?</span>
			<div class="btn-group">
				<button
					class="btn {formData.additionalDay.enabled ? 'btn-primary' : 'btn-secondary'}"
					onclick={() => {
						formData.additionalDay.enabled = true;
					}}>Yes</button
				>
				<button
					class="btn {!formData.additionalDay.enabled ? 'btn-primary' : 'btn-secondary'}"
					onclick={() => {
						formData.additionalDay.enabled = false;
					}}>No</button
				>
			</div>
		</div>

		{#if formData.additionalDay.enabled}
			<div class="additional-service-card">
				<h4 class="h4">Additional Day Details</h4>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<label class="label">
						<span>Location Name</span>
						<input class="input" type="text" bind:value={formData.additionalDay.location.name} />
					</label>
					<label class="label">
						<span>Location Address</span>
						<input
							class="input"
							type="text"
							bind:value={formData.additionalDay.location.address}
						/>
					</label>
					<label class="label">
						<span>Start Time</span>
						<input class="input" type="time" bind:value={formData.additionalDay.startTime} />
					</label>
				</div>
				<label class="label">
					<span>Number of Hours: <strong>{formData.additionalDay.hours}</strong></span>
					<input
						type="range"
						bind:value={formData.additionalDay.hours}
						min="1"
						max="8"
						step="1"
						class="range"
					/>
				</label>
			</div>
		{/if}
	</div>

	<div class="card p-4 md:p-6 space-y-4">
		<h3 class="h3">Add-ons</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="addon-card">
				<input class="checkbox" type="checkbox" bind:checked={formData.addons.photography} />
				<div class="addon-info">
					<span class="addon-name">Photography</span>
					<span class="addon-price">$400</span>
				</div>
			</label>
			<label class="addon-card">
				<input
					class="checkbox"
					type="checkbox"
					bind:checked={formData.addons.audioVisualSupport}
				/>
				<div class="addon-info">
					<span class="addon-name">Audio/Visual Support</span>
					<span class="addon-price">$200</span>
				</div>
			</label>
			<label class="addon-card">
				<input class="checkbox" type="checkbox" bind:checked={formData.addons.liveMusician} />
				<div class="addon-info">
					<span class="addon-name">Live Musician</span>
					<span class="addon-price">$500</span>
				</div>
			</label>
			<label class="addon-card">
				<input
					type="number"
					bind:value={formData.addons.woodenUsbDrives}
					min="0"
					class="usb-input"
				/>
				<div class="addon-info">
					<span class="addon-name">Wooden USB Drive</span>
					<span class="addon-price">$300 (first) / $100 (each add'l)</span>
				</div>
			</label>
		</div>
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
		margin: 0;
	}

	.h4 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
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

	.service-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.btn-group {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
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

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 1px solid #667eea;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.additional-service-card {
		background: #f0f4ff;
		border-radius: 0.5rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.addon-card {
		background: #f9fafb;
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.addon-card:hover {
		background: #f3f4f6;
	}

	.checkbox {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: #667eea;
		cursor: pointer;
	}

	.usb-input {
		width: 5rem;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		text-align: center;
		font-size: 0.875rem;
	}

	.addon-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.addon-name {
		font-weight: 500;
		color: #374151;
	}

	.addon-price {
		font-size: 0.75rem;
		color: #6b7280;
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

	.space-y-6 > * + * {
		margin-top: 1.5rem;
	}

	.space-y-8 > * + * {
		margin-top: 2rem;
	}

	@media (min-width: 768px) {
		.md\:grid-cols-2 {
			grid-template-columns: repeat(2, 1fr);
		}

		.md\:grid-cols-3 {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
