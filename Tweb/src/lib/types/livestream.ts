export type Tier = 'solo' | 'live' | 'legacy' | null;

export interface BookingItem {
	id: string;
	name: string;
	package: string;
	price: number;
	quantity: number;
	total: number;
}

export interface LocationData {
	name: string;
	address: string;
	isUnknown: boolean;
}

export interface TimeData {
	date: string | null;
	time: string | null;
	isUnknown: boolean;
}

export interface ServiceData {
	location: LocationData;
	time: TimeData;
	hours: number;
}

export interface AdditionalServiceData {
	enabled: boolean;
	location: LocationData;
	startTime: string | null;
	hours: number;
}

export interface AddonsData {
	photography: boolean;
	audioVisualSupport: boolean;
	liveMusician: boolean;
	woodenUsbDrives: number;
}

export interface CalculatorFormData {
	lovedOneName: string;
	mainService: ServiceData;
	additionalLocation: AdditionalServiceData;
	additionalDay: AdditionalServiceData;
	funeralDirectorName: string;
	funeralHome: string;
	addons: AddonsData;
}

export interface LivestreamConfig {
	id?: string;
	memorialId: string;
	formData: CalculatorFormData;
	bookingItems: BookingItem[];
	total: number;
	currentStep?: 'tier' | 'details' | 'addons' | 'payment';
	createdAt?: Date;
	updatedAt?: Date;
}
