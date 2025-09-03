import type { CalculatorFormData, Tier } from '$lib/types/livestream';

export interface CalculatorState {
	currentStep: 'tier' | 'details' | 'addons' | 'payment';
	selectedTier: Tier;
	formData: CalculatorFormData;
	memorialId: string | null;
	timestamp: number;
}

const STORAGE_KEY = 'tributestream_calculator_state';
const STATE_EXPIRY_HOURS = 24; // State expires after 24 hours

export function saveCalculatorState(state: Partial<CalculatorState>): void {
	try {
		const currentState = getCalculatorState();
		const defaultState: CalculatorState = {
			currentStep: 'tier',
			selectedTier: null,
			formData: getDefaultFormData(),
			memorialId: null,
			timestamp: Date.now()
		};
		
		const newState: CalculatorState = {
			currentStep: state.currentStep ?? currentState?.currentStep ?? defaultState.currentStep,
			selectedTier: state.selectedTier ?? currentState?.selectedTier ?? defaultState.selectedTier,
			formData: state.formData ?? currentState?.formData ?? defaultState.formData,
			memorialId: state.memorialId ?? currentState?.memorialId ?? defaultState.memorialId,
			timestamp: Date.now()
		};
		
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
		console.log('💾 Calculator state saved:', newState);
	} catch (error) {
		console.error('❌ Failed to save calculator state:', error);
	}
}

export function getCalculatorState(): CalculatorState | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;

		const state: CalculatorState = JSON.parse(stored);
		
		// Check if state has expired
		const hoursAgo = (Date.now() - state.timestamp) / (1000 * 60 * 60);
		if (hoursAgo > STATE_EXPIRY_HOURS) {
			console.log('⏰ Calculator state expired, clearing...');
			clearCalculatorState();
			return null;
		}

		console.log('📖 Calculator state loaded:', state);
		return state;
	} catch (error) {
		console.error('❌ Failed to load calculator state:', error);
		return null;
	}
}

export function clearCalculatorState(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
		console.log('🗑️ Calculator state cleared');
	} catch (error) {
		console.error('❌ Failed to clear calculator state:', error);
	}
}

export function getDefaultFormData(): CalculatorFormData {
	return {
		lovedOneName: '',
		mainService: {
			location: { name: '', address: '', isUnknown: false },
			time: { date: null, time: null, isUnknown: false },
			hours: 2
		},
		additionalLocation: {
			enabled: false,
			location: { name: '', address: '', isUnknown: false },
			startTime: null,
			hours: 2
		},
		additionalDay: {
			enabled: false,
			location: { name: '', address: '', isUnknown: false },
			startTime: null,
			hours: 2
		},
		funeralDirectorName: '',
		funeralHome: '',
		addons: {
			photography: false,
			audioVisualSupport: false,
			liveMusician: false,
			woodenUsbDrives: 0
		}
	};
}
