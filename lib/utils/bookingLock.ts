// lib/bookingLockUtils.ts
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { eq, sql } from "drizzle-orm";
import { APIError } from "@/lib/apiResponse";

/**
 * Acquires a row-level lock on a booking record and returns the locked booking
 * Uses PostgreSQL's SELECT ... FOR UPDATE to prevent concurrent modifications
 */
export async function lockBookingForUpdate(refId: string) {
	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.refId, refId))
		.for("update"); // This creates a SELECT ... FOR UPDATE lock

	if (!booking) {
		throw APIError.notFound(
			`Booking with reference ID '${refId}' not found`
		);
	}

	return booking;
}

/**
 * Validates if a booking can be cancelled based on its current status
 */
export function validateCancellationEligibility(bookingStatus: string): void {
	const nonCancellableStatuses = ["DELIVERED", "CANCELLED"];

	if (nonCancellableStatuses.includes(bookingStatus)) {
		throw APIError.badRequest(
			`Cannot cancel booking with status '${bookingStatus}'. Only bookings with status 'BOOKED' or 'DEPARTED' can be cancelled.`
		);
	}
}

/**
 * Distributed lock utility using PostgreSQL advisory locks
 * Useful for more complex distributed scenarios
 */
export class DistributedLock {
	private lockKey: string;
	private lockId: number;

	constructor(resourceId: string) {
		// Convert string to a numeric lock ID using hash
		this.lockKey = resourceId;
		this.lockId = this.stringToLockId(resourceId);
	}

	/**
	 * Converts string to a numeric ID for PostgreSQL advisory locks
	 */
	private stringToLockId(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	/**
	 * Acquires a PostgreSQL advisory lock
	 * Returns true if lock acquired, false if already locked
	 */
	async tryLock(): Promise<boolean> {
		console.log(
			`Attempting to acquire lock for ${this.lockKey} with ID ${this.lockId}`
		);

		try {
			const result = await db.execute(
				sql`SELECT pg_try_advisory_lock(${this.lockId}) as acquired`
			);

			return result.rows[0]?.acquired === true;
		} catch (error) {
			console.error(`Failed to acquire lock for ${this.lockKey}:`, error);
			return false;
		}
	}

	/**
	 * Releases the PostgreSQL advisory lock
	 */
	async release(): Promise<void> {
		console.log(
			`Releasing lock for ${this.lockKey} with ID ${this.lockId}`
		);

		try {
			await db.execute(sql`SELECT pg_advisory_unlock(${this.lockId})`);
		} catch (error) {
			console.error(`Failed to release lock for ${this.lockKey}:`, error);
		}
	}

	/**
	 * Executes a function with distributed lock protection
	 */
	async withLock<T>(fn: () => Promise<T>): Promise<T> {
		const lockAcquired = await this.tryLock();

		if (!lockAcquired) {
			throw APIError.conflict(
				`Resource '${this.lockKey}' is currently being modified by another process. Please try again.`
			);
		}

		try {
			return await fn();
		} finally {
			await this.release();
		}
	}
}

/**
 * Higher-order function for booking operations that require locking
 */
export async function withBookingLock<T>(
	refId: string,
	operation: (lockedBooking: any) => Promise<T>
): Promise<T> {
	const lock = new DistributedLock(`booking:${refId}`);

	return await lock.withLock(async () => {
		// Get the locked booking inside the distributed lock
		console.log(`Acquired distributed lock for booking ${refId}`);
		const lockedBooking = await lockBookingForUpdate(refId);
		return await operation(lockedBooking);
	});
}
