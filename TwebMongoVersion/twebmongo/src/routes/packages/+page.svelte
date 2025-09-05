<script lang="ts">
	import { Check, Star, Users, Camera, Clock, Shield } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Packages & Pricing - TributeStream</title>
	<meta name="description" content="Choose the perfect memorial package for your needs. From basic memorials to premium livestreaming services." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-6xl font-bold mb-6">
			Packages & Pricing
		</h1>
		<p class="text-xl md:text-2xl mb-8 text-blue-100">
			Choose the perfect memorial package to honor your loved one's memory
		</p>
	</div>
</section>

<!-- Pricing Cards Section -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Basic Package -->
			<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8 relative">
				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 mb-2">Basic Memorial</h3>
					<p class="text-gray-600 mb-4">Perfect for simple, beautiful memorials</p>
					<div class="text-4xl font-bold text-gray-900 mb-2">Free</div>
					<p class="text-gray-500">Forever</p>
				</div>
				
				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Beautiful memorial page</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Custom memorial URL</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Up to 25 photos</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Biography & life story</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Social sharing</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Mobile responsive</span>
					</li>
				</ul>
				
				<a href="/create-memorial" class="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors block text-center">
					Get Started Free
				</a>
			</div>

			<!-- Premium Package -->
			<div class="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-8 relative">
				<div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Most Popular</span>
				</div>
				
				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Memorial</h3>
					<p class="text-gray-600 mb-4">Enhanced features for lasting memories</p>
					<div class="text-4xl font-bold text-gray-900 mb-2">$49</div>
					<p class="text-gray-500">One-time payment</p>
				</div>
				
				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Everything in Basic</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Unlimited photos</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Photo slideshow</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Family member access</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Guest book & memories</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Custom themes</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Priority support</span>
					</li>
				</ul>
				
				<a href="/create-memorial" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors block text-center">
					Choose Premium
				</a>
			</div>

			<!-- Professional Package -->
			<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8 relative">
				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
					<p class="text-gray-600 mb-4">Full-service memorial with livestreaming</p>
					<div class="text-4xl font-bold text-gray-900 mb-2">$199</div>
					<p class="text-gray-500">One-time payment</p>
				</div>
				
				<ul class="space-y-4 mb-8">
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Everything in Premium</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Live streaming service</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Professional setup</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>HD video recording</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Multi-camera support</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>Dedicated coordinator</span>
					</li>
					<li class="flex items-center">
						<Check class="h-5 w-5 text-green-500 mr-3" />
						<span>24/7 technical support</span>
					</li>
				</ul>
				
				<a href="/contact" class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors block text-center">
					Contact Sales
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Features Comparison -->
<section class="py-20 px-4 bg-gray-50">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Compare Features
			</h2>
			<p class="text-xl text-gray-600">
				See what's included in each package
			</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
							<th class="px-6 py-4 text-center text-sm font-medium text-gray-900">Basic</th>
							<th class="px-6 py-4 text-center text-sm font-medium text-gray-900">Premium</th>
							<th class="px-6 py-4 text-center text-sm font-medium text-gray-900">Professional</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Memorial Page</td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Photo Gallery</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">25 photos</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Family Access</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Guest Book</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Live Streaming</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Professional Setup</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center">-</td>
							<td class="px-6 py-4 text-center"><Check class="h-5 w-5 text-green-500 mx-auto" /></td>
						</tr>
						<tr>
							<td class="px-6 py-4 text-sm text-gray-900">Support</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">Email</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">Priority</td>
							<td class="px-6 py-4 text-center text-sm text-gray-600">24/7 Dedicated</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

<!-- Add-On Services -->
<section class="py-20 px-4">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Add-On Services
			</h2>
			<p class="text-xl text-gray-600">
				Enhance any package with these additional services
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-8">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<Camera class="h-8 w-8 text-blue-600 mr-3" />
					<h3 class="text-xl font-semibold">Professional Photography</h3>
				</div>
				<p class="text-gray-600 mb-4">
					Professional memorial service photography with edited digital gallery delivery.
				</p>
				<div class="text-2xl font-bold text-gray-900">$149</div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<Users class="h-8 w-8 text-blue-600 mr-3" />
					<h3 class="text-xl font-semibold">Extended Family Access</h3>
				</div>
				<p class="text-gray-600 mb-4">
					Allow unlimited family members to contribute photos and memories to the memorial.
				</p>
				<div class="text-2xl font-bold text-gray-900">$29</div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<Clock class="h-8 w-8 text-blue-600 mr-3" />
					<h3 class="text-xl font-semibold">Memorial Maintenance</h3>
				</div>
				<p class="text-gray-600 mb-4">
					Annual maintenance service including updates, backups, and technical support.
				</p>
				<div class="text-2xl font-bold text-gray-900">$49<span class="text-base text-gray-600">/year</span></div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<Shield class="h-8 w-8 text-blue-600 mr-3" />
					<h3 class="text-xl font-semibold">Premium Privacy</h3>
				</div>
				<p class="text-gray-600 mb-4">
					Enhanced privacy controls with password protection and invitation-only access.
				</p>
				<div class="text-2xl font-bold text-gray-900">$19</div>
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
		</div>

		<div class="space-y-8">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">Can I upgrade my package later?</h3>
				<p class="text-gray-600">
					Yes, you can upgrade from Basic to Premium or Professional at any time. You'll only pay the difference in price.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">How long will the memorial stay online?</h3>
				<p class="text-gray-600">
					All memorials remain online permanently at no additional cost. We believe memories should last forever.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">What's included in the livestreaming service?</h3>
				<p class="text-gray-600">
					Our Professional package includes full livestreaming setup, HD recording, multi-camera support, and a dedicated coordinator to ensure everything runs smoothly.
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
				<p class="text-gray-600">
					We offer a 30-day satisfaction guarantee. If you're not completely satisfied with our service, we'll provide a full refund.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 px-4 bg-blue-600">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
			Ready to Create a Memorial?
		</h2>
		<p class="text-xl text-blue-100 mb-8">
			Start with our free Basic package and upgrade anytime as your needs grow.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/create-memorial" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
				Start Free Memorial
			</a>
			<a href="/contact" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors">
				Contact Sales
			</a>
		</div>
	</div>
</section>
