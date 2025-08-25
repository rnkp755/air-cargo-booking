import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface GenerateAccessTokenPayload {
	id: string;
	email: string;
	role: string;
}

const saltRounds = 8;
export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
	plainPassword: string,
	hashedPassword: string
): Promise<boolean> => {
	return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateAccessToken = async function (
	user: GenerateAccessTokenPayload
): Promise<string> {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
		},
		process.env.ACCESS_TOKEN_SECRET!,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
		}
	);
};

export const generateRefreshToken = async function (
	userId: string
): Promise<string> {
	return jwt.sign(
		{
			id: userId,
		},
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
		}
	);
};
