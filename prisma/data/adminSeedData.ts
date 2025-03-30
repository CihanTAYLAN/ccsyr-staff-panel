import { EUserStatus } from "@prisma/client";
import { EUserType } from "@prisma/client";
import { IAdmin } from "../data_interfaces";

export const adminSeedData: IAdmin[] = [
	{
		id: "1234-5678-9012-3456",
		name: "Admin",
		email: "admin@ccsyr.org",
		password: "123456",
		userType: EUserType.SUPER_ADMIN,
		status: EUserStatus.ONLINE,
	},
	{
		id: "2345-6789-0123-4567",
		name: "Manager",
		email: "manager@ccsyr.org",
		password: "123456",
		userType: EUserType.MANAGER_ADMIN,
		status: EUserStatus.ONLINE,
	},
	{
		id: "3456-7890-1234-5678",
		name: "Personal",
		email: "personal@ccsyr.org",
		password: "123456",
		userType: EUserType.PERSONAL,
		status: EUserStatus.ONLINE,
	},
];
