<script lang="ts">
  import { Calculator, DollarSign, Users, Camera, Clock, Star, MapPin, Calendar } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  // Loading state
  let pageLoaded = true;

  // Original TributeStream pricing structure
  let selectedTier = 'solo';
  let mainServiceHours = 2;
  let additionalLocation = {
    enabled: false,
    hours: 2
  };
  let additionalDay = {
    enabled: false,
    hours: 2
  };
  let addons = {
    photography: false,
    audioVisualSupport: false,
    liveMusician: false,
    woodenUsbDrives: 0
  };

  // Original pricing constants
  const TIER_PRICES = {
    solo: 599,
    live: 1299,
    legacy: 1599
  };

  const ADDON_PRICES = {
    photography: 400,
    audioVisualSupport: 200,
    liveMusician: 500,
    woodenUsbDrives: 300 // First one, then $100 each
  };

  const HOURLY_OVERAGE_RATE = 125;
  const ADDITIONAL_SERVICE_FEE = 325;

  $: bookingItems = calculateBookingItems();
  $: totalPrice = bookingItems.reduce((acc, item) => acc + item.total, 0);

  function calculateBookingItems() {
    const items = [];

    // 1. Base Package
    if (selectedTier) {
      const price = TIER_PRICES[selectedTier];
      items.push({
        name: `Tributestream ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`,
        price: price,
        quantity: 1,
        total: price
      });
    }

    // 2. Main Service Hourly Overage (over 2 hours)
    const mainOverageHours = Math.max(0, mainServiceHours - 2);
    if (mainOverageHours > 0) {
      items.push({
        name: 'Main Location Overage',
        price: HOURLY_OVERAGE_RATE,
        quantity: mainOverageHours,
        total: HOURLY_OVERAGE_RATE * mainOverageHours
      });
    }

    // 3. Additional Location
    if (additionalLocation.enabled) {
      items.push({
        name: 'Additional Location Fee',
        price: ADDITIONAL_SERVICE_FEE,
        quantity: 1,
        total: ADDITIONAL_SERVICE_FEE
      });
      const addlLocationOverage = Math.max(0, additionalLocation.hours - 2);
      if (addlLocationOverage > 0) {
        items.push({
          name: 'Add. Location Overage',
          price: HOURLY_OVERAGE_RATE,
          quantity: addlLocationOverage,
          total: HOURLY_OVERAGE_RATE * addlLocationOverage
        });
      }
    }

    // 4. Additional Day
    if (additionalDay.enabled) {
      items.push({
        name: 'Additional Day Fee',
        price: ADDITIONAL_SERVICE_FEE,
        quantity: 1,
        total: ADDITIONAL_SERVICE_FEE
      });
      const addlDayOverage = Math.max(0, additionalDay.hours - 2);
      if (addlDayOverage > 0) {
        items.push({
          name: 'Add. Day Overage',
          price: HOURLY_OVERAGE_RATE,
          quantity: addlDayOverage,
          total: HOURLY_OVERAGE_RATE * addlDayOverage
        });
      }
    }

    // 5. Add-ons
    if (addons.photography) {
      items.push({
        name: 'Photography',
        price: ADDON_PRICES.photography,
        quantity: 1,
        total: ADDON_PRICES.photography
      });
    }
    if (addons.audioVisualSupport) {
      items.push({
        name: 'Audio/Visual Support',
        price: ADDON_PRICES.audioVisualSupport,
        quantity: 1,
        total: ADDON_PRICES.audioVisualSupport
      });
    }
    if (addons.liveMusician) {
      items.push({
        name: 'Live Musician',
        price: ADDON_PRICES.liveMusician,
        quantity: 1,
        total: ADDON_PRICES.liveMusician
      });
    }
    if (addons.woodenUsbDrives > 0) {
      const isLegacy = selectedTier === 'legacy';
      const usbDrives = addons.woodenUsbDrives;
      const includedDrives = isLegacy ? 1 : 0;

      if (usbDrives > includedDrives) {
        const billableDrives = usbDrives - includedDrives;
        // First billable drive logic
        if (billableDrives > 0 && includedDrives === 0) {
          items.push({
            name: 'Wooden USB Drive',
            price: ADDON_PRICES.woodenUsbDrives,
            quantity: 1,
            total: ADDON_PRICES.woodenUsbDrives
          });
          if (billableDrives > 1) {
            items.push({
              name: 'Additional Wooden USB Drives',
              price: 100,
              quantity: billableDrives - 1,
              total: 100 * (billableDrives - 1)
            });
          }
        } else {
          items.push({
            name: 'Additional Wooden USB Drives',
            price: 100,
            quantity: billableDrives,
            total: 100 * billableDrives
          });
        }
      }
    }

    return items;
  }


  function selectTier(tier: string) {
    selectedTier = tier;
    // Reset addons when changing tiers
    addons = {
      photography: false,
      audioVisualSupport: false,
      liveMusician: false,
      woodenUsbDrives: selectedTier === 'legacy' ? 1 : 0 // Legacy includes 1 USB drive
    };
  }

  function handleBookNow() {
    const bookingData = {
      items: bookingItems,
      total: totalPrice
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(bookingData));
    goto(`/payment?data=${encodedData}`);
  }

  const tiers = [
    {
      name: 'Tributestream Solo',
      alias: 'solo',
      price: 599,
      features: [
        '2 Hours of Broadcast Time',
        'Custom Link',
        'Complimentary Download',
        'One Year Hosting',
        'DIY Livestream Kit'
      ]
    },
    {
      name: 'Tributestream Live',
      alias: 'live',
      price: 1299,
      features: [
        '2 Hours of Broadcast Time',
        'Custom Link',
        'Complimentary Download',
        'One Year Hosting',
        'Professional Videographer',
        'Professional Livestream Tech'
      ]
    },
    {
      name: 'Tributestream Legacy',
      alias: 'legacy',
      price: 1599,
      features: [
        '2 Hours of Broadcast Time',
        'Custom Link',
        'Complimentary Download',
        'One Year Hosting',
        'Professional Videographer',
        'Professional Livestream Tech',
        'Video Editing',
        'Engraved USB Drive and Wooden Keepsake Box'
      ]
    }
  ];
</script>

<svelte:head>
  <title>Price Calculator - TributeStream</title>
  <meta name="description" content="Calculate the cost of your memorial service with our interactive pricing calculator." />
</svelte:head>

  <!-- Hero Section -->
<section class="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
  <div class="max-w-4xl mx-auto text-center">
    <div class="flex items-center justify-center mb-6">
      <Calculator class="h-12 w-12 mr-4" />
      <h1 class="text-4xl md:text-5xl font-bold">TributeStream Calculator</h1>
    </div>
    <p class="text-xl md:text-2xl text-green-100">
      Calculate your livestream memorial service pricing
    </p>
  </div>
</section>

<!-- Calculator Section -->
<section class="py-12 px-4">
  <div class="max-w-6xl mx-auto">
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Configuration Panel -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Package Selection -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Star class="h-6 w-6 mr-2 text-yellow-500" />
            Choose Your TributeStream Package
          </h2>
          
          <div class="grid md:grid-cols-3 gap-4">
            {#each tiers as tier}
              <button 
                class="p-4 border-2 rounded-lg transition-all text-left {selectedTier === tier.alias ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}"
                on:click={() => selectTier(tier.alias)}
              >
                <h3 class="font-bold text-lg mb-2">{tier.name}</h3>
                <p class="text-2xl font-bold text-green-600 mb-3">${tier.price}</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  {#each tier.features as feature}
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  {/each}
                </ul>
              </button>
            {/each}
          </div>
        </div>

        <!-- Service Duration -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock class="h-6 w-6 mr-2 text-blue-500" />
            Service Duration
          </h2>
          
          <div class="space-y-4">
            <div>
              <label for="main-service-hours" class="block text-sm font-medium text-gray-700 mb-2">
                Main Service Hours (2 hours included, ${HOURLY_OVERAGE_RATE}/hour overage)
              </label>
              <input 
                id="main-service-hours"
                type="range" 
                min="1" 
                max="8" 
                step="1"
                bind:value={mainServiceHours}
                class="w-full"
              />
              <div class="flex justify-between text-sm text-gray-600 mt-1">
                <span>1 hour</span>
                <span class="font-medium">{mainServiceHours} hours</span>
                <span>8+ hours</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Locations & Days -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin class="h-6 w-6 mr-2 text-purple-500" />
            Additional Services
          </h2>
          
          <div class="space-y-6">
            <!-- Additional Location -->
            <div class="border rounded-lg p-4">
              <label class="flex items-center justify-between mb-4">
                <div>
                  <span class="font-medium">Additional Location</span>
                  <p class="text-sm text-gray-600">Stream from a second location (+${ADDITIONAL_SERVICE_FEE})</p>
                </div>
                <input 
                  type="checkbox" 
                  bind:checked={additionalLocation.enabled}
                  class="h-5 w-5 text-green-600"
                />
              </label>
              
              {#if additionalLocation.enabled}
                <div>
                  <label for="additional-location-hours" class="block text-sm font-medium text-gray-700 mb-2">
                    Additional Location Hours (2 hours included, ${HOURLY_OVERAGE_RATE}/hour overage)
                  </label>
                  <input 
                    id="additional-location-hours"
                    type="range" 
                    min="1" 
                    max="8" 
                    step="1"
                    bind:value={additionalLocation.hours}
                    class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 hour</span>
                    <span class="font-medium">{additionalLocation.hours} hours</span>
                    <span>8+ hours</span>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Additional Day -->
            <div class="border rounded-lg p-4">
              <label class="flex items-center justify-between mb-4">
                <div>
                  <span class="font-medium">Additional Day</span>
                  <p class="text-sm text-gray-600">Stream on a second day (+${ADDITIONAL_SERVICE_FEE})</p>
                </div>
                <input 
                  type="checkbox" 
                  bind:checked={additionalDay.enabled}
                  class="h-5 w-5 text-green-600"
                />
              </label>
              
              {#if additionalDay.enabled}
                <div>
                  <label for="additional-day-hours" class="block text-sm font-medium text-gray-700 mb-2">
                    Additional Day Hours (2 hours included, ${HOURLY_OVERAGE_RATE}/hour overage)
                  </label>
                  <input 
                    id="additional-day-hours"
                    type="range" 
                    min="1" 
                    max="8" 
                    step="1"
                    bind:value={additionalDay.hours}
                    class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 hour</span>
                    <span class="font-medium">{additionalDay.hours} hours</span>
                    <span>8+ hours</span>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Add-ons -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Camera class="h-6 w-6 mr-2 text-indigo-500" />
            Add-on Services
          </h2>
          
          <div class="space-y-4">
            <label class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <span class="font-medium">Photography</span>
                <p class="text-sm text-gray-600">Professional photography service</p>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 font-bold mr-4">+${ADDON_PRICES.photography}</span>
                <input 
                  type="checkbox" 
                  bind:checked={addons.photography}
                  class="h-5 w-5 text-green-600"
                />
              </div>
            </label>

            <label class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <span class="font-medium">Audio/Visual Support</span>
                <p class="text-sm text-gray-600">Professional A/V technical support</p>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 font-bold mr-4">+${ADDON_PRICES.audioVisualSupport}</span>
                <input 
                  type="checkbox" 
                  bind:checked={addons.audioVisualSupport}
                  class="h-5 w-5 text-green-600"
                />
              </div>
            </label>

            <label class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <span class="font-medium">Live Musician</span>
                <p class="text-sm text-gray-600">Professional live musical performance</p>
              </div>
              <div class="flex items-center">
                <span class="text-green-600 font-bold mr-4">+${ADDON_PRICES.liveMusician}</span>
                <input 
                  type="checkbox" 
                  bind:checked={addons.liveMusician}
                  class="h-5 w-5 text-green-600"
                />
              </div>
            </label>

            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="font-medium">Wooden USB Drives</span>
                  <p class="text-sm text-gray-600">
                    {#if selectedTier === 'legacy'}
                      First drive included with Legacy. Additional drives: first +${ADDON_PRICES.woodenUsbDrives}, then +$100 each
                    {:else}
                      First drive +${ADDON_PRICES.woodenUsbDrives}, additional drives +$100 each
                    {/if}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <label for="usb-drives-quantity" class="block text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <input 
                  id="usb-drives-quantity"
                  type="number" 
                  min="0" 
                  max="10"
                  bind:value={addons.woodenUsbDrives}
                  class="w-20 p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6 sticky top-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <DollarSign class="h-6 w-6 mr-2 text-green-500" />
            Price Breakdown
          </h2>
          
          <div class="space-y-3 mb-6">
            {#each bookingItems as item}
              <div class="flex justify-between text-sm">
                <span class="flex-1">
                  {item.name}
                  {#if item.quantity > 1}
                    <span class="text-gray-500">({item.quantity}x ${item.price})</span>
                  {/if}
                </span>
                <span class="font-medium">${item.total}</span>
              </div>
            {/each}
          </div>
          
          <div class="border-t pt-4">
            <div class="flex justify-between items-center text-2xl font-bold">
              <span>Total</span>
              <span class="text-green-600">${totalPrice}</span>
            </div>
            <p class="text-sm text-gray-600 mt-2">One-time payment</p>
          </div>
          
          <div class="mt-6 space-y-3">
            <button 
              on:click={handleBookNow}
              class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Book Now
            </button>
            <a 
              href="/contact" 
              class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors block text-center"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    outline: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #16a34a;
    border-radius: 50%;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #16a34a;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
</style>
