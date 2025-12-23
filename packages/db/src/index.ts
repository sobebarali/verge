import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function getRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} environment variable is required`);
	}
	return value;
}

const DATABASE_URL = getRequiredEnv("DATABASE_URL");

// Parse database name from connection string, fallback to "verge"
function getDatabaseName(url: string): string {
	try {
		const parsedUrl = new URL(url);
		const pathname = parsedUrl.pathname;
		// Remove leading slash and get database name
		const dbName = pathname.slice(1).split("?")[0];
		return dbName || "verge";
	} catch {
		return "verge";
	}
}

const dbName = getDatabaseName(DATABASE_URL);

// Connection options
const connectionOptions: mongoose.ConnectOptions = {
	maxPoolSize: 10,
	minPoolSize: 2,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
	family: 4, // Use IPv4
};

// Connect with retry logic
async function connectWithRetry(retries = MAX_RETRIES): Promise<void> {
	try {
		await mongoose.connect(DATABASE_URL, connectionOptions);
	} catch (error) {
		if (retries > 0) {
			console.warn(
				`Database connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`,
			);
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
			return connectWithRetry(retries - 1);
		}
		throw error;
	}
}

// Connection event handlers
mongoose.connection.on("connected", () => {
	console.log(`Connected to MongoDB database: ${dbName}`);
});

mongoose.connection.on("error", (err) => {
	console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
	console.warn("MongoDB disconnected");
});

// Connect to database
await connectWithRetry().catch((error) => {
	console.error("Failed to connect to database after retries:", error);
	throw error; // Fail fast - don't continue without database
});

const client = mongoose.connection.getClient().db(dbName);

export { client, mongoose };
