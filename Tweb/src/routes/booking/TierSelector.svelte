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

