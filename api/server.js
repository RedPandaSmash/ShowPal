import serverless from "serverless-http";
import { app, connectDB } from "../server/index.js";

// Ensure Mongo connects once per cold start; Vercel may reuse the instance between invocations
let dbConnected = false;

const handler = async (req, res) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error(
        "Failed to connect to database in serverless function:",
        err
      );
      // Return 500 without forwarding to app
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "database connection error" }));
      return;
    }
  }

  // Delegate to Express app via serverless-http
  return serverless(app)(req, res);
};

export default handler;
