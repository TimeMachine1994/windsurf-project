<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<!-- Footer - Law of Common Region & Miller's Rule (grouped content, limited sections) -->
<footer class="bg-surface-900 text-surface-100 py-16 mt-auto">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Main Footer Content - Law of Proximity (related content grouped) -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
			<!-- Brand Section -->
			<div class="lg:col-span-2 space-y-6">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
						<span class="text-white font-bold">T</span>
					</div>
					<h3 class="text-2xl font-bold text-white">Tributestream</h3>
				</div>
				<p class="text-surface-300 text-lg leading-relaxed max-w-md">
					Honoring memories with professional livestream services for memorial and funeral ceremonies. Connecting families when distance separates.
				</p>
				<div class="flex space-x-4">
					<a href="/contact" 
						class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
						Get Started
					</a>
					<a href="/for-funeral-homes" 
						class="border border-surface-600 hover:border-primary-500 text-surface-300 hover:text-primary-400 px-6 py-3 rounded-lg font-semibold transition-colors">
						For Funeral Homes
					</a>
				</div>
			</div>
			
			<!-- Services Section - Miller's Rule (limited to key services) -->
			<div class="space-y-6">
				<h4 class="text-lg font-semibold text-white">Services</h4>
				<ul class="space-y-3">
					<li>
						<a href="/for-families" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>For Families</span>
						</a>
					</li>
					<li>
						<a href="/for-funeral-homes" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Funeral Homes</span>
						</a>
					</li>
					<li>
						<a href="/create-memorial" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Create Memorial</span>
						</a>
					</li>
					<li>
						<a href="/booking" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Book Livestream</span>
						</a>
					</li>
				</ul>
			</div>
			
			<!-- Support Section -->
			<div class="space-y-6">
				<h4 class="text-lg font-semibold text-white">Support</h4>
				<ul class="space-y-3">
					<li>
						<a href="/contact" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Contact Us</span>
						</a>
					</li>
					<li>
						<a href="/help" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Help Center</span>
						</a>
					</li>
					<li>
						<a href="/privacy" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Privacy Policy</span>
						</a>
					</li>
					<li>
						<a href="/terms" 
							class="text-surface-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
							<span>Terms of Service</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
		
		<!-- Bottom Section - Law of Uniform Connectedness (visually separated) -->
		<div class="border-t border-surface-700 pt-8">
			<div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
				<p class="text-surface-400 text-sm">
					&copy; {currentYear} Tributestream. All rights reserved.
				</p>
				<div class="flex items-center space-x-6">
					<span class="text-surface-500 text-sm">Professional Memorial Services</span>
					<div class="flex items-center space-x-2">
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<span class="text-surface-400 text-sm">Available 24/7</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
