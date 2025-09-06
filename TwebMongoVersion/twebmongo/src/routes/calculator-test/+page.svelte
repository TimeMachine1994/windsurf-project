<script lang="ts">
  let selectedTier = 'solo';
  let totalPrice = 599;
</script>

<svelte:head>
  <title>Calculator Test - TributeStream</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-center mb-8">Calculator Test Page</h1>
    
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-bold mb-4">Selected Tier: {selectedTier}</h2>
      <p class="text-lg">Total Price: ${totalPrice}</p>
      
      <div class="mt-6 space-x-4">
        <button 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          on:click={() => { selectedTier = 'solo'; totalPrice = 599; }}
        >
          Solo ($599)
        </button>
        <button 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          on:click={() => { selectedTier = 'live'; totalPrice = 1299; }}
        >
          Live ($1299)
        </button>
        <button 
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          on:click={() => { selectedTier = 'legacy'; totalPrice = 1599; }}
        >
          Legacy ($1599)
        </button>
      </div>
    </div>
  </div>
</div>
