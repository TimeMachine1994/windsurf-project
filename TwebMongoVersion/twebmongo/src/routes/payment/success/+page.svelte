<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { CheckCircle, Download, Mail, Calendar, DollarSign } from 'lucide-svelte';

  let paymentData: any = {};
  let isEmailSent = false;
  let isEmailSending = false;
  let emailError = '';

  onMount(async () => {
    // Parse payment data from URL params
    const urlParams = new URLSearchParams($page.url.search);
    const paymentDataParam = urlParams.get('data');
    
    if (paymentDataParam) {
      try {
        paymentData = JSON.parse(decodeURIComponent(paymentDataParam));
        // Automatically send receipt email
        await sendReceiptEmail();
      } catch (e) {
        console.error('Error parsing payment data:', e);
        goto('/calculator');
      }
    } else {
      goto('/calculator');
    }
  });

  async function sendReceiptEmail() {
    if (isEmailSending || isEmailSent) return;
    
    isEmailSending = true;
    emailError = '';

    try {
      const response = await fetch('/api/email/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (result.success) {
        isEmailSent = true;
      } else {
        emailError = result.error || 'Failed to send receipt email';
      }
    } catch (e) {
      emailError = 'Failed to send receipt email';
    } finally {
      isEmailSending = false;
    }
  }

  function downloadReceipt() {
    const receiptContent = generateReceiptHTML();
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TributeStream-Receipt-${paymentData.paymentIntentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function generateReceiptHTML() {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>TributeStream Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #16a34a; font-size: 24px; font-weight: bold; }
        .receipt-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .items { margin-bottom: 20px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 18px; font-weight: bold; color: #16a34a; text-align: right; padding-top: 20px; border-top: 2px solid #16a34a; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TributeStream</div>
        <h2>Payment Receipt</h2>
    </div>
    
    <div class="receipt-info">
        <h3>Receipt Details</h3>
        <p><strong>Payment ID:</strong> ${paymentData.paymentIntentId}</p>
        <p><strong>Date:</strong> ${date} at ${time}</p>
        <p><strong>Customer:</strong> ${paymentData.customerInfo?.name}</p>
        <p><strong>Email:</strong> ${paymentData.customerInfo?.email}</p>
        ${paymentData.customerInfo?.phone ? `<p><strong>Phone:</strong> ${paymentData.customerInfo.phone}</p>` : ''}
    </div>
    
    <div class="items">
        <h3>Services Ordered</h3>
        ${paymentData.bookingItems?.map(item => `
            <div class="item">
                <span>${item.name}${item.quantity > 1 ? ` (${item.quantity}x $${item.price})` : ''}</span>
                <span>$${item.total}</span>
            </div>
        `).join('') || ''}
    </div>
    
    <div class="total">
        Total Paid: $${paymentData.amount}
    </div>
    
    <div class="footer">
        <p>Thank you for choosing TributeStream!</p>
        <p>For support, contact us at support@tributestream.com</p>
    </div>
</body>
</html>`;
  }
</script>

<svelte:head>
  <title>Payment Success - TributeStream</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4">
  <div class="max-w-2xl mx-auto">
    <!-- Success Header -->
    <div class="text-center mb-8">
      <CheckCircle class="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p class="text-gray-600">Your TributeStream booking has been confirmed</p>
    </div>

    <!-- Receipt Card -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Receipt</h2>
        <span class="text-sm text-gray-500">#{paymentData.paymentIntentId?.slice(-8)}</span>
      </div>

      <!-- Customer Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2">Customer Information</h3>
        <p class="text-gray-700"><strong>Name:</strong> {paymentData.customerInfo?.name}</p>
        <p class="text-gray-700"><strong>Email:</strong> {paymentData.customerInfo?.email}</p>
        {#if paymentData.customerInfo?.phone}
          <p class="text-gray-700"><strong>Phone:</strong> {paymentData.customerInfo.phone}</p>
        {/if}
        <p class="text-gray-700"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <!-- Order Items -->
      <div class="mb-6">
        <h3 class="font-semibold text-gray-900 mb-4">Services Ordered</h3>
        <div class="space-y-3">
          {#each paymentData.bookingItems || [] as item}
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <div class="flex-1">
                <span class="text-gray-900">{item.name}</span>
                {#if item.quantity > 1}
                  <span class="text-gray-500 text-sm">({item.quantity}x ${item.price})</span>
                {/if}
              </div>
              <span class="font-medium text-gray-900">${item.total}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Total -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center text-xl font-bold">
          <span class="flex items-center">
            <DollarSign class="h-5 w-5 mr-1" />
            Total Paid
          </span>
          <span class="text-green-600">${paymentData.amount}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid md:grid-cols-2 gap-4 mb-8">
      <button
        on:click={downloadReceipt}
        class="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        <Download class="h-5 w-5 mr-2" />
        Download Receipt
      </button>

      <button
        on:click={sendReceiptEmail}
        disabled={isEmailSending || isEmailSent}
        class="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        <Mail class="h-5 w-5 mr-2" />
        {#if isEmailSending}
          Sending...
        {:else if isEmailSent}
          Email Sent ✓
        {:else}
          Resend Email
        {/if}
      </button>
    </div>

    <!-- Email Status -->
    {#if isEmailSent}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p class="text-green-700 text-sm flex items-center">
          <CheckCircle class="h-4 w-4 mr-2" />
          Receipt has been sent to {paymentData.customerInfo?.email}
        </p>
      </div>
    {/if}

    {#if emailError}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700 text-sm">{emailError}</p>
      </div>
    {/if}

    <!-- Next Steps -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="font-semibold text-blue-900 mb-3 flex items-center">
        <Calendar class="h-5 w-5 mr-2" />
        What's Next?
      </h3>
      <ul class="text-blue-800 space-y-2 text-sm">
        <li>• Our team will contact you within 24 hours to schedule your service</li>
        <li>• You'll receive a confirmation email with detailed next steps</li>
        <li>• We'll coordinate all technical setup for your livestream</li>
        <li>• A dedicated coordinator will be assigned to your event</li>
      </ul>
    </div>

    <!-- Return Home -->
    <div class="text-center mt-8">
      <a
        href="/"
        class="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
      >
        Return to Home
      </a>
    </div>
  </div>
</div>
