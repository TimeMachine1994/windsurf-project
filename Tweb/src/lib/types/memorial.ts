export interface Memorial {
	id: string;
	lovedOneName: string;
	dateOfBirth?: string;
	dateOfPassing?: string;
	biography?: string;
	photoUrl?: string;
	creatorUid: string;
	createdAt: Date;
	updatedAt: Date;
	isPublic: boolean;
}
