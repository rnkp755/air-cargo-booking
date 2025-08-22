import { z } from "zod";
import { userRoleEnum } from "@/db/schema/users";

export const UserRoleEnum = z.enum(userRoleEnum.enumValues);

export const UserSchema = z.object({
	clerkUserId: z.string().min(1, "clerkUserId is required"),
	name: z.string().min(3, "Name must be at least 3 characters"),
	role: UserRoleEnum.optional(),
	imageUrl: z.url().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleEnum>;