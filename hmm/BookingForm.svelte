<script lang="ts">
	import { Input } from '@skeletonlabs/skeleton-svelte';
	import type { CalculatorFormData } from '$lib/types/livestream';

	let { formData = $bindable() } = $props<{ formData: CalculatorFormData }>();

	console.log('📝 BookingForm Initializing...', { formData });
	$inspect(formData);
</script>

<div class="space-y-8">
	<div class="card preset-outlined p-4 md:p-6 space-y-4">
		<h3 class="h3">In Loving Memory Of</h3>
		<Input
			bind:value={formData.lovedOneName}
			label="Your Loved One's Name"
			placeholder="e.g., Jane Doe"
			required
		/>
	</div>
</div>