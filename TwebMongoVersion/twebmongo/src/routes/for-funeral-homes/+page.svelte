<script lang="ts">
	import { Building2, Users, Shield, Clock, Star, CheckCircle, Phone, Mail } from 'lucide-svelte';
</script>

<svelte:head>
	<title>For Funeral Homes - TributeStream</title>
	<meta name="description" content="Professional memorial services for funeral homes. Enhance your services with digital memorials and livestreaming capabilities." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-6xl font-bold mb-6">
			For Funeral Homes
		</h1>
		<p class="text-xl md:text-2xl mb-8 text-gray-200">
			Enhance your services with professional digital memorials and livestreaming capabilities
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/funeral-director-registration" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
				Join Our Network
			</a>
			<a href="/packages" class="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors">
				View Packages
			</a>
		</div>
	</div>
</section>

<!-- Professional Services Section -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Professional Memorial Services
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Partner with TributeStream to offer your families comprehensive digital memorial services that extend your care beyond the service
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Building2 class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">White-Label Solution</h3>
				<p class="text-gray-600">
					Offer digital memorials under your funeral home's branding with custom domains and styling
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Users class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Family Support</h3>
				<p class="text-gray-600">
					Provide families with tools to create lasting memorials and share memories with loved ones
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Shield class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Secure & Private</h3>
				<p class="text-gray-600">
					Enterprise-grade security with privacy controls that respect family wishes and funeral home policies
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Clock class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">24/7 Availability</h3>
				<p class="text-gray-600">
					Memorials are accessible around the clock, allowing families to visit and remember anytime
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Star class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Professional Support</h3>
				<p class="text-gray-600">
					Dedicated account management and technical support to ensure seamless service delivery
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<CheckCircle class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Easy Integration</h3>
				<p class="text-gray-600">
					Simple setup process that integrates with your existing workflows and funeral home management systems
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Benefits Section -->
<section class="py-20 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Why Partner with TributeStream?
			</h2>
		</div>

		<div class="space-y-12">
			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-4">Extend Your Care</h3>
					<p class="text-gray-600 text-lg mb-4">
						Continue supporting families long after the service ends. Digital memorials provide ongoing comfort and connection, strengthening your relationship with families in their community.
					</p>
					<ul class="space-y-2 text-gray-600">
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Ongoing family engagement</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Enhanced service offerings</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Increased referrals</li>
					</ul>
				</div>
				<div class="flex-shrink-0">
					<div class="w-64 h-48 bg-blue-100 rounded-lg flex items-center justify-center">
						<Users class="h-24 w-24 text-blue-600" />
					</div>
				</div>
			</div>

			<div class="flex flex-col md:flex-row-reverse items-center gap-8">
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-4">Professional Tools</h3>
					<p class="text-gray-600 text-lg mb-4">
						Access professional-grade memorial creation tools, livestreaming capabilities, and administrative controls designed specifically for funeral home operations.
					</p>
					<ul class="space-y-2 text-gray-600">
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Admin dashboard</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Bulk memorial management</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Analytics and reporting</li>
					</ul>
				</div>
				<div class="flex-shrink-0">
					<div class="w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
						<Building2 class="h-24 w-24 text-gray-600" />
					</div>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-4">Revenue Opportunities</h3>
					<p class="text-gray-600 text-lg mb-4">
						Generate additional revenue streams through premium memorial services, livestreaming packages, and ongoing memorial maintenance services.
					</p>
					<ul class="space-y-2 text-gray-600">
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Tiered service packages</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Recurring revenue options</li>
						<li class="flex items-center"><CheckCircle class="h-5 w-5 text-green-500 mr-2" /> Competitive pricing structure</li>
					</ul>
				</div>
				<div class="flex-shrink-0">
					<div class="w-64 h-48 bg-green-100 rounded-lg flex items-center justify-center">
						<Star class="h-24 w-24 text-green-600" />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-20 px-4">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				What Funeral Directors Say
			</h2>
		</div>

		<div class="grid md:grid-cols-2 gap-8">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<div class="flex text-yellow-400">
						{#each Array(5) as _}
							<Star class="h-5 w-5 fill-current" />
						{/each}
					</div>
				</div>
				<p class="text-gray-600 mb-4">
					"TributeStream has transformed how we serve families. The digital memorials provide ongoing comfort and have significantly increased our referrals. The platform is professional and easy to use."
				</p>
				<div class="font-semibold text-gray-900">- Robert Johnson, Johnson Funeral Home</div>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<div class="flex text-yellow-400">
						{#each Array(5) as _}
							<Star class="h-5 w-5 fill-current" />
						{/each}
					</div>
				</div>
				<p class="text-gray-600 mb-4">
					"The livestreaming capabilities have been invaluable, especially during challenging times. Families appreciate being able to include distant relatives and friends in services. It's become an essential part of our offerings."
				</p>
				<div class="font-semibold text-gray-900">- Maria Santos, Santos Family Funeral Services</div>
			</div>
		</div>
	</div>
</section>

<!-- Getting Started Section -->
<section class="py-20 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Getting Started is Simple
			</h2>
		</div>

		<div class="space-y-8">
			<div class="flex flex-col md:flex-row items-center gap-6">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						1
					</div>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h3 class="text-xl font-semibold mb-2">Register Your Funeral Home</h3>
					<p class="text-gray-600">Complete our funeral director registration with your business information and credentials.</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-6">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						2
					</div>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h3 class="text-xl font-semibold mb-2">Account Approval</h3>
					<p class="text-gray-600">Our team reviews your application and approves your professional account within 1-2 business days.</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-6">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						3
					</div>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h3 class="text-xl font-semibold mb-2">Setup & Training</h3>
					<p class="text-gray-600">Access your dashboard, customize your settings, and receive training on all platform features.</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-6">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						4
					</div>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h3 class="text-xl font-semibold mb-2">Start Serving Families</h3>
					<p class="text-gray-600">Begin creating memorials and offering enhanced digital services to the families you serve.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Contact Section -->
<section class="py-20 px-4 bg-blue-600">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
			Ready to Enhance Your Services?
		</h2>
		<p class="text-xl text-blue-100 mb-8">
			Join our network of professional funeral homes and start offering comprehensive digital memorial services today.
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
			<a href="/funeral-director-registration" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
				Register Now
			</a>
			<a href="/contact" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors">
				Contact Sales
			</a>
		</div>

		<div class="grid md:grid-cols-2 gap-8 text-left">
			<div class="bg-blue-700 rounded-lg p-6">
				<div class="flex items-center mb-4">
					<Phone class="h-6 w-6 text-blue-200 mr-3" />
					<h3 class="text-lg font-semibold text-white">Call Us</h3>
				</div>
				<p class="text-blue-100">Speak with our funeral home specialists</p>
				<p class="text-white font-semibold mt-2">1-800-TRIBUTE</p>
			</div>

			<div class="bg-blue-700 rounded-lg p-6">
				<div class="flex items-center mb-4">
					<Mail class="h-6 w-6 text-blue-200 mr-3" />
					<h3 class="text-lg font-semibold text-white">Email Us</h3>
				</div>
				<p class="text-blue-100">Get detailed information and pricing</p>
				<p class="text-white font-semibold mt-2">partners@tributestream.com</p>
			</div>
		</div>
	</div>
</section>
