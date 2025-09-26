import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import profileRoutes from "./routes/profile.route.js";
import defaultListRoutes from "./routes/defaultList.route.js";
// import roomRoutes from "./routes/room.route.js";
// import messageRoutes from "./routes/message.route.js";
import "dotenv/config";
import showRoutes from "./routes/show.route.js";
import reviewRoutes from "./routes/review.route.js";
import replyRoutes from "./routes/reply.route.js";
import listRoutes from "./routes/list.route.js";

const MONGO = process.env.MONGO;

const app = express();

app.use(cors());
app.use(express.json());

console.log(
  "Mongo connection string (MONGO) length:",
  MONGO ? String(MONGO).length : "not set"
);

// connect to mongodb
const connectDB = async () => {
  if (!MONGO) {
    throw new Error("MONGO environment variable not configured");
  }
  try {
    // Use mongoose's connection cache to avoid reconnecting on warm invocations
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      console.log("Mongo already connected");
      return;
    }
    // Connect without passing unsupported legacy options; let the driver pick sensible defaults
    await mongoose.connect(MONGO);
    console.log("Connected to mongodb!");
  } catch (error) {
    console.error(
      "Error connecting to MongoDB:",
      error && error.stack ? error.stack : error
    );
    throw error;
  }
};

app.get("/api/health", (req, res) => {
  res.send("We good");
});

// use user routes
app.use("/api/users", userRoutes);

// use profile routes
app.use("/api/profile", profileRoutes);

// use default list routes
app.use("/api/default-lists", defaultListRoutes);

// use show routes
app.use("/api/shows", showRoutes);

// use review routes
app.use("/api/reviews", reviewRoutes);

// use reply routes
app.use("/api/replies", replyRoutes);

// use list routes
app.use("/api/lists", listRoutes);

// Export app and connectDB for serverless wrapper
export { app, connectDB };
