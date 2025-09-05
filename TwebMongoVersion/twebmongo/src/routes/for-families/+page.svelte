<script lang="ts">
	import { Heart, Camera, Users, Shield, Clock, Star } from 'lucide-svelte';
</script>

<svelte:head>
	<title>For Families - TributeStream</title>
	<meta name="description" content="Create beautiful digital memorials for your loved ones with TributeStream's family-focused memorial services" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-6xl font-bold mb-6">
			For Families
		</h1>
		<p class="text-xl md:text-2xl mb-8 text-blue-100">
			Honor your loved ones with beautiful digital memorials that celebrate their life and legacy
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/create-memorial" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
				Create Memorial
			</a>
			<a href="/register" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors">
				Get Started Free
			</a>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				Everything You Need to Honor a Life
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Our platform provides all the tools families need to create meaningful digital memorials that preserve memories for generations
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Heart class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Beautiful Memorials</h3>
				<p class="text-gray-600">
					Create stunning digital memorials with photos, stories, and memories that truly capture their essence
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Camera class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Photo Galleries</h3>
				<p class="text-gray-600">
					Upload unlimited photos with drag-and-drop ease. Organize them into beautiful galleries and slideshows
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Users class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Family Sharing</h3>
				<p class="text-gray-600">
					Invite family members and friends to contribute photos, stories, and memories together
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Shield class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Privacy Control</h3>
				<p class="text-gray-600">
					Choose who can view and contribute to the memorial with flexible privacy settings
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Clock class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Always Accessible</h3>
				<p class="text-gray-600">
					Your memorial is available 24/7 from anywhere in the world, preserving memories forever
				</p>
			</div>

			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
				<div class="flex justify-center mb-4">
					<Star class="h-12 w-12 text-blue-600" />
				</div>
				<h3 class="text-xl font-semibold mb-3">Easy to Use</h3>
				<p class="text-gray-600">
					No technical skills required. Our intuitive interface makes creating memorials simple and meaningful
				</p>
			</div>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-20 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
				How It Works
			</h2>
			<p class="text-xl text-gray-600">
				Creating a memorial is simple and takes just a few minutes
			</p>
		</div>

		<div class="space-y-12">
			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						1
					</div>
				</div>
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-3">Create Your Memorial</h3>
					<p class="text-gray-600 text-lg">
						Start by entering your loved one's name and basic information. We'll create a beautiful memorial page with a custom URL.
					</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						2
					</div>
				</div>
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-3">Add Photos & Stories</h3>
					<p class="text-gray-600 text-lg">
						Upload photos, write their biography, and share the stories that made them special. Create a lasting tribute to their life.
					</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-shrink-0">
					<div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
						3
					</div>
				</div>
				<div class="flex-1">
					<h3 class="text-2xl font-semibold mb-3">Share & Invite</h3>
					<p class="text-gray-600 text-lg">
						Share the memorial with family and friends. Invite others to contribute their own photos and memories.
					</p>
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
				What Families Say
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
					"TributeStream helped us create a beautiful memorial for my father. The whole family was able to contribute photos and stories. It's become a place we visit often to remember him."
				</p>
				<div class="font-semibold text-gray-900">- Sarah M.</div>
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
					"The platform is so easy to use, even for someone like me who isn't tech-savvy. We created a memorial for my mother that perfectly captures her spirit and all the joy she brought to our lives."
				</p>
				<div class="font-semibold text-gray-900">- Michael R.</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 px-4 bg-blue-600">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
			Start Honoring Your Loved One Today
		</h2>
		<p class="text-xl text-blue-100 mb-8">
			Create a beautiful memorial that celebrates their life and preserves their memory for generations to come.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/create-memorial" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
				Create Memorial Now
			</a>
			<a href="/contact" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors">
				Contact Us
			</a>
		</div>
	</div>
</section>
