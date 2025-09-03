<script lang="ts">
	import { onMount } from 'svelte';
	
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let isSubmitting = false;
	let submitStatus: 'idle' | 'success' | 'error' = 'idle';
	let errorMessage = '';
	let successMessage = '';

	async function handleSubmit() {
		if (isSubmitting) return;
		
		// Reset status
		submitStatus = 'idle';
		errorMessage = '';
		successMessage = '';
		
		// Basic validation
		if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
			errorMessage = 'Please fill in all fields';
			submitStatus = 'error';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					subject: subject.trim(),
					message: message.trim()
				})
			});

			const result = await response.json();

			if (response.ok) {
				submitStatus = 'success';
				successMessage = result.message || 'Message sent successfully!';
				
				// Reset form
				name = '';
				email = '';
				subject = '';
				message = '';
			} else {
				submitStatus = 'error';
				errorMessage = result.error || 'Failed to send message';
			}
		} catch (error) {
			submitStatus = 'error';
			errorMessage = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// Auto-hide messages after 5 seconds
	$: if (submitStatus === 'success' || submitStatus === 'error') {
		setTimeout(() => {
			submitStatus = 'idle';
			errorMessage = '';
			successMessage = '';
		}, 5000);
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="bg-surface rounded-lg shadow-lg p-8">
		<h2 class="text-3xl font-bold mb-2">Get in Touch</h2>
		<p class="text-secondary mb-8">
			Have questions about our memorial services? We're here to help you create a lasting tribute.
		</p>

		<!-- Status Messages -->
		{#if submitStatus === 'success'}
			<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
				<div class="flex items-center">
					<svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
					</svg>
					<p class="text-green-800 font-medium">{successMessage}</p>
				</div>
			</div>
		{/if}

		{#if submitStatus === 'error'}
			<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<div class="flex items-center">
					<svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
					</svg>
					<p class="text-red-800 font-medium">{errorMessage}</p>
				</div>
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Name and Email Row -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label for="name" class="block text-sm font-medium mb-2">
						Full Name *
					</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="form-input"
						placeholder="Your full name"
						disabled={isSubmitting}
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium mb-2">
						Email Address *
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="form-input"
						placeholder="your@email.com"
						disabled={isSubmitting}
					/>
				</div>
			</div>

			<!-- Subject -->
			<div>
				<label for="subject" class="block text-sm font-medium mb-2">
					Subject *
				</label>
				<input
					type="text"
					id="subject"
					bind:value={subject}
					required
					class="form-input"
					placeholder="How can we help you?"
					disabled={isSubmitting}
				/>
			</div>

			<!-- Message -->
			<div>
				<label for="message" class="block text-sm font-medium mb-2">
					Message *
				</label>
				<textarea
					id="message"
					bind:value={message}
					required
					rows="6"
					class="form-input resize-y"
					placeholder="Tell us about your needs, questions, or how we can assist you..."
					disabled={isSubmitting}
				></textarea>
			</div>

			<!-- Submit Button -->
			<div>
				<button
					type="submit"
					disabled={isSubmitting}
					class="btn btn-primary w-full"
				>
					{#if isSubmitting}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Sending...
					{:else}
						Send Message
					{/if}
				</button>
			</div>
		</form>

		<!-- Contact Info -->
		<div class="mt-8 pt-8 border-t">
			<h3 class="text-lg font-semibold mb-4">Other Ways to Reach Us</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary">
				<div class="flex items-center">
					<svg class="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
					</svg>
					tributestream@tributestream.com
				</div>
				<div class="flex items-center">
					<svg class="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					Response within 24 hours
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom focus styles for better accessibility */
	input:focus,
	textarea:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	/* Smooth transitions */
	button {
		transition: all 0.2s ease-in-out;
	}
	
	button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-primary);
	}
</style>
