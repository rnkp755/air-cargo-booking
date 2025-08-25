import { z } from "zod";
import { userRoleEnum } from "@/db/schema/users";

export const UserRoleEnum = z.enum(userRoleEnum.enumValues);

export const UserSignupSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	imageUrl: z.url().optional(),
});

export type UserSignupInput = z.infer<typeof UserSignupSchema>;
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserLoginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;
