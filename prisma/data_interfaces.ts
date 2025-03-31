import { EUserStatus, EUserType } from "@prisma/client";

export interface IAdmin {
	id: string;
	email: string;
	password: string;
	name: string;
	userType: EUserType;
	status: EUserStatus;
}

export interface ILocation {
	id: string;
	name: string;
	description: string;
	address: string;
	latitude: number;
	longitude: number;
}
