export interface Memorial {
	id: string;
	lovedOneName: string;
	dateOfBirth?: string;
	dateOfPassing?: string;
	biography?: string;
	photoUrl?: string;
	creatorUid: string;
	creatorName?: string;
	creatorEmail?: string;
	customUrl?: string;
	createdAt: Date | { toDate(): Date };
	updatedAt: Date | { toDate(): Date };
	isPublic: boolean;
}
