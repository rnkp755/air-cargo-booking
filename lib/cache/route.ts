import { redis, redisClient } from "@/lib/redis";
import { format } from "date-fns";
import type { FetchRoutesResponse } from "@/types/route";

export class RouteCacheService {
	private static readonly CACHE_PREFIX = "routes";
	private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

	/**
	 * Generate cache key for route search
	 */
	private static generateCacheKey(
		origin: string,
		destination: string,
		departureDate: Date
	): string {
		const dateStr = format(departureDate, "yyyy-MM-dd");
		return `${this.CACHE_PREFIX}:${origin}:${destination}:${dateStr}`;
	}

	/**
	 * Get cached route data
	 */
	static async get(
		origin: string,
		destination: string,
		departureDate: Date
	): Promise<FetchRoutesResponse | null> {
		try {
			// Ensure Redis is connected
			await redisClient.connect();

			const key = this.generateCacheKey(
				origin,
				destination,
				departureDate
			);
			const cachedData = await redis.get(key);

			if (!cachedData) {
				console.log(`Cache miss for key: ${key}`);
				return null;
			}

			console.log(`Cache hit for key: ${key}`);
			return JSON.parse(cachedData) as FetchRoutesResponse;
		} catch (error) {
			console.error("Error getting data from cache:", error);
			return null; // Return null on cache errors to fallback to DB
		}
	}

	/**
	 * Set route data in cache
	 */
	static async set(
		origin: string,
		destination: string,
		departureDate: Date,
		data: FetchRoutesResponse,
		ttl: number = this.DEFAULT_TTL
	): Promise<void> {
		try {
			// Ensure Redis is connected
			await redisClient.connect();

			const key = this.generateCacheKey(
				origin,
				destination,
				departureDate
			);
			const serializedData = JSON.stringify(data);

			await redis.setEx(key, ttl, serializedData);
			console.log(`Data cached for key: ${key} with TTL: ${ttl}s`);
		} catch (error) {
			console.error("Error setting data in cache:", error);
			// Don't throw error - caching is not critical for functionality
		}
	}

	/**
	 * Delete cached route data
	 */
	static async delete(
		origin: string,
		destination: string,
		departureDate: Date
	): Promise<void> {
		try {
			await redisClient.connect();

			const key = this.generateCacheKey(
				origin,
				destination,
				departureDate
			);
			await redis.del(key);
			console.log(`Cache deleted for key: ${key}`);
		} catch (error) {
			console.error("Error deleting data from cache:", error);
		}
	}

	/**
	 * Delete all cached route data for a specific origin-destination pair
	 */
	static async deleteByRoute(
		origin: string,
		destination: string
	): Promise<void> {
		try {
			await redisClient.connect();

			const pattern = `${this.CACHE_PREFIX}:${origin}:${destination}:*`;
			const keys = await redis.keys(pattern);

			if (keys.length > 0) {
				await redis.del(...keys);
				console.log(
					`Deleted ${keys.length} cache entries for ${origin}-${destination}`
				);
			}
		} catch (error) {
			console.error("Error deleting route cache:", error);
		}
	}

	/**
	 * Clear all route cache (use with caution)
	 */
	static async clearAllRouteCache(): Promise<void> {
		try {
			await RouteCacheService.deleteByRoute("*", "*");
			console.log("All route cache cleared");
		} catch (error) {
			console.error("Error clearing all route cache:", error);
		}
	}

	/**
	 * Get cache statistics
	 */
	static async getCacheStats(): Promise<{
		totalKeys: number;
		routeCacheKeys: number;
	}> {
		try {
			await redisClient.connect();

			const allKeys = await redis.keys("*");
			const routeKeys = await redis.keys(`${this.CACHE_PREFIX}:*`);

			return {
				totalKeys: allKeys.length,
				routeCacheKeys: routeKeys.length,
			};
		} catch (error) {
			console.error("Error getting cache stats:", error);
			return { totalKeys: 0, routeCacheKeys: 0 };
		}
	}
}
