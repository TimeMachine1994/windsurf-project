<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import { CreditCard, Lock, ArrowLeft } from 'lucide-svelte';

  let stripe: any = null;
  let elements: any = null;
  let cardElement: any = null;
  let isLoading = false;
  let error = '';
  let clientSecret = '';
  let paymentIntentId = '';

  // Get booking data from URL params
  let bookingData: any = {};
  let customerInfo = {
    name: '',
    email: '',
    phone: ''
  };

  onMount(async () => {
    // Parse booking data from URL params
    const urlParams = new URLSearchParams($page.url.search);
    const bookingDataParam = urlParams.get('data');
    
    if (bookingDataParam) {
      try {
        bookingData = JSON.parse(decodeURIComponent(bookingDataParam));
      } catch (e) {
        console.error('Error parsing booking data:', e);
        goto('/calculator');
        return;
      }
    } else {
      goto('/calculator');
      return;
    }

    // Initialize Stripe
    stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      error = 'Failed to load Stripe';
      return;
    }

    elements = stripe.elements();
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    });
    cardElement.mount('#card-element');
  });

  async function createPaymentIntent() {
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingItems: bookingData.items,
          totalPrice: bookingData.total,
          customerInfo
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      clientSecret = data.clientSecret;
      paymentIntentId = data.paymentIntentId;
    } catch (e) {
      error = e.message || 'Failed to create payment intent';
    }
  }

  async function handleSubmit() {
    if (!stripe || !cardElement || !customerInfo.name || !customerInfo.email) {
      error = 'Please fill in all required fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Create payment intent if not already created
      if (!clientSecret) {
        await createPaymentIntent();
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        },
      });

      if (stripeError) {
        error = stripeError.message;
      } else if (paymentIntent.status === 'succeeded') {
        // Redirect to success page with payment details
        const successData = {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          customerInfo,
          bookingItems: bookingData.items
        };
        goto(`/payment/success?data=${encodeURIComponent(JSON.stringify(successData))}`);
      }
    } catch (e) {
      error = e.message || 'Payment failed';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Payment - TributeStream</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
      <p class="text-gray-600">Secure payment powered by Stripe</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Order Summary -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CreditCard class="h-5 w-5 mr-2" />
          Order Summary
        </h2>
        
        <div class="space-y-3 mb-6">
          {#each bookingData.items || [] as item}
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
          <div class="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span class="text-green-600">${bookingData.total || 0}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Lock class="h-5 w-5 mr-2" />
          Payment Information
        </h2>

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Customer Information -->
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                bind:value={customerInfo.name}
                required
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                bind:value={customerInfo.email}
                required
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                bind:value={customerInfo.phone}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <!-- Card Information -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Card Information *
            </label>
            <div id="card-element" class="p-3 border border-gray-300 rounded-lg"></div>
          </div>

          {#if error}
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-600 text-sm">{error}</p>
            </div>
          {/if}

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {#if isLoading}
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            {:else}
              Pay ${bookingData.total || 0}
            {/if}
          </button>
        </form>

        <!-- Back to Calculator -->
        <div class="mt-6 text-center">
          <a
            href="/calculator"
            class="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm"
          >
            <ArrowLeft class="h-4 w-4 mr-1" />
            Back to Calculator
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
