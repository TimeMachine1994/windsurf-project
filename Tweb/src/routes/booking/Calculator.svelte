<script lang="ts">
	import Summary from './Summary.svelte';
	import TierSelector from './TierSelector.svelte';
	import ServiceDetailsForm from './ServiceDetailsForm.svelte';
	import AdditionalServicesForm from './AdditionalServicesForm.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import SimplePaymentForm from '$lib/components/SimplePaymentForm.svelte';
	import type {
		CalculatorFormData,
		Tier,
		BookingItem,
		LivestreamConfig
	} from '$lib/types/livestream';
	import type { Memorial } from '$lib/types/memorial';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase/config';
	import { goto } from '$app/navigation';
	import { saveCalculatorState, getCalculatorState, clearCalculatorState, getDefaultFormData } from '$lib/utils/calculatorState';
	import { saveLivestreamConfig, getLivestreamConfig, updatePaymentStatus } from '$lib/firebase/livestream';

	let {
		memorialId,
		data
	}: {
		memorialId: string;
		data: { memorial: Memorial | null; config: LivestreamConfig | null };
	} = $props();

	console.log('🧮 Calculator Component Initializing...', { memorialId, data });
	console.log('🔍 Memorial ID received:', memorialId);
	console.log('🔍 Memorial data:', data.memorial);
	console.log('🔍 Config data:', data.config);

	type Step = 'tier' | 'details' | 'addons' | 'payment';

	let currentStep = $state<Step>('tier');
	const steps: Step[] = ['tier', 'details', 'addons', 'payment'];
	let currentStepIndex = $derived(steps.indexOf(currentStep));

	let clientSecret = $state<string | null>(null);
	let configId = $state<string | null>(null);
	let selectedTier = $state<Tier>(null);

	let formData = $state<CalculatorFormData>(getDefaultFormData());

	onMount(async () => {
		// First priority: Try to load from Firestore if we have a memorial ID
		if (memorialId) {
			try {
				const firestoreConfig = await getLivestreamConfig(memorialId);
				if (firestoreConfig) {
					console.log('🔄 Restoring calculator state from Firestore:', firestoreConfig);
					
					// Check if payment is already completed
					if (firestoreConfig.paymentStatus === 'paid') {
						console.log('💳 Payment already completed, redirecting to schedule');
						alert('Your livestream services have already been paid for. You can view your schedule but cannot make changes. Contact support if you need to modify your booking.');
						await goto('/schedule');
						return;
					}
					
					currentStep = firestoreConfig.currentStep || 'tier';
					formData = firestoreConfig.formData;
					selectedTier = firestoreConfig.bookingItems.find(
						(item) => item.package.includes('Tributestream')
					)?.id as Tier || null;
					return;
				}
			} catch (error) {
				console.error('❌ Error loading Firestore config:', error);
			}
		}

		// Fallback: Try to restore from localStorage
		const savedState = getCalculatorState();
		if (savedState && savedState.memorialId === memorialId) {
			console.log('🔄 Restoring calculator state from localStorage:', savedState);
			currentStep = savedState.currentStep;
			selectedTier = savedState.selectedTier;
			formData = savedState.formData;
		} else if (data.config) {
			console.log('📝 Pre-filling form with existing config data:', data.config);
			formData = data.config.formData;
			const basePackage = data.config.bookingItems.find(
				(item) => item.package.includes('Tributestream')
			);
			if (basePackage) {
				selectedTier = basePackage.id as Tier;
			}
			if (data.config.currentStep) {
				currentStep = data.config.currentStep;
			}
		} else if (data.memorial) {
			console.log('📝 Pre-filling form with memorial data:', data.memorial);
			formData.lovedOneName = data.memorial.lovedOneName;
		}
	});

	$inspect(formData, selectedTier, currentStep, clientSecret, configId);

	// Auto-save state whenever form data changes
	$effect(() => {
		if (memorialId && (selectedTier || formData.lovedOneName || formData.mainService.location.name)) {
			// Save to both Firestore and localStorage for redundancy
			saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
			saveCalculatorState({
				currentStep,
				selectedTier,
				formData,
				memorialId
			});
		}
	});

	const TIER_PRICES: Record<string, number> = {
		solo: 599,
		live: 1299,
		legacy: 1599
	};

	const ADDON_PRICES = {
		photography: 400,
		audioVisualSupport: 200,
		liveMusician: 500,
		woodenUsbDrives: 300 // First one, then 100
	};

	const HOURLY_OVERAGE_RATE = 125;
	const ADDITIONAL_SERVICE_FEE = 325;

	let bookingItems = $derived.by(() => {
		const items: BookingItem[] = [];

		// 1. Base Package
		if (selectedTier) {
			const price = TIER_PRICES[selectedTier];
			console.log(`Tier: ${selectedTier}, Price: ${price}`);
			items.push({
				id: selectedTier,
				name: `Tributestream ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`,
				package: `Tributestream ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`,
				price: price,
				quantity: 1,
				total: price
			});
		}

		// 2. Hourly Overage Charges
		const mainOverageHours = Math.max(0, formData.mainService.hours - 2);
		if (mainOverageHours > 0) {
			items.push({
				id: 'main_overage',
				name: 'Main Location Overage',
				package: 'Add-on',
				price: HOURLY_OVERAGE_RATE,
				quantity: mainOverageHours,
				total: HOURLY_OVERAGE_RATE * mainOverageHours
			});
		}

		// 3. Additional Location
		if (formData.additionalLocation.enabled) {
			items.push({
				id: 'addl_location_fee',
				name: 'Additional Location Fee',
				package: 'Add-on',
				price: ADDITIONAL_SERVICE_FEE,
				quantity: 1,
				total: ADDITIONAL_SERVICE_FEE
			});
			const addlLocationOverage = Math.max(0, formData.additionalLocation.hours - 2);
			if (addlLocationOverage > 0) {
				items.push({
					id: 'addl_location_overage',
					name: 'Add. Location Overage',
					package: 'Add-on',
					price: HOURLY_OVERAGE_RATE,
					quantity: addlLocationOverage,
					total: HOURLY_OVERAGE_RATE * addlLocationOverage
				});
			}
		}

		// 4. Additional Day
		if (formData.additionalDay.enabled) {
			items.push({
				id: 'addl_day_fee',
				name: 'Additional Day Fee',
				package: 'Add-on',
				price: ADDITIONAL_SERVICE_FEE,
				quantity: 1,
				total: ADDITIONAL_SERVICE_FEE
			});
			const addlDayOverage = Math.max(0, formData.additionalDay.hours - 2);
			if (addlDayOverage > 0) {
				items.push({
					id: 'addl_day_overage',
					name: 'Add. Day Overage',
					package: 'Add-on',
					price: HOURLY_OVERAGE_RATE,
					quantity: addlDayOverage,
					total: HOURLY_OVERAGE_RATE * addlDayOverage
				});
			}
		}

		// 5. Add-ons
		if (formData.addons.photography) {
			items.push({
				id: 'photography',
				name: 'Photography',
				package: 'Add-on',
				price: ADDON_PRICES.photography,
				quantity: 1,
				total: ADDON_PRICES.photography
			});
		}
		if (formData.addons.audioVisualSupport) {
			items.push({
				id: 'av_support',
				name: 'Audio/Visual Support',
				package: 'Add-on',
				price: ADDON_PRICES.audioVisualSupport,
				quantity: 1,
				total: ADDON_PRICES.audioVisualSupport
			});
		}
		if (formData.addons.liveMusician) {
			items.push({
				id: 'live_musician',
				name: 'Live Musician',
				package: 'Add-on',
				price: ADDON_PRICES.liveMusician,
				quantity: 1,
				total: ADDON_PRICES.liveMusician
			});
		}
		if (formData.addons.woodenUsbDrives > 0) {
			const isLegacy = selectedTier === 'legacy';
			const usbDrives = formData.addons.woodenUsbDrives;
			const includedDrives = isLegacy ? 1 : 0;

			if (usbDrives > includedDrives) {
				const billableDrives = usbDrives - includedDrives;
				// First billable drive logic
				if (billableDrives > 0 && includedDrives === 0) {
					items.push({
						id: 'usb_drive_first',
						name: 'Wooden USB Drive',
						package: 'Add-on',
						price: ADDON_PRICES.woodenUsbDrives,
						quantity: 1,
						total: ADDON_PRICES.woodenUsbDrives
					});
					if (billableDrives > 1) {
						items.push({
							id: 'usb_drive_additional',
							name: 'Additional Wooden USB Drives',
							package: 'Add-on',
							price: 100,
							quantity: billableDrives - 1,
							total: 100 * (billableDrives - 1)
						});
					}
				} else {
					items.push({
						id: 'usb_drive_additional',
						name: 'Additional Wooden USB Drives',
						package: 'Add-on',
						price: 100,
						quantity: billableDrives,
						total: 100 * billableDrives
					});
				}
			}
		}

		console.log('📝 Booking items recalculated:', items);
		return items;
	});

	let total = $derived(bookingItems.reduce((acc, item) => acc + item.total, 0));

	$inspect(bookingItems, total);

	async function handleTierChange(tier: Tier) {
		console.log('✨ Tier selected:', tier);
		selectedTier = tier;
		// Reset relevant parts of the form when tier changes
		formData.addons = {
			photography: false,
			audioVisualSupport: false,
			liveMusician: false,
			woodenUsbDrives: 0
		};
		// Auto-save state to both Firestore and localStorage
		if (memorialId) {
			await saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
		}
		saveCalculatorState({
			currentStep,
			selectedTier: tier,
			formData,
			memorialId
		});
	}

	async function saveAndPayLater(isPayNowFlow = false) {
		console.log('🚀 saveAndPayLater function called');
		
		try {
			// Validate required data
			if (!selectedTier) {
				console.error('❌ No tier selected!');
				alert('Please select a package tier first.');
				return;
			}
			
			if (!memorialId) {
				console.error('❌ No memorial ID!');
				alert('Memorial ID is required to save configuration.');
				return;
			}
			
			if (bookingItems.length === 0) {
				console.error('❌ No booking items found!');
				return;
			}
			
			if (total <= 0) {
				console.error('❌ Invalid total amount:', total);
				return;
			}
			
			console.log('✅ Data validation passed');
			
			// Save to Firestore
			console.log('💾 Saving to Firestore...');
			const firestoreResult = await saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
			
			if (firestoreResult.success) {
				console.log('🎉 Configuration saved to Firestore successfully!');
				
				// Also save to localStorage as backup
				saveCalculatorState({
					currentStep,
					selectedTier,
					formData,
					memorialId
				});
				
				if (!isPayNowFlow) {
					alert('Configuration saved successfully! Your progress is automatically saved and you can return anytime to continue where you left off.');
				}
			} else {
				console.error('❌ Failed to save to Firestore:', firestoreResult.error);
				alert(`Save failed: ${firestoreResult.error || 'Unknown error'}`);
			}
			
		} catch (error) {
			console.error('💥 Error in saveAndPayLater function:', error);
			alert('An unexpected error occurred. Please try again.');
		}
	}

	async function proceedToPayment() {
		console.log('💳 Proceeding to payment...');
		console.log('📊 Current state:', { memorialId, total, selectedTier, currentStep });
		
		if (!memorialId) {
			console.error('❌ Memorial ID is required to proceed to payment.');
			alert('Memorial ID is missing. Please refresh the page and try again.');
			return;
		}

		if (!total || total <= 0) {
			console.error('❌ Invalid total amount:', total);
			alert('Invalid total amount. Please check your selections.');
			return;
		}

		try {
			console.log('🚀 Creating payment intent with data:', {
				amount: total,
				memorialId,
				customerInfo: {
					name: data.memorial?.creatorName || formData.lovedOneName || '',
					email: data.memorial?.creatorEmail || ''
				}
			});

			// Create Stripe Payment Intent
			const response = await fetch('/api/create-payment-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: total,
					memorialId: memorialId,
					customerInfo: {
						name: data.memorial?.creatorName || formData.lovedOneName || '',
						email: data.memorial?.creatorEmail || ''
					}
				})
			});

			console.log('📡 Response status:', response.status, response.statusText);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('❌ HTTP Error:', response.status, errorText);
				alert(`Payment setup failed: ${response.status} ${response.statusText}`);
				return;
			}

			const result = await response.json();
			console.log('💳 Payment intent response:', result);

			if (result.clientSecret) {
				console.log('✅ Payment intent created successfully!');
				clientSecret = result.clientSecret;
				currentStep = 'payment';
				
				// Save current state
				await saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
				console.log('✅ Navigated to payment step with clientSecret:', clientSecret);
			} else {
				console.error('🔥 Failed to create payment intent:', result);
				alert(`Failed to initialize payment: ${result.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('💥 Error creating payment intent:', error);
			alert('An error occurred while setting up payment. Please try again.');
		}
	}

	async function nextStep() {
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex < steps.length - 1) {
			currentStep = steps[currentIndex + 1];
			// Auto-save state when navigating
			if (memorialId) {
				await saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
			}
			saveCalculatorState({
				currentStep,
				selectedTier,
				formData,
				memorialId
			});
		}
	}

	async function prevStep() {
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex > 0) {
			currentStep = steps[currentIndex - 1];
			// Auto-save state when navigating
			if (memorialId) {
				await saveLivestreamConfig(memorialId, formData, bookingItems, total, currentStep);
			}
			saveCalculatorState({
				currentStep,
				selectedTier,
				formData,
				memorialId
			});
		}
	}

	async function handlePaymentSuccess(event: CustomEvent) {
		console.log('🎉 Payment successful!', event.detail);
		const { paymentIntent } = event.detail;
		
		try {
			// Update payment status in Firestore
			const result = await updatePaymentStatus(memorialId, paymentIntent.id, 'paid');
			
			if (result.success) {
				console.log('✅ Payment status updated in database');
				// Clear calculator state since payment is complete
				clearCalculatorState();
				// Redirect to schedule page to show the locked configuration
				await goto('/schedule');
			} else {
				console.error('❌ Failed to update payment status:', result.error);
				alert('Payment was successful, but there was an issue updating your records. Please contact support.');
			}
		} catch (error) {
			console.error('💥 Error handling payment success:', error);
			alert('Payment was successful, but there was an issue updating your records. Please contact support.');
		}
	}

	async function handlePayNow() {
		console.log('💰 Pay Now button clicked, attempting to save data first...');
		await saveAndPayLater(true);
		currentStep = 'payment';
	}
</script>

<ProgressBar {currentStepIndex} />

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
	<div class="lg:col-span-2 space-y-8">
		{#if currentStep === 'tier'}
			<TierSelector {selectedTier} on:change={(e) => handleTierChange(e.detail)} />
		{:else if currentStep === 'details'}
			<ServiceDetailsForm bind:formData />
		{:else if currentStep === 'addons'}
			<AdditionalServicesForm bind:formData />
		{:else if currentStep === 'payment'}
			<SimplePaymentForm 
				amount={total}
				customerName={data.memorial?.creatorName || formData.lovedOneName || ''}
				customerEmail={data.memorial?.creatorEmail || ''}
				on:success={handlePaymentSuccess}
			/>
		{/if}
	</div>

	<div class="lg:col-span-1">
		<Summary
			{bookingItems}
			{total}
			on:save={() => saveAndPayLater()}
			on:pay={proceedToPayment}
			on:payNow={handlePayNow}
		/>
		<div class="mt-4 flex justify-between">
			<button class="btn btn-secondary" onclick={prevStep} disabled={currentStepIndex === 0}>
				Back
			</button>
			<button class="btn btn-primary" onclick={nextStep} disabled={currentStepIndex === steps.length - 1}>
				Next
			</button>
		</div>
	</div>
</div>

