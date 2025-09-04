<script lang="ts">
	import { Input } from '@skeletonlabs/skeleton-svelte';
	
	type $$Props = {
		label: string;
		required?: boolean;
		class?: string;
		error?: string;
		[key: string]: any;
	};
	let { value = $bindable(), label, required = false, error, ...rest }: $$Props = $props();
</script>

<Input
	bind:value
	{label}
	{required}
	{error}
	{...rest}
	class="{rest.class || ''}"
/>