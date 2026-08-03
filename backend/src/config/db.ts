import mongoose from "mongoose";

const MAX_RETRIES = 3;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "❌ MONGODB_URI is not defined in backend/.env. " +
        "Copy backend/.env.example to backend/.env and fill in your Atlas URI."
    );
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("🟢 MongoDB Connected");
  });

  mongoose.connection.on("error", (err) => {
    // Log but DO NOT exit — the server stays alive while mongoose retries.
    console.error("🔴 MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("🟡 MongoDB disconnected — waiting for next operation to reconnect.");
  });

  // Fail fast if the initial connection can't establish within 10s.
  mongoose.set("bufferCommands", false);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        retryWrites: true,
      });
      return;
    } catch (err) {
      const error = err as Error;
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );
      if (attempt === MAX_RETRIES) {
        console.error(
          "❌ Could not connect to MongoDB after multiple attempts. " +
            "Check your MONGODB_URI, network, and that your IP is whitelisted in Atlas."
        );
        process.exit(1);
      }
      // Wait 2s before retrying.
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

