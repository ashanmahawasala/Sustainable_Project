import mongoose from "mongoose";

const connectDB = async () => {
  // Check if Mongo URI exists
  if (!process.env.MONGO_URI) {
    console.log("⚠️ No Mongo URI provided. Skipping DB connection.");
    return;
  }

  try {
    // Attempt MongoDB connection
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

// Export using ES module syntax
export default connectDB;