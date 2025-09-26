import { app, connectDB } from "./index.js";

const PORT = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      "Failed to start server:",
      err && err.stack ? err.stack : err
    );
    process.exit(1);
  }
};

start();
