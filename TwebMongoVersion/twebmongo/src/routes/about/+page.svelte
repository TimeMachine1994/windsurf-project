<script lang="ts">
  // About page component
</script>

<svelte:head>
  <title>About - TributeStream</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">About TributeStream</h1>
    <p class="text-xl text-gray-600">Honoring lives and preserving memories for generations</p>
  </div>

  <div class="grid md:grid-cols-2 gap-12 mb-12">
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        TributeStream provides a beautiful, lasting way to honor the lives of those we've lost. 
        We believe every life has a story worth telling and memories worth preserving.
      </p>
      <p class="text-gray-700 leading-relaxed">
        Our platform allows families and friends to create meaningful digital memorials 
        that celebrate life, share memories, and provide comfort during difficult times.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
      <ul class="space-y-3 text-gray-700">
        <li class="flex items-start gap-3">
          <span class="text-blue-600 mt-1">✓</span>
          <span>Beautiful, customizable memorial pages</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-600 mt-1">✓</span>
          <span>Photo galleries and slideshow features</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-600 mt-1">✓</span>
          <span>Memory sharing and tribute messages</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-600 mt-1">✓</span>
          <span>Privacy controls and family management</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-600 mt-1">✓</span>
          <span>Permanent, secure hosting</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="bg-blue-50 rounded-lg p-8 mb-12">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Creating Lasting Tributes</h2>
      <p class="text-gray-700 leading-relaxed max-w-3xl mx-auto">
        Every memorial on TributeStream is designed to be a lasting tribute that families can 
        visit, share, and contribute to over time. We understand the importance of preserving 
        these precious memories and making them accessible to future generations.
      </p>
    </div>
  </div>

  <div class="text-center">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6">Get Started Today</h2>
    <p class="text-gray-600 mb-8">
      Creating a memorial is simple, meaningful, and free to start.
    </p>
    <div class="space-x-4">
      <a href="/create-memorial" class="btn btn-primary">
        Create Memorial
      </a>
      <a href="/search" class="btn btn-secondary">
        Browse Memorials
      </a>
    </div>
  </div>
</div>

<style>
  .btn {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    text-align: center;
    display: inline-block;
  }

  .btn-primary {
    background-color: rgb(37 99 235);
    color: rgb(255 255 255);
  }
  
  .btn-primary:hover {
    background-color: rgb(29 78 216);
  }

  .btn-secondary {
    border: 1px solid rgb(209 213 219);
    color: rgb(55 65 81);
  }
  
  .btn-secondary:hover {
    background-color: rgb(249 250 251);
  }
</style>
