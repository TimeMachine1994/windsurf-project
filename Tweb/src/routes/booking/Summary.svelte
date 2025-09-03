<script lang="ts">
	import type { BookingItem } from '$lib/types/livestream';
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let { bookingItems, total } = $props<{ bookingItems: BookingItem[]; total: number }>();

	console.log('🧾 Summary Component Initializing...', { bookingItems, total });
	$inspect(bookingItems, total);

	let groupedItems = $derived.by(() => {
		console.log('🔄 Recalculating grouped items...');
		const result = bookingItems.reduce(
			(acc: Record<string, BookingItem[]>, item: BookingItem) => {
				const pkg = item.package;
				if (!acc[pkg]) {
					acc[pkg] = [];
				}
				acc[pkg].push(item);
				return acc;
			},
			{}
		);
		console.log('📦 Grouped items:', result);
		return result;
	});

	let isSticky = $state(false);
	let sentinel: HTMLDivElement;
	let summaryEl;

	onMount(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				isSticky = !entry.isIntersecting;
				console.log('📝 Intersection observer triggered. Is sticky:', !entry.isIntersecting);
			},
			{ threshold: 0 }
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	});
</script>

<div bind:this={sentinel}></div>
<div
	class="summary-card {isSticky ? 'sticky' : ''}"
	bind:this={summaryEl}
>
	{#if isSticky && bookingItems.length > 0}
		<div class="sticky-header">
			<h3 class="sticky-total">Total: <span class="total-amount">${total}</span></h3>
			{#if bookingItems[0]}
				<p class="sticky-subtitle">{bookingItems[0].name}</p>
			{/if}
		</div>
	{:else}
		<h2 class="summary-title">Booking Summary</h2>
	{/if}

	{#if bookingItems.length === 0}
		<p class="empty-state">Please select a package to begin.</p>
	{:else}
		<div class="items-container">
			{#each Object.entries(groupedItems) as [pkg, items]}
				{@const typedItems = items as BookingItem[]}
				<div class="package-group">
					<h4 class="package-title">{pkg}</h4>
					<div class="items-list">
						{#each typedItems as item}
							<div class="item-row">
								<span class="item-name">{item.name} {#if item.quantity > 1}(x{item.quantity}){/if}</span>
								<span class="item-total">${item.total}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
		<hr class="divider" />
		<div class="total-row">
			<h3 class="total-label">Total</h3>
			<span class="total-amount">${total}</span>
		</div>
	{/if}

	<div class="action-buttons">
		<button class="btn btn-secondary" onclick={() => { console.log('💾 Dispatching save event'); dispatch('save'); }}>Save and Pay Later</button>
		<button class="btn btn-secondary" onclick={() => { console.log('💳 Dispatching payNow event'); dispatch('payNow'); }}>Pay Now</button>
		<button class="btn btn-primary full-width" onclick={() => { console.log('💳 Dispatching pay event'); dispatch('pay'); }}>Continue to Payment</button>
	</div>
</div>

<style>
	.summary-card {
		background: #f9fafb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: all 0.3s ease;
	}

	.summary-card.sticky {
		position: sticky;
		top: 1.25rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	}

	.sticky-header {
		text-align: center;
	}

	.sticky-total {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.sticky-subtitle {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.25rem 0 0 0;
	}

	.summary-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #374151;
		text-align: center;
		margin: 0;
	}

	.empty-state {
		text-align: center;
		color: #9ca3af;
		padding: 2rem 0;
		margin: 0;
		font-style: italic;
	}

	.items-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.package-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.package-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #d1d5db;
		padding-bottom: 0.5rem;
		margin: 0;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.item-name {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.item-total {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.divider {
		border: none;
		border-top: 1px solid #d1d5db;
		margin: 0;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.total-label {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.total-amount {
		font-weight: 700;
		color: #667eea;
		font-size: 1.25rem;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		padding-top: 1rem;
	}

	.full-width {
		grid-column: span 2;
	}

	.btn {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		text-align: center;
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
</style>
