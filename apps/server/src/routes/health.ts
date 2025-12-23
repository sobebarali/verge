import type { Context } from "hono";
import mongoose from "mongoose";

interface HealthStatus {
	status: "healthy" | "unhealthy" | "degraded";
	timestamp: string;
	uptime: number;
	version: string;
	checks: {
		database: {
			status: "up" | "down";
			latency?: number;
			error?: string;
		};
	};
}

async function checkDatabase(): Promise<HealthStatus["checks"]["database"]> {
	const start = Date.now();

	try {
		// Check if mongoose is connected
		const state = mongoose.connection.readyState;
		if (state !== 1) {
			return {
				status: "down",
				error: `Connection state: ${getConnectionStateName(state)}`,
			};
		}

		// Ping the database
		await mongoose.connection.db?.admin().ping();
		const latency = Date.now() - start;

		return {
			status: "up",
			latency,
		};
	} catch (error) {
		return {
			status: "down",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

function getConnectionStateName(state: number): string {
	switch (state) {
		case 0:
			return "disconnected";
		case 1:
			return "connected";
		case 2:
			return "connecting";
		case 3:
			return "disconnecting";
		default:
			return "unknown";
	}
}

export async function healthCheck(c: Context) {
	const dbCheck = await checkDatabase();

	const health: HealthStatus = {
		status: dbCheck.status === "up" ? "healthy" : "unhealthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: process.env.npm_package_version || "unknown",
		checks: {
			database: dbCheck,
		},
	};

	const statusCode = health.status === "healthy" ? 200 : 503;
	return c.json(health, statusCode);
}

export async function readinessCheck(c: Context) {
	const dbCheck = await checkDatabase();

	if (dbCheck.status === "up") {
		return c.json({ ready: true }, 200);
	}

	return c.json({ ready: false, reason: "Database not available" }, 503);
}

export function livenessCheck(c: Context) {
	return c.json({ alive: true }, 200);
}
