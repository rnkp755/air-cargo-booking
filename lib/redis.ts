import { createClient } from "redis";

class RedisClient {
	private static instance: RedisClient;
	private client: ReturnType<typeof createClient>;
	private isConnected: boolean = false;

	private constructor() {
		this.client = createClient({
			url: process.env.REDIS_URL || "redis://localhost:6379",
			// Add additional config as needed
		});

		this.client.on("error", (err) => {
			console.error("Redis Client Error:", err);
		});

		this.client.on("connect", () => {
			console.log("Redis Client Connected");
			this.isConnected = true;
		});

		this.client.on("disconnect", () => {
			console.log("Redis Client Disconnected");
			this.isConnected = false;
		});
	}

	public static getInstance(): RedisClient {
		if (!RedisClient.instance) {
			RedisClient.instance = new RedisClient();
		}
		return RedisClient.instance;
	}

	public async connect(): Promise<void> {
		if (!this.isConnected) {
			try {
				await this.client.connect();
			} catch (error) {
				console.error("Failed to connect to Redis:", error);
				throw error;
			}
		}
	}

	public async disconnect(): Promise<void> {
		if (this.isConnected) {
			await this.client.close();
		}
	}

	public getClient() {
		return this.client;
	}

	public isClientConnected(): boolean {
		return this.isConnected;
	}
}

export const redisClient = RedisClient.getInstance();
export const redis = redisClient.getClient();
