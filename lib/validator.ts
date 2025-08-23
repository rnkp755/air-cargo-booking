import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { APIError } from "@/lib/apiResponse";

export async function validateBody<T>(
	req: Request,
	schema: ZodSchema<T>
): Promise<T> {
	try {
		const body = await req.json();
		return schema.parse(body);
	} catch (err: any) {
		if (err.name === "ZodError") {
			throw new APIError(
				"Validation Error: " +
					err.issues.map((e: any) => 
						`[${e.path.join('.')}] ${e.message}`
					).join(", "),
				400
			);
		}
		throw new APIError("Invalid request body", 400);
	}
}
