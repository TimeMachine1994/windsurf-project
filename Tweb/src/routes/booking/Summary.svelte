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
		<button class="btn btn-secondary full-width" onclick={() => { console.log('💾 Dispatching save event'); dispatch('save'); }}>Save and Pay Later</button>
		<button class="btn btn-primary full-width" onclick={() => { console.log('💳 Dispatching pay event'); dispatch('pay'); }}>Continue to Payment</button>
	</div>
</div>

