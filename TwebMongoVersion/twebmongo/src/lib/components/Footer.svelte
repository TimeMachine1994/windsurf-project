<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="bg-gray-900 text-gray-300 mt-8">
  <div class="max-w-7xl mx-auto py-10" style="padding-left: 1rem; padding-right: 1rem;">
    <div class="grid md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-white font-semibold mb-3">TributeStream</h3>
        <p class="text-sm text-gray-400">Honor lives and share memories with beautiful digital memorials.</p>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-3">Quick Links</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="hover:text-white">Home</a></li>
          <li><a href="/memorials" class="hover:text-white">Browse Memorials</a></li>
          <li><a href="/create-memorial" class="hover:text-white">Create Memorial</a></li>
          <li><a href="/about" class="hover:text-white">About</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-3">Support</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/help" class="hover:text-white">Help Center</a></li>
          <li><a href="/contact" class="hover:text-white">Contact Us</a></li>
          <li><a href="/privacy" class="hover:text-white">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-white">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
      © {year} TributeStream. All rights reserved.
    </div>
  </div>
</footer>
