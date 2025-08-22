export class APIResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	timestamp: string;

	constructor(success: boolean, message: string, data?: T) {
		this.success = success;
		this.message = message;
		this.data = data;
		this.timestamp = new Date().toISOString();
	}

	static success<T>(message: string = "Success", data?: T): APIResponse<T> {
		return new APIResponse(true, message, data);
	}

	static error(message: string = "Something went wrong"): APIResponse {
		return new APIResponse(false, message);
	}
}

export class APIError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(
		message: string,
		statusCode: number = 500,
		isOperational: boolean = true
	) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}

	static badRequest(message: string = "Bad Request"): APIError {
		return new APIError(message, 400);
	}

	static unauthorized(message: string = "Unauthorized"): APIError {
		return new APIError(message, 401);
	}

	static forbidden(message: string = "Forbidden"): APIError {
		return new APIError(message, 403);
	}

	static notFound(message: string = "Not Found"): APIError {
		return new APIError(message, 404);
	}

	static conflict(message: string = "Conflict"): APIError {
		return new APIError(message, 409);
	}

	static internal(message: string = "Internal Server Error"): APIError {
		return new APIError(message, 500);
	}
}
