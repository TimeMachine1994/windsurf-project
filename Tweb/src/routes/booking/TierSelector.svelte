<script lang="ts">
	import type { Tier } from '$lib/types/livestream';
	import { createEventDispatcher } from 'svelte';

	let { selectedTier } = $props<{ selectedTier: Tier }>();
	const dispatch = createEventDispatcher<{ change: Tier }>();

	console.log('👑 TierSelector Initializing...', { selectedTier });

	function selectTier(tier: Tier) {
		console.log('👑 Tier selected:', tier);
		dispatch('change', tier);
	}

	const tiers = [
		{
			name: 'Tributestream Solo',
			alias: 'solo',
			price: 599,
			features: [
				'2 Hours of Broadcast Time',
				'Custom Link',
				'Complimentary Download',
				'One Year Hosting',
				'DIY Livestream Kit'
			]
		},
		{
			name: 'Tributestream Live',
			alias: 'live',
			price: 1299,
			features: [
				'2 Hours of Broadcast Time',
				'Custom Link',
				'Complimentary Download',
				'One Year Hosting',
				'Professional Videographer',
				'Professional Livestream Tech'
			]
		},
		{
			name: 'Tributestream Legacy',
			alias: 'legacy',
			price: 1599,
			features: [
				'2 Hours of Broadcast Time',
				'Custom Link',
				'Complimentary Download',
				'One Year Hosting',
				'Professional Videographer',
				'Professional Livestream Tech',
				'Video Editing',
				'Engraved USB Drive and Wooden Keepsake Box'
			]
		}
	];
</script>

<div class="card p-4 md:p-6">
	<h2 class="h2 text-center mb-6">Choose Your Package</h2>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each tiers as tier}
			<button
				class="tier-card {selectedTier === tier.alias ? 'selected' : ''}"
				onclick={() => dispatch('change', tier.alias as Tier)}
			>
				<h3 class="h3">{tier.name}</h3>
				<p class="price">${tier.price}</p>
				<ul class="features">
					{#each tier.features as feature}
						<li>{feature}</li>
					{/each}
				</ul>
			</button>
		{/each}
	</div>
</div>

<style>
	.card {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.tier-card {
		background: #f9fafb;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.tier-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.tier-card.selected {
		border-color: #667eea;
		background: #f0f4ff;
	}

	.h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.price {
		font-size: 2rem;
		font-weight: 700;
		color: #667eea;
		margin: 0;
	}

	.features {
		list-style: disc;
		list-style-position: inside;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.features li {
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}
		
		.tier-card {
			padding: 1rem;
		}
		
		.price {
			font-size: 1.5rem;
		}
	}
</style>
