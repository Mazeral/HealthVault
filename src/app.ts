import express from "express";
import session from "express-session";
import userRouter from "./routes/userRouter";
import medRecordRouter from "./routes/medRecordRouter";
import labRouter from "./routes/labRouter";
import prescriptionRouter from "./routes/prescriptionRouter";
import patientRouter from "./routes/patientRouter";
import authRouter from "./routes/AuthRouter";
import cors from "cors";
import { createClient } from "redis";
import dashboardRouter from "./routes/dashboardRouter";
const { RedisStore } = require("connect-redis");

const app = express();
app.use(express.json());
const port: string = process.env.PORT || "5000";

// Enable CORS for all routes
// Configure CORS to dynamically set the origin
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Dynamically allow the request's origin
      callback(null, origin);
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

// Routes for the application
let redisClient = createClient();
redisClient.connect().catch(console.error);

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err: Error | undefined) => {
  console.error("Redis error:", err);
});

app.use(
  session({
    store: redisStore,
    secret: "your-secret-key", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production (HTTPS only)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use(patientRouter);
app.use(userRouter);
app.use(medRecordRouter);
app.use(labRouter);
app.use(prescriptionRouter);
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);

// Initialize client.

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
