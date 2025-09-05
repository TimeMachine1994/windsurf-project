<script lang="ts">
	import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-svelte';
	
	let formData = {
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
		inquiryType: 'general'
	};
	
	let isSubmitting = false;
	let submitMessage = '';
	let submitError = '';
	
	async function handleSubmit() {
		isSubmitting = true;
		submitMessage = '';
		submitError = '';
		
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});
			
			if (response.ok) {
				submitMessage = 'Thank you for your message! We\'ll get back to you within 24 hours.';
				formData = {
					name: '',
					email: '',
					phone: '',
					subject: '',
					message: '',
					inquiryType: 'general'
				};
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			submitError = 'Sorry, there was an error sending your message. Please try again or contact us directly.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contact Us - TributeStream</title>
	<meta name="description" content="Get in touch with TributeStream. We're here to help with your memorial needs and answer any questions." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-6xl font-bold mb-6">
			Contact Us
		</h1>
		<p class="text-xl md:text-2xl mb-8 text-gray-200">
			We're here to help you create meaningful memorials and answer any questions
		</p>
	</div>
</section>

<!-- Contact Information -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
			<div class="text-center">
				<div class="flex justify-center mb-4">
					<Phone class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold mb-2">Phone Support</h3>
				<p class="text-gray-600 mb-2">Mon-Fri, 9AM-6PM EST</p>
				<p class="text-blue-600 font-semibold">1-800-TRIBUTE</p>
				<p class="text-blue-600 font-semibold">(1-800-874-2883)</p>
			</div>

			<div class="text-center">
				<div class="flex justify-center mb-4">
					<Mail class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold mb-2">Email Support</h3>
				<p class="text-gray-600 mb-2">24/7 Response</p>
				<p class="text-blue-600 font-semibold">support@tributestream.com</p>
			</div>

			<div class="text-center">
				<div class="flex justify-center mb-4">
					<MapPin class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold mb-2">Office Location</h3>
				<p class="text-gray-600">123 Memorial Drive<br>Suite 100<br>Boston, MA 02101</p>
			</div>

			<div class="text-center">
				<div class="flex justify-center mb-4">
					<Clock class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold mb-2">Business Hours</h3>
				<p class="text-gray-600">Monday - Friday<br>9:00 AM - 6:00 PM EST<br>Emergency support 24/7</p>
			</div>
		</div>

		<!-- Contact Form and Info Grid -->
		<div class="grid lg:grid-cols-2 gap-12">
			<!-- Contact Form -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
				
				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
								Full Name *
							</label>
							<input
								type="text"
								id="name"
								bind:value={formData.name}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Your full name"
							/>
						</div>
						
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
								Email Address *
							</label>
							<input
								type="email"
								id="email"
								bind:value={formData.email}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="your@email.com"
							/>
						</div>
					</div>

					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
							</label>
							<input
								type="tel"
								id="phone"
								bind:value={formData.phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="(555) 123-4567"
							/>
						</div>
						
						<div>
							<label for="inquiryType" class="block text-sm font-medium text-gray-700 mb-2">
								Inquiry Type
							</label>
							<select
								id="inquiryType"
								bind:value={formData.inquiryType}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="general">General Question</option>
								<option value="support">Technical Support</option>
								<option value="funeral-home">Funeral Home Partnership</option>
								<option value="billing">Billing Question</option>
								<option value="feature">Feature Request</option>
							</select>
						</div>
					</div>

					<div>
						<label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
							Subject *
						</label>
						<input
							type="text"
							id="subject"
							bind:value={formData.subject}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Brief description of your inquiry"
						/>
					</div>

					<div>
						<label for="message" class="block text-sm font-medium text-gray-700 mb-2">
							Message *
						</label>
						<textarea
							id="message"
							bind:value={formData.message}
							required
							rows="6"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Please provide details about your inquiry..."
						></textarea>
					</div>

					{#if submitMessage}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<p class="text-green-800">{submitMessage}</p>
						</div>
					{/if}

					{#if submitError}
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<p class="text-red-800">{submitError}</p>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
					>
						{#if isSubmitting}
							<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Sending...
						{:else}
							<Send class="h-5 w-5 mr-2" />
							Send Message
						{/if}
					</button>
				</form>
			</div>

			<!-- Additional Information -->
			<div class="space-y-8">
				<!-- Quick Help -->
				<div class="bg-blue-50 rounded-lg p-6">
					<h3 class="text-xl font-semibold text-blue-900 mb-4">Need Quick Help?</h3>
					<div class="space-y-4">
						<div>
							<h4 class="font-medium text-blue-800 mb-2">Creating a Memorial</h4>
							<p class="text-blue-700 text-sm">Visit our <a href="/for-families" class="underline">For Families</a> page for step-by-step guidance on creating beautiful memorials.</p>
						</div>
						<div>
							<h4 class="font-medium text-blue-800 mb-2">Funeral Home Partnership</h4>
							<p class="text-blue-700 text-sm">Learn about our professional services on our <a href="/for-funeral-homes" class="underline">For Funeral Homes</a> page.</p>
						</div>
						<div>
							<h4 class="font-medium text-blue-800 mb-2">Pricing Information</h4>
							<p class="text-blue-700 text-sm">View our transparent pricing and packages on our <a href="/packages" class="underline">Packages</a> page.</p>
						</div>
					</div>
				</div>

				<!-- Emergency Support -->
				<div class="bg-red-50 rounded-lg p-6">
					<h3 class="text-xl font-semibold text-red-900 mb-4">Emergency Support</h3>
					<p class="text-red-700 mb-4">
						If you're experiencing technical issues during a live memorial service, please call our emergency support line immediately.
					</p>
					<div class="flex items-center text-red-800 font-semibold">
						<Phone class="h-5 w-5 mr-2" />
						Emergency: 1-800-TRIBUTE (Press 1)
					</div>
				</div>

				<!-- Feedback -->
				<div class="bg-gray-50 rounded-lg p-6">
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Share Your Feedback</h3>
					<p class="text-gray-700 mb-4">
						We're constantly improving TributeStream based on your feedback. Let us know how we can better serve you and your families.
					</p>
					<div class="flex items-center text-gray-800">
						<MessageCircle class="h-5 w-5 mr-2" />
						<span class="font-medium">feedback@tributestream.com</span>
					</div>
				</div>

				<!-- Office Visit -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Visit Our Office</h3>
					<p class="text-gray-700 mb-4">
						We welcome visitors to our Boston office. Please schedule an appointment in advance to ensure someone is available to meet with you.
					</p>
					<div class="space-y-2 text-gray-600">
						<div class="flex items-center">
							<MapPin class="h-4 w-4 mr-2" />
							<span>123 Memorial Drive, Suite 100, Boston, MA 02101</span>
						</div>
						<div class="flex items-center">
							<Clock class="h-4 w-4 mr-2" />
							<span>Monday - Friday, 9:00 AM - 6:00 PM EST</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="py-20 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Frequently Asked Questions
			</h2>
			<p class="text-xl text-gray-600">
				Quick answers to common questions
			</p>
		</div>

		<div class="space-y-6">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">How quickly can you set up a memorial?</h3>
				<p class="text-gray-600">
					Basic memorials can be created immediately online. For Professional packages with livestreaming, we recommend at least 24-48 hours notice, though we can accommodate emergency requests.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">Do you offer 24/7 support?</h3>
				<p class="text-gray-600">
					Yes, we provide 24/7 emergency support for live services and critical technical issues. General support is available Monday-Friday, 9AM-6PM EST, with email support available around the clock.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">Can you help with memorial setup?</h3>
				<p class="text-gray-600">
					Absolutely! Our team can help you set up memorials, upload photos, and configure all settings. Professional package customers receive dedicated setup assistance.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">What if I need to cancel or reschedule a service?</h3>
				<p class="text-gray-600">
					We understand that plans can change during difficult times. Contact us as soon as possible, and we'll work with you to reschedule or modify your service at no additional charge.
				</p>
			</div>
		</div>
	</div>
</section>
